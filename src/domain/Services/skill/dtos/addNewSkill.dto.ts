import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class AddNewSkillDto {
  @IsString()
  @IsNotEmpty()
  name?: string | null;

  @IsNumber()
  @IsNotEmpty()
  rating?: number | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string | null;
}

export class AddNewSkillsDto {
  skills: [AddNewSkillDto];
}
