import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import type { PaginationQuery } from "./dto/pagination-query.dto.js";
import { Job } from "./job.entity.js";
import { JobsService, type PaginatedJobs } from "./jobs.service.js";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(@Query() query: PaginationQuery): Promise<PaginatedJobs> {
    return this.jobsService.findAll(query);
  }

  @Get("search")
  search(
    @Query("q") q: string | undefined,
    @Query() query: PaginationQuery,
  ): Promise<PaginatedJobs> {
    if (!q || q.trim() === "") {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Query parameter 'q' is required",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.jobsService.search(q, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Job> {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new NotFoundException("Job not found");
    }

    return this.jobsService.findOne(parsedId);
  }
}
