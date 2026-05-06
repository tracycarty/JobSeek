import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';
import { Application, ApplicationStatus } from './application.entity';
import { Job } from '../jobs/job.entity';
import { User, UserRole } from '../user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import type { PaginationQuery } from '../jobs/dto/pagination-query.dto';

export interface ApplicationWithJob extends Omit<Application, 'job'> {
  job?: Partial<Job>;
}

export interface ApplicationSummary {
  id: number;
  jobId: number;
  jobTitle?: string;
  applicantId: number;
  applicantEmail?: string;
  fullName: string;
  address: string;
  age: number;
  status: ApplicationStatus;
  appliedAt: Date;
  resumePath: string;
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
          fullName: true,
          address: true,
          age: true,
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
      fullName: app.fullName,
      address: app.address,
      age: app.age,
      status: app.status,
      appliedAt: app.appliedAt,
      resumePath: app.resumePath,
    }));

    return this.paginatedResponse(data, page, limit, total);
  }

  async getApplicationsByJob(
    jobId: number,
    userId: number,
    query: PaginationQuery,
  ): Promise<PaginatedApplications> {
    // Verify job exists and user is the owner
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // For now, allow access if user role is employer/admin
    // In a real app, check if userId is the job owner

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
      applicantId: app.applicantId,
      applicantEmail: app.applicant?.email,
      fullName: app.fullName,
      address: app.address,
      age: app.age,
      status: app.status,
      appliedAt: app.appliedAt,
      resumePath: app.resumePath,
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

    // TODO: Verify user owns the job
    // For now, basic validation

    application.status = dto.status;
    return this.applicationsRepository.save(application);
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
