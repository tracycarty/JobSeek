import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateApplicationDto {
  @IsNumberString()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(120)
  age: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'phoneNumber must be a valid phone number',
  })
  phoneNumber: string;
}
