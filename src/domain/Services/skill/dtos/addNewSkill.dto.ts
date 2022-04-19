import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddNewSkillDto {
  @IsString()
  @IsNotEmpty()
  name?: string | null;

  @IsNumber()
  @IsNotEmpty()
  rating?: number | null;

  @IsString()
  @IsNotEmpty()
  slug?: string | null;
}

export class AddNewSkillsDto {
  skills: [AddNewSkillDto];
}
