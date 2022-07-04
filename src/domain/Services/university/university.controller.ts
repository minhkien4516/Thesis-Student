import { Teacher } from './../../Models/teacher.model';
import { StudentFilter } from './../../interfaces/getStudentForClients.interface';
import {
  RegisterTeacherForStudentDto,
  RegisterTeacherForStudentsDto,
} from './dtos/registerTeacherForStudent.dtos';
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
import { timeout, firstValueFrom } from 'rxjs';
import { FilesService } from '../files/files.service';
import { UniversityService } from './university.service';
import {
  GetAllForOwnerResponse,
  ResumeFilterRequest,
  ResumeFilterResponse,
  StudentsFilterResponse,
  UploadFilesForOwnerResponse,
} from '../../interfaces';
import { defaultTimeout } from '../../../common/constants/timeout.constant';
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
import {
  TeacherDetail,
  TeachersFilterResponse,
} from '../../interfaces/getTeacherForClients.interface';
import { FilterTeacherDto } from './dtos/filterTeacher.dtos';
import { SaveStudentAccountForOwnerResponse } from '../../interfaces/saveStudentAccountForOwnerResponse.interface';
import { AuthService } from '../auth/auth.service';
import { SaveStudentAccountForOwnerRequest } from '../../interfaces/saveStudentAccountForOwnerRequest.interface';
import { GrpcMethod } from '@nestjs/microservices';
import { RésumeService } from '../résume/résume.service';
import {
  MAIL_STUDENT,
  STUDENT_ROLE,
  TEACHER_ROLE,
} from '../../../common/constants/authService.constant';
import { getStudentByIdForLoginRequest } from '../../interfaces/getStudentByIdForLoginRequest';
import { Status } from '../../../common/enums/status.enum';
import { Role } from '../../../common/enums/role.enum';
import { SaveTeacherAccountForOwnerRequest } from '../../interfaces/saveTeacherAccountForOwnerRequest.interface';
import { SaveTeacherAccountForOwnerResponse } from '../../interfaces/saveTeacherAccountForOwnerResponse.interface';
import { getTeacherByIdForLoginRequest } from '../../interfaces/getTeacherByIdForLoginRequest ';

@Controller('university')
export class UniversityController {
  private readonly logger = new Logger('UniversityController');

  constructor(
    private readonly universityService: UniversityService,
    private readonly fileService: FilesService,
    private readonly authService: AuthService,
    private readonly résumeService: RésumeService,
  ) {}

