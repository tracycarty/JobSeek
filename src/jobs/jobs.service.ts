import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PaginationQuery } from './dto/pagination-query.dto.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { Job } from './job.entity.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobSummary {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  status: string;
}

export interface PaginatedJobs {
  data: JobSummary[];
  pagination: PaginationMeta;
}

const fallbackJobs = [
  {
    id: 1,
    title: 'Software Developer',
    company: 'Tech Corp',
    location: 'Cagayan de Oro',
    salary: 'PHP 30,000',
    status: 'Open',
    description:
      'Build and maintain web applications with a small product team focused on reliable hiring tools.',
    employer_id: null,
    created_at: new Date('2026-04-30T12:00:00.000Z'),
  },
  {
    id: 2,
    title: 'Customer Support Specialist',
    company: 'Northstar Careers',
    location: 'Remote',
    salary: 'PHP 24,000',
    status: 'Open',
    description:
      'Help applicants and employers resolve account, posting, and interview scheduling questions.',
    employer_id: null,
    created_at: new Date('2026-04-29T09:30:00.000Z'),
  },
  {
    id: 3,
    title: 'Junior QA Tester',
    company: 'BrightByte',
    location: 'Davao City',
    salary: 'PHP 22,000',
    status: 'Open',
    description:
      'Test new releases, write clear bug reports, and support regression checks before launch.',
    employer_id: null,
    created_at: new Date('2026-04-28T08:15:00.000Z'),
  },
] as Job[];

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async findAll(query: PaginationQuery): Promise<PaginatedJobs> {
    const { page, limit, skip } = this.normalizePagination(query);

    const [jobs, total] = await this.jobsRepository.findAndCount({
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        salary: true,
        status: true,
      },
      order: { created_at: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

    if (total === 0) {
      return this.paginatedResponse(
        this.paginate(fallbackJobs, skip, limit),
        page,
        limit,
        fallbackJobs.length,
      );
    }

    return this.paginatedResponse(jobs, page, limit, total);
  }

  async search(q: string, query: PaginationQuery): Promise<PaginatedJobs> {
    const { page, limit, skip } = this.normalizePagination(query);
    const keyword = `%${this.escapeLike(q.trim())}%`;

    const searchQuery = this.jobsRepository
      .createQueryBuilder('job')
      .select([
        'job.id',
        'job.title',
        'job.company',
        'job.location',
        'job.salary',
        'job.status',
      ])
      .where(
        new Brackets((qb) => {
          qb.where("job.title LIKE :keyword ESCAPE '\\\\'", { keyword })
            .orWhere("job.company LIKE :keyword ESCAPE '\\\\'", { keyword })
            .orWhere("job.location LIKE :keyword ESCAPE '\\\\'", { keyword });
        }),
      )
      .orderBy('job.created_at', 'DESC')
      .addOrderBy('job.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [jobs, total] = await searchQuery.getManyAndCount();

    if (total === 0) {
      const normalizedQuery = q.trim().toLowerCase();
      const matches = fallbackJobs.filter((job) =>
        [job.title, job.company, job.location].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        ),
      );

      return this.paginatedResponse(
        this.paginate(matches, skip, limit),
        page,
        limit,
        matches.length,
      );
    }

    return this.paginatedResponse(jobs, page, limit, total);
  }

  async findEmployerJobs(employerId: number): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { employer_id: employerId },
      order: { created_at: 'DESC', id: 'DESC' },
    });
  }

  async create(createJobDto: CreateJobDto, employerId: number): Promise<Job> {
    const newJob = this.jobsRepository.create({
      ...createJobDto,
      salary: createJobDto.salary || null,
      employer_id: employerId,
    });

    return this.jobsRepository.save(newJob);
  }

  async update(
    id: number,
    updateJobDto: UpdateJobDto,
    employerId: number,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employer_id !== employerId) {
      throw new ForbiddenException('Only the job owner can update this job');
    }

    Object.assign(job, {
      ...updateJobDto,
      salary:
        updateJobDto.salary === undefined ? job.salary : updateJobDto.salary,
    });

    return this.jobsRepository.save(job);
  }

  async remove(id: number, employerId: number): Promise<{ message: string }> {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employer_id !== employerId) {
      throw new ForbiddenException('Only the job owner can delete this job');
    }

    await this.jobsRepository.remove(job);
    return { message: 'Job deleted successfully' };
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (job) {
      return job;
    }

    const fallbackJob = fallbackJobs.find((candidate) => candidate.id === id);

    if (!fallbackJob) {
      throw new NotFoundException('Job not found');
    }

    return fallbackJob;
  }

  private normalizePagination(query: PaginationQuery) {
    const page = this.toPositiveInteger(query.page, 1);
    const limit = this.toPositiveInteger(query.limit, 10);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private toPositiveInteger(
    value: string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return fallback;
    }

    return parsed;
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }

  private paginate<T>(items: T[], skip: number, limit: number): T[] {
    return items.slice(skip, skip + limit);
  }

  private paginatedResponse(
    jobs: JobSummary[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedJobs {
    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}
