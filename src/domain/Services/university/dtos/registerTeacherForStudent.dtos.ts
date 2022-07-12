import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterTeacherForStudentDto {
  @IsNotEmpty()
  @IsString()
  studentId: string | null;

  @IsNotEmpty()
  @IsString()
  teacherId: string | null;

  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class RegisterTeacherForStudentsDto {
  teacher: [RegisterTeacherForStudentDto];
}
