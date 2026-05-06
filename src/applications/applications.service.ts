import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';
import { Application, ApplicationStatus } from './application.entity.js';
import { Job } from '../jobs/job.entity.js';
import { User } from '../user.entity.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import type { PaginationQuery } from '../jobs/dto/pagination-query.dto.js';

export interface ApplicationSummary {
  id: number;
  jobId: number;
  jobTitle?: string;
  jobCompany?: string;
  applicantId: number;
  applicantEmail?: string;
  fullName: string;
  address: string;
  age: number;
  phoneNumber: string;
  status: ApplicationStatus;
  appliedAt: Date;
  resumePath: string;
  coverLetterPath: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApplications {
  data: ApplicationSummary[];
  pagination: PaginationMeta;
}

export interface ApplicationFileDownload {
  path: string;
  filename: string;
}

@Injectable()
export class ApplicationsService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.ensureUploadDirs();
  }

  private ensureUploadDirs() {
    const resumesDir = path.join(this.uploadsDir, 'resumes');
    const coverLettersDir = path.join(this.uploadsDir, 'cover-letters');

    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }
    if (!fs.existsSync(coverLettersDir)) {
      fs.mkdirSync(coverLettersDir, { recursive: true });
    }
  }

  async apply(
    userId: number,
    dto: CreateApplicationDto,
    files: any,
  ): Promise<Application> {
    const jobId = Number(dto.jobId);

    // Validate inputs
    if (!Number.isInteger(jobId) || jobId < 1) {
      throw new BadRequestException('Invalid job ID');
    }

    if (!files?.resume || files.resume.length === 0) {
      throw new BadRequestException('Resume file is required');
    }

    // Check if job exists
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user already applied
    const existingApplication = await this.applicationsRepository.findOne({
      where: { applicantId: userId, jobId },
    });
    if (existingApplication) {
      throw new ConflictException('You have already applied to this job');
    }

    // Save files
    const resumePath = await this.saveUploadedFile(
      files.resume[0],
      'resume',
    );
    let coverLetterPath: string | null = null;
    if (files.coverLetter && files.coverLetter.length > 0) {
      coverLetterPath = await this.saveUploadedFile(
        files.coverLetter[0],
        'cover',
      );
    }

    // Create application
    const application = this.applicationsRepository.create({
      applicantId: userId,
      jobId,
      resumePath,
      coverLetterPath,
      fullName: dto.fullName,
      address: dto.address,
      age: dto.age,
      phoneNumber: dto.phoneNumber,
      status: ApplicationStatus.PENDING,
    });

    return this.applicationsRepository.save(application);
  }

  async getUserApplications(
    userId: number,
    query: PaginationQuery,
  ): Promise<PaginatedApplications> {
    const { page, limit, skip } = this.normalizePagination(query);

    const [applications, total] = await this.applicationsRepository.findAndCount(
      {
        where: { applicantId: userId },
        relations: ['job'],
        select: {
          id: true,
          jobId: true,
          status: true,
          appliedAt: true,
          resumePath: true,
          coverLetterPath: true,
          fullName: true,
          address: true,
          age: true,
          phoneNumber: true,
          job: {
            id: true,
            title: true,
            company: true,
          },
        },
        order: { appliedAt: 'DESC', id: 'DESC' },
        skip,
        take: limit,
      },
    );

    const data = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job?.title,
      applicantId: app.applicantId,
      applicantEmail: app.applicant?.email,
      fullName: app.fullName,
      address: app.address,
      age: app.age,
      phoneNumber: app.phoneNumber,
      status: app.status,
      appliedAt: app.appliedAt,
      resumePath: app.resumePath,
      coverLetterPath: app.coverLetterPath,
    }));

    return this.paginatedResponse(data, page, limit, total);
  }

  async getEmployerApplications(
    employerId: number,
    query: PaginationQuery,
  ): Promise<PaginatedApplications> {
    const { page, limit, skip } = this.normalizePagination(query);

    const [applications, total] = await this.applicationsRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .where('job.employer_id = :employerId', { employerId })
      .orderBy('application.appliedAt', 'DESC')
      .addOrderBy('application.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job?.title,
      jobCompany: app.job?.company,
      applicantId: app.applicantId,
      applicantEmail: app.applicant?.email,
      fullName: app.fullName,
      address: app.address,
      age: app.age,
      phoneNumber: app.phoneNumber,
      status: app.status,
      appliedAt: app.appliedAt,
      resumePath: app.resumePath,
      coverLetterPath: app.coverLetterPath,
    }));

    return this.paginatedResponse(data, page, limit, total);
  }

  async getApplicationsByJob(
    jobId: number,
    userId: number,
    query: PaginationQuery,
  ): Promise<PaginatedApplications> {
    const job = await this.findOwnedJob(jobId, userId);

    const { page, limit, skip } = this.normalizePagination(query);

    const [applications, total] = await this.applicationsRepository.findAndCount(
      {
        where: { jobId },
        relations: ['applicant'],
        select: {
          id: true,
          jobId: true,
          applicantId: true,
          status: true,
          appliedAt: true,
          resumePath: true,
          coverLetterPath: true,
          fullName: true,
          address: true,
          age: true,
          phoneNumber: true,
          applicant: {
            id: true,
            email: true,
          },
        },
        order: { appliedAt: 'DESC', id: 'DESC' },
        skip,
        take: limit,
      },
    );

    const data = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: job.title,
      jobCompany: job.company,
      applicantId: app.applicantId,
      applicantEmail: app.applicant?.email,
      fullName: app.fullName,
      address: app.address,
      age: app.age,
      phoneNumber: app.phoneNumber,
      status: app.status,
      appliedAt: app.appliedAt,
      resumePath: app.resumePath,
      coverLetterPath: app.coverLetterPath,
    }));

    return this.paginatedResponse(data, page, limit, total);
  }

  async updateStatus(
    applicationId: number,
    userId: number,
    dto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employer_id !== userId) {
      throw new ForbiddenException(
        'Only the job owner can update this application',
      );
    }

    application.status = dto.status;
    return this.applicationsRepository.save(application);
  }

  async getApplicationFile(
    applicationId: number,
    userId: number,
    type: 'resume' | 'cover-letter',
  ): Promise<ApplicationFileDownload> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isApplicant = application.applicantId === userId;
    const isEmployer = application.job.employer_id === userId;
    if (!isApplicant && !isEmployer) {
      throw new ForbiddenException('You cannot access this application file');
    }

    const storedPath =
      type === 'resume' ? application.resumePath : application.coverLetterPath;
    if (!storedPath) {
      throw new NotFoundException('File not found');
    }

    const absolutePath = path.resolve(process.cwd(), storedPath);
    const uploadsRoot = path.resolve(this.uploadsDir);
    if (
      absolutePath !== uploadsRoot &&
      !absolutePath.startsWith(`${uploadsRoot}${path.sep}`)
    ) {
      throw new ForbiddenException('Invalid file path');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('File not found');
    }

    return {
      path: absolutePath,
      filename: path.basename(storedPath),
    };
  }

  private async findOwnedJob(jobId: number, employerId: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employer_id !== employerId) {
      throw new ForbiddenException('Only the job owner can view applications');
    }

    return job;
  }

  private async saveUploadedFile(
    file: any,
    type: 'resume' | 'cover',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, DOC, DOCX are allowed',
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(
      this.uploadsDir,
      type === 'resume' ? 'resumes' : 'cover-letters',
      filename,
    );

    try {
      await fs.promises.writeFile(filePath, file.buffer);
      return path.relative(
        process.cwd(),
        filePath,
      );
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }
  }

  private normalizePagination(query: PaginationQuery) {
    const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private paginatedResponse(
    data: ApplicationSummary[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedApplications {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
