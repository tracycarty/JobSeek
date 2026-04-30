import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PaginationQuery } from './dto/pagination-query.dto.js';
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
}

export interface PaginatedJobs {
  data: JobSummary[];
  pagination: PaginationMeta;
}

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
      },
      order: { created_at: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

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

    return this.paginatedResponse(jobs, page, limit, total);
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
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
