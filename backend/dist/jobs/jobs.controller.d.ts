import type { PaginationQuery } from "./dto/pagination-query.dto.js";
import { Job } from "./job.entity.js";
import { JobsService, type PaginatedJobs } from "./jobs.service.js";
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(query: PaginationQuery): Promise<PaginatedJobs>;
    search(q: string | undefined, query: PaginationQuery): Promise<PaginatedJobs>;
    findOne(id: string): Promise<Job>;
}
