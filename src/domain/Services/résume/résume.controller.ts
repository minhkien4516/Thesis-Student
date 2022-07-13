import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { firstValueFrom, timeout } from 'rxjs';
import { FilesService } from '../files/files.service';
import { RésumeService } from './résume.service';
import {
  GetAllForOwnerResponse,
  RésumeFilter,
  RésumeFilterResponse,
  UploadFilesForOwnerResponse,
} from '../../interfaces';
import { AddNewRésumeDto } from './dtos/addNewRésume.dto';
import { UpdateRésumeDto } from './dtos/updateRésume.dto';
import { defaultTimeout } from '../../../common/constants/timeout.constant';

@Controller('resume')
export class RésumeController {
  private readonly logger = new Logger('RésumeController');

  constructor(
    private readonly résumeService: RésumeService,
    private readonly fileService: FilesService,
  ) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  public async addNewRésume(
    @Query('studentId') studentId: string,
    @Body() addNewRésume: AddNewRésumeDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ): Promise<RésumeFilter[]> {
    console.log(files);
    console.log(files.files);

    try {
      const result = await this.résumeService.addNewRésume({
        ...addNewRésume,
      });
      await this.résumeService.addStudentResume({
        cvId: Object.values(result)[0].id,
        studentId,
      });
      const images = await Buffer.from(
        'file:///var/mobile/Containers/Data/Application/7947C969-0D8E-4927-986E-34EB54A7DB22/Library/Caches/ExponentExperienceData/%2540anonymous%252Fsupported-internship-app-eae4be00-0eb3-4d2e-bf32-359455023923/ImagePicker/26D11006-33D4-4F9A-A93E-60828AA7CA18.jpg',
        'utf-8',
      );

      await this.uploadImages(Object.values(result)[0].id, [
        {
          fieldname: 'files',
          originalname: '26D11006-33D4-4F9A-A93E-60828AA7CA18.jpg',
          encoding: '7bit',
          mimetype: 'image/jpg',
          buffer: images,
          size: 275575,
        },
      ]);
      // await this.uploadImages(Object.values(result)[0].id, files.files);
      await Promise.all(
        result.map(async (item) => {
          const { files } = await this.getImages(item.id);
          item.images = files;
          return item.images;
        }),
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

  // @Post()
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  // public async addNewRésume(
  //   @Query('studentId') studentId: string,
  //   @Body() addNewRésume: AddNewRésumeDto,
  // ): Promise<RésumeFilter[]> {
  //   try {
  //     if (Object.values(JSON.parse(addNewRésume.files)).length <= 0) {
  //       throw new HttpException('Cannot add image', HttpStatus.BAD_REQUEST);
  //     }
  //     const encodedFile = Object.values(JSON.parse(addNewRésume.files))[0];
  //     const images = await Buffer.from(encodedFile[0].uri, 'utf-8');

  //     const files = {
  //       files: [
  //         {
  //           fieldname: 'files',
  //           originalname: encodedFile[0].originalname,
  //           encoding: '7bit',
  //           mimetype: encodedFile[0].mimetype,
  //           buffer: images,
  //         },
  //       ],
  //     };
  //     const result = await this.résumeService.addNewRésume({
  //       ...addNewRésume,
  //     });
  //     await this.résumeService.addStudentResume({
  //       cvId: Object.values(result)[0].id,
  //       studentId,
  //     });
  //     await this.uploadImages(Object.values(result)[0].id, files.files);
  //     await Promise.all(
  //       result.map(async (item) => {
  //         const { files } = await this.getImages(item.id);
  //         item.images = files;
  //         return item.images;
  //       }),
  //     );
  //     return result;
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw new HttpException(
  //       error.message,
  //       error?.status || HttpStatus.SERVICE_UNAVAILABLE,
  //     );
  //   }
  // }
  @Patch()
  public async updateRésume(
    @Query('id') id: string,
    @Body() updateRésumeDto: UpdateRésumeDto,
  ) {
    try {
      const result = await this.résumeService.UpdateRésume(id, updateRésumeDto);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('student')
  async GetResumeForClient(
    @Query('id') id: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<RésumeFilterResponse> {
    if (id.trim() == '') return { data: [], pagination: { total: 0 } };
    try {
      const data = await this.résumeService.getResumeByStudentId(
        id,
        limit,
        offset,
      );
      const total = await this.résumeService.getTotalResumeByStudentId(id);
      if (Object.values(total)[0] > 0 && data.length > 0) {
        const { files } = await this.getImages(data[0].id);
        Object.values(data)[0].images = files;
        await Promise.all(
          data.map(async (item) => {
            const relevant =
              await this.résumeService.getAllDataForResumeByResumeId(item.id);
            item.details = relevant;
            return item.details;
          }),
        );
        return { data, pagination: total };
      }

      return { data: [], pagination: { total: 0 } };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  public async getImages(id: string): Promise<GetAllForOwnerResponse> {
    try {
      const { files } = await firstValueFrom(
        this.fileService
          .getAllForOwner({ ownerId: id })
          .pipe(timeout(defaultTimeout)),
      );

      if (!files) return { files: [] };
      return { files };
    } catch (error) {
      this.logger.error('Error from storage service: ', error.message);
      return { files: [] };
    }
  }

  public async uploadImages(
    cvId: string,
    filesParam: any[],
  ): Promise<UploadFilesForOwnerResponse> {
    const file = filesParam.map((index) => ({
      filename: index.originalname,
      buffer: index.buffer,
      mimetype: index.mimetype,
    }));
    const files = await firstValueFrom(
      this.fileService.uploadForOwner({
        ownerId: cvId,
        files: file,
      }),
    );
    return {
      urls: files[0],
    };
  }
  catch(error) {
    this.logger.error('Error from storage service: ', error.message);
    return { urls: [] };
  }
}
