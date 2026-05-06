import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../jwt-auth.guard.js';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import type { PaginationQuery } from '../jobs/dto/pagination-query.dto.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

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
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateApplicationDto,
    @UploadedFiles() files: any,
  ) {
    return this.applicationsService.apply(userId, dto, files);
  }

  @Get('employer')
  async getEmployerApplications(
    @CurrentUser() userId: number,
    @Query() query: PaginationQuery,
  ) {
    return this.applicationsService.getEmployerApplications(userId, query);
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

  @Get(':id/files/:type')
  async downloadApplicationFile(
    @Param('id') id: string,
    @Param('type') type: string,
    @CurrentUser() userId: number,
    @Res() response: Response,
  ) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid application ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (type !== 'resume' && type !== 'cover-letter') {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid file type' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const file = await this.applicationsService.getApplicationFile(
      parsedId,
      userId,
      type,
    );

    return response.download(file.path, file.filename);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() userId: number,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateApplicationStatusDto,
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
