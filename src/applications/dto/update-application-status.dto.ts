import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../application.entity.js';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
