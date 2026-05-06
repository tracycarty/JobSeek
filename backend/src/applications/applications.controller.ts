import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import type { PaginationQuery } from '../jobs/dto/pagination-query.dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'coverLetter', maxCount: 1 },
    ]),
  )
  async apply(
    @CurrentUser() userId: number,
    @Body() dto: CreateApplicationDto,
    @UploadedFiles() files: any,
  ) {
    return this.applicationsService.apply(userId, dto, files);
  }

  @Get('me')
  async getUserApplications(
    @CurrentUser() userId: number,
    @Query() query: PaginationQuery,
  ) {
    return this.applicationsService.getUserApplications(userId, query);
  }

  @Get('job/:jobId')
  async getApplicationsByJob(
    @Param('jobId') jobId: string,
    @CurrentUser() userId: number,
    @Query() query: PaginationQuery,
  ) {
    const parsedJobId = Number(jobId);

    if (!Number.isInteger(parsedJobId) || parsedJobId < 1) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid job ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.applicationsService.getApplicationsByJob(
      parsedJobId,
      userId,
      query,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() userId: number,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid application ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.applicationsService.updateStatus(parsedId, userId, dto);
  }
}
