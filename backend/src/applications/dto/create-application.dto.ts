import { IsNumberString, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateApplicationDto {
  @IsNumberString()
  jobId: string;

  @IsString()
  fullName: string;

  @IsString()
  address: string;

  @IsInt()
  @Min(16)
  @Max(120)
  age: number;
}
