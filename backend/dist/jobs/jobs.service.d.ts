import { Repository } from "typeorm";
import { PaginationQuery } from "./dto/pagination-query.dto.js";
import { Job } from "./job.entity.js";
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
export declare class JobsService {
    private readonly jobsRepository;
    constructor(jobsRepository: Repository<Job>);
    findAll(query: PaginationQuery): Promise<PaginatedJobs>;
    search(q: string, query: PaginationQuery): Promise<PaginatedJobs>;
    findOne(id: number): Promise<Job>;
    private normalizePagination;
    private toPositiveInteger;
    private escapeLike;
    private paginatedResponse;
}
