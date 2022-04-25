import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class FilterStudentDto {
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  status?: string;
  // constructor() {
  //   this.identityNumber = null;
  //   this.firstName = null;
  //   this.limit = null;
  //   this.offset = null;
  //   this.lastName = null;
  //   this.status = null;
  // }
}
