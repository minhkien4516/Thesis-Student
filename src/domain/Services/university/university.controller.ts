import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { firstValueFrom, timeout } from 'rxjs';
import { FilesService } from '../files/files.service';
import { UniversityService } from './university.service';
import {
  GetAllForOwnerResponse,
  StudentsFilterResponse,
  UploadFilesForOwnerResponse,
} from '../../interfaces';
import { defaultTimeout } from '../../../constants/timeout.constant';
import * as XLSX from 'xlsx';
import {
  AddNewStudentsByImportDto,
  AddNewStudentsDto,
} from './dtos/addNewStudents.dtos';
import { UpdateStudentDto } from './dtos/updateStudent.dtos';
import { FilterStudentDto } from './dtos/filterStudent.dtos';

@Controller('university')
export class UniversityController {
  private readonly logger = new Logger('UniversityController');

  constructor(
    private readonly universityService: UniversityService,
    private readonly fileService: FilesService,
  ) {}

  @Post('import')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  public async AddNewStudentByImport(
    @UploadedFiles() files: { files?: Express.Multer.File },
  ) {
    try {
      const workBook: XLSX.WorkBook = XLSX.read(
        Object.values(files.files)[0].buffer,
        {
          type: 'buffer',
          cellDates: true,
          cellNF: false,
        },
      );
      const sheetName = workBook?.SheetNames[0];
      const sheet: XLSX.WorkSheet = workBook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        dateNF: 'YYYY-MM-DD',
      });
      const multiStudent = await Promise.all(
        jsonData.map(async (student) => {
          const dto = new AddNewStudentsByImportDto();
          dto.class = student['Lớp'];
          dto.birthDate = student['Ngày sinh'];
          dto.identityNumber = student['Mã số SV'];
          dto.lastName = student['Họ và tên đệm'];
          dto.firstName = student['Tên'];
          dto.address = student['Địa chỉ'];
          dto.email = (
            student['Mã số SV'].toLowerCase() + '@st.huflit.edu.vn'
          ).toString();
          dto.term = dto.academicYear =
            'K' +
            (
              parseInt(student['Mã số SV'].split(/(?<=^(?:.{2})+)(?!$)/)[0]) + 6
            ).toString();
          dto.phoneNumber = student['Số điện thoại'];
          dto.status = student['Trạng thái'];
          const relevant = await this.universityService.addNewStudent({
            ...dto,
          });
          return relevant[0];
        }),
      );
      return multiStudent;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('student')
  public async addNewStudents(@Body() dto: AddNewStudentsDto) {
    try {
      const multiStudent = await Promise.all(
        dto.students.map(async (student) => {
          const students = await this.universityService.addNewStudent(student);
          return students[0];
        }),
      );
      return multiStudent;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('student')
  public async updateStudentInformation(
    @Query('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    try {
      // dto.identityNumber != null ||
      // dto.identityNumber != undefined ||
      // dto.identityNumber != ''
      //   ? (dto.email = (
      //       dto.identityNumber.toLowerCase() + '@st.huflit.edu.vn'
      //     ).toString())
      //   : (dto.identityNumber = null);
      // dto.term = dto.academicYear =
      //   'K' +
      //   (
      //     parseInt(dto.identityNumber.split(/(?<=^(?:.{2})+)(?!$)/)[0]) + 6
      //   ).toString();
      const result = await this.universityService.UpdateStudentInformation(
        id,
        dto,
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

  @Get('student/identityNumber')
  public async getAllIdentityNumber() {
    try {
      const result =
        await this.universityService.getAllIdentityNumberForClient();
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
  @Get('student/all')
  public async GetAllStudentsInUniversity(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<StudentsFilterResponse> {
    try {
      const data = await this.universityService.getAllStudentForClient(
        limit,
        offset,
      );
      const total =
        await this.universityService.getTotalStudentsInUniversityForClient();
      if (Object.values(total)[0] > 0 && data.length > 0) {
        await Promise.all(
          data.map(async (item) => {
            const relevant =
              await this.universityService.getAllDataForStudentByStudentId(
                item.id,
              );
            console.log(typeof Object.keys(relevant)[0]);
            if (typeof Object.keys(relevant)[0] == 'undefined') {
              return (item.details = []);
            } else if (typeof Object.keys(relevant)[0] == 'string') {
              item.details = [relevant];
              const { files } = await this.getImages(item.details[0].cv[0].id);
              item.details[0].cv[0].images = files;
              return {
                details: item.details,
                images: item.details[0].cv[0].images,
              };
            }
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

  @Get('student/filter')
  public async getStudentByConditions(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query() filterStudentDto: FilterStudentDto,
  ): Promise<StudentsFilterResponse> {
    try {
      const data = await this.universityService.getFilterStudentByConditions(
        limit,
        offset,
        {
          ...filterStudentDto,
        },
      );
      const total =
        await this.universityService.getTotalFilterStudentByConditions({
          ...filterStudentDto,
        });

      if (Object.values(total)[0] < 0 && data.length < 0)
        return { data: [], pagination: { total: 0 } };
      return { data, pagination: total };
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
    corporationId: string,
    filesParam: Express.Multer.File[],
  ): Promise<UploadFilesForOwnerResponse> {
    const file = filesParam.map((index) => ({
      filename: index.originalname,
      buffer: index.buffer,
      mimetype: index.mimetype,
    }));
    const files = await firstValueFrom(
      this.fileService.uploadForOwner({
        ownerId: corporationId,
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
