import { PartialType } from '@nestjs/swagger';
import { AddNewRésumeDto } from './addNewRésume.dto';

export class UpdateRésumeDto extends PartialType(AddNewRésumeDto) {}