  @Post('/student/register-teacher')
  async registerStudentForTeacher(@Body() dto: RegisterTeacherForStudentsDto) {
    try {
      const multiRegistration = await Promise.all(
        dto.teacher.map(async (item) => {
          const temp = await this.universityService.getTeacherById(
            item.teacherId,
          );
          if (Object.values(temp)[0][0] === undefined)
            throw new HttpException(
              'This teacher does not exist in system....',
              HttpStatus.BAD_REQUEST,
            );
          if (Object.values(temp)[0][0].maximumStudentAmount === 0) {
            const register =
              await this.universityService.registerTeacherForStudent(item);
            if (!register) {
              throw new HttpException(
                'You have not been allowed to register more than one teacher',
                HttpStatus.BAD_REQUEST,
              );
            } else {
              return { register, message: 'Successfully registered' };
            }
          } else if (Object.values(temp)[0][0].maximumStudentAmount > 0) {
            if (
              Object.values(temp)[0][0].studentAmount <
              Object.values(temp)[0][0].maximumStudentAmount
            ) {
              const register =
                await this.universityService.registerTeacherForStudent(item);
              if (!register) {
                throw new HttpException(
                  'You have not been allowed to register more than one teacher',
                  HttpStatus.BAD_REQUEST,
                );
              } else {
                const teacher = await this.universityService.getTeacherById(
                  item.teacherId,
                );
                await this.universityService.UpdateStudentInformation(
                  item.studentId,
                  {
                    nameTeacher:
                      Object.values(teacher)[0][0].fullName.toString() || '',
                  },
                );
              }
              return { register, message: 'Successfully registered' };
            } else {
              throw new HttpException(
                'This teacher has reached the maximum number of students',
                HttpStatus.BAD_REQUEST,
              );
            }
          }
        }),
      );

      return multiRegistration;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('/student/accepted-registration')
  async acceptStudentRegistration(@Body() dto: RegisterTeacherForStudentsDto) {
    try {
      const accepted = await Promise.all(
        dto.teacher.map(async (item) => {
          const teacher = await this.universityService.getTeacherById(
            item.teacherId,
          );
          const temp = this.universityService.acceptedStudentRegistration(item);
          await this.universityService.UpdateStudentInformation(
            item.studentId,
            {
              nameTeacher:
                Object.values(teacher)[0][0].fullName.toString() || '',
            },
          );
          return {
            temp,
            message: 'Successfully accepted',
          };
        }),
      );
      return accepted;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('/student/rejected-registration')
  async rejectedStudentRegistration(
    @Body() dto: RegisterTeacherForStudentsDto,
  ) {
    try {
      const rejected = await Promise.all(
        dto.teacher.map(async (item) => {
          const teacher = await this.universityService.getTeacherById(
            item.teacherId,
          );
          await this.universityService.rejectedStudentRegistration(item);
          await this.universityService.UpdateStudentInformation(
            item.studentId,
            {
              nameTeacher: '',
            },
          );
          if (Object.values(teacher)[0][0].studentAmount > 0) {
            await this.universityService.UpdateTeacherInformation(
              item.teacherId,
              {
                studentAmount: Object.values(teacher)[0][0].studentAmount - 1,
              },
            );
            return {
              status: HttpStatus.OK,
              message: 'Successfully rejected',
            };
          } else {
            throw new HttpException(
              'This teacher has no students',
              HttpStatus.BAD_REQUEST,
            );
          }
        }),
      );
      return rejected;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('/student/unregister-teacher')
  async unRegisterStudentForTeacher(
    @Body() dto: RegisterTeacherForStudentsDto,
  ) {
    try {
      const multiUnRegistration = await Promise.all(
        dto.teacher.map(async (item) => {
          const teacher =
            await this.universityService.unRegisterTeacherForStudent(item);
          console.log(teacher);
          if (!teacher) {
            throw new HttpException(
              'This student and teacher do not exist in system....',
              HttpStatus.BAD_REQUEST,
            );
          } else {
            await this.universityService.UpdateStudentInformation(
              item.studentId,
              {
                nameTeacher: '',
              },
            );
            const student =
              await this.universityService.getStudentByIdForClient(
                item.studentId,
              );

            return { teacher, student, message: 'Successfully unregistered' };
          }
        }),
      );
      return multiUnRegistration;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
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
            student['Mã số SV'].toLowerCase() + MAIL_STUDENT
          ).toString();
          dto.term =
            'K' +
            (
              parseInt(student['Mã số SV'].split(/(?<=^(?:.{2})+)(?!$)/)[0]) + 6
            ).toString();
          dto.academicYear = student['Năm học'];
          dto.phoneNumber = student['Số điện thoại'];
          dto.status = student['Trạng thái'];
          dto.nameTeacher = student['GVHD'];
          dto.internshipCertification =
            student['Phiếu tiếp nhận sinh viên thực tập'];
          dto.internshipReport = student['Phiếu báo cáo thực tập'];
          dto.internshipGrade = student['Điểm'];
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

  @Get('student/generate-account')
  public async generateAccountStudent(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const student = await this.universityService.getAllStudents(academicYear);
      if (student.students.length > 0) {
        await student.students.map((item) => {
          item.teacherId = '';
          item.role = Role.student;
          item.password = item.phoneNumber;
        });
        await this.saveStudents(student);

        return {
          message: 'Generate account successfully',
          status: HttpStatus.OK,
        };
      }
      return { student: [] };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('teacher/generate-account')
  public async generateAccountTeacher(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const teacher = await this.universityService.getAllTeachers(academicYear);
      if (teacher.teachers.length > 0) {
        await teacher.teachers.map((item) => {
          item.role = Role.teacher;
          item.studentId = '';
          item.password = item.phoneNumber;
        });
        await this.saveTeachers(teacher);

        return {
          message: 'Generate account successfully',
          status: HttpStatus.OK,
        };
      }
      return { teacher: [] };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @GrpcMethod('UniversityService')
  async getTeacherByIdGrpc(
    data: getTeacherByIdForLoginRequest,
  ): Promise<TeacherDetail> {
    if (data.id.trim() == '') return {};
    try {
      const teacher = await this.universityService.getTeacherById(data.id);
      if (Object.values(teacher)[0][0] === undefined) return {};
      console.log(teacher);
      return teacher;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @GrpcMethod('UniversityService')
  async getStudentByIdGrpc(
    data: getStudentByIdForLoginRequest,
  ): Promise<StudentFilter> {
    if (data.id.trim() == '') return {};
    try {
      const student = await this.universityService.getStudentByIdForClient(
        data.id,
      );
      console.log(student);
      if (Object.values(student)[0] == undefined) {
        return {};
      } else {
        await Promise.all(
          student.cv.map(async (item) => {
            const { files } = await this.getImages(item.id);
            item.images = files;
            return item.images;
          }),
        );
        return student;
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
  @Get('student')
  public async getStudentById(@Query('id') id: string) {
    try {
      const student = await this.universityService.getStudentByIdForClient(id);
      console.log(student);
      if (Object.values(student)[0] == undefined) {
        return {};
      } else {
        await Promise.all(
          student.cv.map(async (item) => {
            const { files } = await this.getImages(item.id);
            item.images = files;
            return item.images;
          }),
        );
        return student;
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('student/import-internshipCertification')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  public async importInternshipCertification(
    @Query('id') id: string,
    @UploadedFiles() Files: { files?: Express.Multer.File[] },
  ) {
    try {
      const student = await this.universityService.getStudentByIdForClient(id);
      if (Object.entries(student)[0] == undefined || !Files) {
        throw new HttpException(
          'This student does not exist in our system or you do not attach essential file...',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        await this.uploadImages(Object.entries(student)[0][1], Files.files);
        const { files } = await this.getImages(Object.entries(student)[0][1]);
        if (Object.values(files)[0].url != null) {
          if (Object.entries(student)[16][1] == '') {
            const studentUpdate =
              await this.universityService.UpdateStudentInformation(id, {
                internshipCertification: Object.values(files)[0].url,
                status: Status.INTERNSHIP.toString(),
              });
            return studentUpdate;
          } else if (Object.entries(student)[16][1] != '') {
            const studentUpdate =
              await this.universityService.UpdateStudentInformation(id, {
                internshipCertification: Object.values(files)[0].url,
              });
            return studentUpdate;
          }
        } else {
          return {};
        }
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('student/import-internshipReport')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  public async importInternshipReport(
    @Query('id') id: string,
    @UploadedFiles() Files: { files?: Express.Multer.File[] },
  ) {
    try {
      const student = await this.universityService.getStudentByIdForClient(id);
      if (Object.entries(student)[0] == undefined || !Files) {
        throw new HttpException(
          'This student does not exist in our system or you do not attach essential file...',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        if (Object.entries(student)[15][1] == '') {
          throw new HttpException(
            'This student does not have internship certification, please upload its first...',
            HttpStatus.BAD_REQUEST,
          );
        } else if (Object.entries(student)[15][1] != '') {
          await this.uploadImages(Object.entries(student)[0][1], Files.files);
          const { files } = await this.getImages(Object.entries(student)[0][1]);
          if (Object.values(files)[0].url != null) {
            const studentUpdate =
              await this.universityService.UpdateStudentInformation(id, {
                internshipReport: Object.values(files)[0].url,
                status: Status.COMPLETED,
              });
            return studentUpdate;
          } else {
            return {};
          }
        }
      }
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
          console.log(teacher['Số lượng SV']);
          const dto = new AddNewTeachersByImportDto();
          dto.position = teacher['Chức vụ'];
          dto.department = teacher['Bộ môn'];
          dto.lastName = teacher['Họ và tên đệm'] || '';
          dto.firstName = teacher['Tên'] || '';
          dto.academicYear = teacher['Năm học'];
          dto.fullName = dto.lastName.concat(' ', dto.firstName) || '';
          dto.email = teacher['Địa chỉ email'];
          dto.phoneNumber = teacher['Điện thoại'];
          dto.studentAmount = teacher['Số lượng SV hiện tại'];
          dto.maximumStudentAmount = teacher['Số lượng SV tối đa'];
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
          student.term =
            'K' +
              (
                parseInt(
                  student.identityNumber.split(/(?<=^(?:.{2})+)(?!$)/)[0],
                ) + 6
              ).toString() || '';
          student.email =
            (student.identityNumber.toLowerCase() + MAIL_STUDENT).toString() ||
            '';
          const students = await this.universityService.addNewStudent(student);
          students.map(async (item) => {
            const student = await this.universityService.getStudentByIds(
              item.id,
            );
            student.students.map((item) => {
              item.role = STUDENT_ROLE;
              item.password = item.phoneNumber;
              item.studentId = item.studentId;
            });
            await this.saveStudents(student);
          });
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
          teachers.map(async (item) => {
            const teacher = await this.universityService.getTeacherByIds(
              item.id,
            );
            teacher.teachers.map((item) => {
              item.role = TEACHER_ROLE;
              item.password = item.phoneNumber;
              item.teacherId = item.teacherId;
            });
            await this.saveTeachers(teacher);
          });
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
      const student = await this.universityService.getStudentByIdForClient(id);
      if (Object.entries(student)[0] == undefined) {
        throw new HttpException(
          'This student does not exist in our system...',
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        Object.entries(student)[16][1] == '' &&
        dto.internshipCertification == ''
      ) {
        dto.status = Status.NONINTERNSHIP.toString();
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          dto,
        );
        return result;
      } else if (
        Object.entries(student)[15][1] == '' &&
        dto.internshipReport == ''
      ) {
        dto.status = Status.NONINTERNSHIP.toString();
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          dto,
        );
        return result;
      } else if (
        Object.entries(student)[16][1] != '' &&
        dto.internshipCertification == ''
      ) {
        dto.status = Status.INTERNSHIP.toString();
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          { ...dto },
        );
        return result;
      } else if (
        Object.entries(student)[15][1] != '' &&
        dto.internshipReport == ''
      ) {
        dto.status = Status.INTERNSHIP.toString();
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          { ...dto },
        );
        return result;
      } else {
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          dto,
        );
        return result;
      }
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
      const teacher = await this.universityService.getTeacherById(id);
      if (Object.values(teacher)[0][0] == undefined) {
        throw new HttpException(
          'This teacher does not exist in our system...',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (Object.values(teacher)[0][0].maximumStudentAmount == 0) {
        if (dto.maximumStudentAmount > 0) {
          if (
            dto.maximumStudentAmount >
            Object.values(teacher)[0][0].studentAmount
          ) {
            dto.fullName =
              dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
            const result =
              await this.universityService.UpdateTeacherInformation(id, dto);
            return result;
          } else if (
            dto.maximumStudentAmount <
            Object.values(teacher)[0][0].studentAmount
          ) {
            throw new HttpException(
              'The maximum student amount cannot be less than the current student amount...',
              HttpStatus.BAD_REQUEST,
            );
          }
        } else if (dto.maximumStudentAmount <= 0) {
          throw new HttpException(
            'Maximum student amount must be greater than 0...',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (Object.values(teacher)[0][0].maximumStudentAmount > 0) {
        if (dto.maximumStudentAmount > 0) {
          if (
            dto.maximumStudentAmount >
            Object.values(teacher)[0][0].studentAmount
          ) {
            dto.fullName =
              dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
            const result =
              await this.universityService.UpdateTeacherInformation(id, dto);
            return result;
          } else if (
            dto.maximumStudentAmount <
            Object.values(teacher)[0][0].studentAmount
          ) {
            throw new HttpException(
              'The maximum student amount cannot be less than the current student amount...',
              HttpStatus.BAD_REQUEST,
            );
          }
        } else if (dto.maximumStudentAmount < 0) {
          throw new HttpException(
            'Maximum student amount must be greater than 0...',
            HttpStatus.BAD_REQUEST,
          );
        } else if ((dto.maximumStudentAmount = 0)) {
          dto.fullName =
            dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
          const result = await this.universityService.UpdateTeacherInformation(
            id,
            dto,
          );
          return result;
        }
      }
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
  public async getAllIdentityNumber(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const result = await this.universityService.getAllIdentityNumberForClient(
        academicYear,
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

  @Get('academicYear')
  public async getAllAcademicYear() {
    try {
      const resultStudent =
        await this.universityService.getAllAcademicYearInStudent();
      const resultTeacher =
        await this.universityService.getAllAcademicYearInTeacher();
      return {
        student: resultStudent,
        teacher: resultTeacher,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('teacher/fullName')
  public async getAllTeacherName(@Query('academicYear') academicYear: string) {
    try {
      const result = await this.universityService.getAllTeacherName(
        academicYear,
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

  @Get('student/term')
  public async getAllTerm(@Query('academicYear') academicYear: string) {
    try {
      const result = await this.universityService.getAllTermForClient(
        academicYear,
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

  @Get('student/class')
  public async getAllClass(@Query('academicYear') academicYear: string) {
    try {
      const result = await this.universityService.getAllClassForClient(
        academicYear,
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

  @Get('teacher/all/pagination')
  public async GetAllTeachersInUniversity(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('academicYear') academicYear: string,
  ): Promise<TeachersFilterResponse> {
    try {
      const data = await this.universityService.getAllTeacherForClient(
        academicYear,
        limit,
        offset,
      );
      const total =
        await this.universityService.getTotalTeachersInUniversityForClient(
          academicYear,
        );
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
  @Get('teacher')
  async GetTeacherById(@Query('id') id: string): Promise<TeacherDetail> {
    try {
      const teacher = await this.universityService.getTeacherById(id);
      if (Object.values(teacher)[0][0] === undefined) return {};
      return teacher;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('teacher/all')
  public async GetAllTeachersInUniversityNotPagination(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const data =
        await this.universityService.getAllTeacherForClientNotPagination(
          academicYear,
        );
      if (data.length > 0) return { data };
      return { data: [] };
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
    @Query('academicYear') academicYear: string,
  ): Promise<StudentsFilterResponse> {
    try {
      const data = await this.universityService.getAllStudentForClient(
        limit,
        offset,
        academicYear,
      );
      const total =
        await this.universityService.getTotalStudentsInUniversityForClient(
          academicYear,
        );
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

  @Get('student/condition')
  public async GetAllStudentsInUniversityByCondition(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('term') term: string,
    @Query('fullName') fullName: string,
    @Query('academicYear') academicYear: string,
  ): Promise<StudentsFilterResponse> {
    try {
      const data =
        await this.universityService.getAllStudentForClientByCondition(
          limit,
          offset,
          term,
          fullName,
          academicYear,
        );
      const total =
        await this.universityService.getTotalStudentsInUniversityForClientByCondition(
          term,
          fullName,
          academicYear,
        );
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

      if (Object.values(total)[0] < 0 && data.length < 0) {
        return { data: [], pagination: { total: 0 } };
      } else {
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

      if (Object.values(total)[0] < 0 && data.length < 0) {
        return { data: [], pagination: { total: 0 } };
      } else {
        await Promise.all(
          data.map(async (item) => {
            const relevant = await this.universityService.getTeacherById(
              item.id,
            );
            if (Object.values(relevant)[0][1] == undefined) {
              return (item.details = []);
            } else {
              const student: TeacherDetail = Object.values(relevant)[0][1];
              item.details = [student];
              return item.details;
            }
          }),
        );
        return { data, pagination: total };
      }
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

  @GrpcMethod('UniversityService')
  async getResumeForClient(
    data_temp: ResumeFilterRequest,
  ): Promise<ResumeFilterResponse> {
    if (data_temp.id.trim() == '') return { data: [] };
    try {
      const data = await this.résumeService.getResumeByStudentIdAndCvId(
        data_temp.id,
        data_temp.cvId,
      );
      const total = await this.résumeService.getTotalResumeByStudentIdAndCvId(
        data_temp.id,
        data_temp.cvId,
      );
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
        return { data };
      }

      return { data: [] };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
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
      this.logger.error(
        'Error when generate account for student from user service: ' +
          error.message,
      );
      return { students: [] };
    }
  }

  public async saveTeachers(
    data: SaveTeacherAccountForOwnerRequest,
  ): Promise<SaveTeacherAccountForOwnerResponse> {
    try {
      return await firstValueFrom(this.authService.registerTeacher(data));
    } catch (error) {
      this.logger.error(
        'Error when generate account for student from user service: ' +
          error.message,
      );
      return { teachers: [] };
    }
  }
}
