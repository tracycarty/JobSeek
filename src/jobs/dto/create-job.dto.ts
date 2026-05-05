import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  salary?: string | null;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  @IsIn(['Open', 'Closed', 'Review'])
  status?: 'Open' | 'Closed' | 'Review';
}
