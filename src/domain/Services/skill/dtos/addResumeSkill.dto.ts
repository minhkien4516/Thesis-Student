import { IsNotEmpty, IsString } from 'class-validator';

export class AddResumeSkillDto {
  @IsNotEmpty()
  @IsString()
  cvId!: string;

  @IsNotEmpty()
  @IsString()
  skillsId!: string;
}
