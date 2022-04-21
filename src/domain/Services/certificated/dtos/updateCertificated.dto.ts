import { PartialType } from '@nestjs/swagger';
import { AddNewCertificatedDto } from './addNewCertificated.dto';

export class UpdateCertificatedDto extends PartialType(AddNewCertificatedDto) {}
