import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CertificatedService } from './certificated.service';
import { AddNewCertificatesDto } from './dtos/addNewCertificated.dto';
import { UpdateCertificatedDto } from './dtos/updateCertificated.dto';

@Controller('certificated')
export class CertificatedController {
  private readonly logger = new Logger('CertificatedController');

  constructor(private certificatedService: CertificatedService) {}

  @Post()
  async addNewResumeCertificated(
    @Query('cvId') cvId: string,
    @Body() addNewCertificatesDto: AddNewCertificatesDto,
  ) {
    try {
      const multiCertificated = await Promise.all(
        addNewCertificatesDto.certificated.map(async (item) => {
          const certificated =
            await this.certificatedService.addNewCertificated(item);
          console.log(certificated);
          await this.certificatedService.addResumeCertificated({
            certificatedId: certificated.id,
            cvId,
          });
          return certificated;
        }),
      );
      return multiCertificated;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch()
  public async updateCertificated(
    @Query('id') id: string,
    @Body() updateCertificatedDto: UpdateCertificatedDto,
  ) {
    try {
      const result = await this.certificatedService.UpdateCertificated(
        id,
        updateCertificatedDto,
      );
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
