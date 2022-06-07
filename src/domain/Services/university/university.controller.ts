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
import {
  AddNewTeachersByImportDto,
  AddNewTeachersDto,
} from './dtos/addNewTeachers.dtos';
import { UpdateTeacherDto } from './dtos/updateTeacher.dtos';
import { TeachersFilterResponse } from '../../interfaces/getTeacherForClients.interface';
import { FilterTeacherDto } from './dtos/filterTeacher.dtos';
import { SaveStudentAccountForOwnerResponse } from '../../interfaces/saveStudentAccountForOwnerResponse.interface';
import { AuthService } from '../auth/auth.service';
import { SaveStudentAccountForOwnerRequest } from '../../interfaces/saveStudentAccountForOwnerRequest.interface';

@Controller('university')
export class UniversityController {
  private readonly logger = new Logger('UniversityController');

  constructor(
    private readonly universityService: UniversityService,
    private readonly fileService: FilesService,
    private readonly authService: AuthService,
  ) {}

  @Post('student/import')
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
          dto.lastName = student['Họ và tên đệm'] || '';
          dto.firstName = student['Tên'] || '';
          dto.fullName = dto.lastName.concat('', dto.firstName) || '';
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
      const result = await this.universityService.getAllStudents();
      result.students.map(async (item) => {
        item.role = 'student';
        item.password = '1234567890';
      });

      await this.saveStudents(result);
      // result.students.map(async (student) => {
      //   student.password = '123456';
      //   student.role = 'student';
      //   await this.saveStudents(student);
      // });
      return multiStudent;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('teacher/import')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  public async AddNewTeacherByImport(
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
      const multiTeacher = await Promise.all(
        jsonData.map(async (teacher) => {
          console.log(teacher['Điện thoại']);
          const dto = new AddNewTeachersByImportDto();
          dto.position = teacher['Chức vụ'];
          dto.department = teacher['Bộ môn'];
          dto.lastName = teacher['Họ và tên đệm'] || '';
          dto.firstName = teacher['Tên'] || '';
          dto.fullName = dto.lastName.concat(' ', dto.firstName) || '';
          dto.email = teacher['Địa chỉ email'];
          dto.phoneNumber = teacher['Điện thoại'];
          const relevant = await this.universityService.addNewTeacher({
            ...dto,
          });
          return relevant[0];
        }),
      );
      return multiTeacher;
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
          student.fullName =
            student.lastName.concat(' ', student.firstName) || ' ';
          student.term = student.academicYear =
            'K' +
              (
                parseInt(
                  student.identityNumber.split(/(?<=^(?:.{2})+)(?!$)/)[0],
                ) + 6
              ).toString() || '';
          student.email =
            (
              student.identityNumber.toLowerCase() + '@st.huflit.edu.vn'
            ).toString() || '';
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

  @Post('teacher')
  public async addNewTeachers(@Body() dto: AddNewTeachersDto) {
    try {
      const multiTeacher = await Promise.all(
        dto.teachers.map(async (teacher) => {
          teacher.fullName =
            teacher.lastName.concat(' ', teacher.firstName) || ' ';
          const teachers = await this.universityService.addNewTeacher(teacher);
          return teachers[0];
        }),
      );
      return multiTeacher;
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
      dto.fullName =
        dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
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

  @Patch('teacher')
  public async updateTeacherInformation(
    @Query('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    try {
      dto.fullName =
        dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
      const result = await this.universityService.UpdateTeacherInformation(
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

  @Get('student/class')
  public async getAllClass() {
    try {
      const result = await this.universityService.getAllClassForClient();
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('teacher/all')
  public async GetAllTeachersInUniversity(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<TeachersFilterResponse> {
    try {
      const data = await this.universityService.getAllTeacherForClient(
        limit,
        offset,
      );
      const total =
        await this.universityService.getTotalTeachersInUniversityForClient();
      if (Object.values(total)[0] > 0 && data.length > 0)
        return { data, pagination: total };
      return { data: [], pagination: { total: 0 } };
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

  @Get('teacher/filter')
  public async getTeacherByConditions(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query() filterTeacherDto: FilterTeacherDto,
  ): Promise<TeachersFilterResponse> {
    try {
      const data = await this.universityService.getFilterTeacherByConditions(
        limit,
        offset,
        {
          ...filterTeacherDto,
        },
      );
      const total =
        await this.universityService.getTotalFilterTeacherByConditions({
          ...filterTeacherDto,
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

  public async saveStudents(
    data: SaveStudentAccountForOwnerRequest,
  ): Promise<SaveStudentAccountForOwnerResponse> {
    try {
      return await firstValueFrom(this.authService.registerStudent(data));
    } catch (error) {
      this.logger.error('Error from user service: ', error.message);
      return { students: [] };
    }
  }
}
