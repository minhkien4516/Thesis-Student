import { IsNotEmpty, IsString } from 'class-validator';

export class AddStudentResumeDto {
  @IsNotEmpty()
  @IsString()
  cvId!: string;

  @IsNotEmpty()
  @IsString()
  studentId!: string;
}
