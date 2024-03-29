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
import { ModifyInternship } from './dtos/modifyInternship.dtos';
import EmailService from '../../../utils/email/email.service';

@Controller('university')
export class UniversityController {
  private readonly logger = new Logger('UniversityController');

  constructor(
    private readonly universityService: UniversityService,
    private readonly fileService: FilesService,
    private readonly authService: AuthService,
    private readonly résumeService: RésumeService,
    private readonly emailService: EmailService,
  ) {}

  @Post('/student/register-teacher')
  async registerStudentForTeacher(@Body() dto: RegisterTeacherForStudentsDto) {
    try {
      const multiRegistration = await Promise.all(
        dto.teacher.map(async (item) => {
          const teacherTemp = await this.universityService.getTeacherById(
            item.teacherId,
          );
          const studentTemp =
            await this.universityService.getStudentByIdForClient(
              item.studentId,
            );
          if (Object.values(teacherTemp)[0][0] === undefined)
            throw new HttpException(
              'This teacher does not exist in system....',
              HttpStatus.BAD_REQUEST,
            );
          if (Object.values(teacherTemp)[0][0].maximumStudentAmount === 0) {
            const register =
              await this.universityService.registerTeacherForStudent(item);
            if (!register) {
              throw new HttpException(
                'You have not been allowed to register more than one teacher',
                HttpStatus.BAD_REQUEST,
              );
            } else {
              await this.emailService.sendMailToTeacher(
                Object.values(teacherTemp)[0][0].email,
                // 'thoa010600@gmail.com',
                // 'tranltb@huflit.edu.vn',
                // '18dh110815@st.huflit.edu.vn',
                // 'kienmaitrungminh@gmail.com',
                Object.values(teacherTemp)[0][0].fullName,
                studentTemp.email,
                studentTemp.firstName,
                studentTemp.lastName,
                studentTemp.identityNumber,
                studentTemp.term,
                studentTemp.academicYear,
                studentTemp.class,
                studentTemp.specialization,
              );
              return { register, message: 'Successfully registered' };
            }
          } else if (
            Object.values(teacherTemp)[0][0].maximumStudentAmount > 0
          ) {
            if (
              Object.values(teacherTemp)[0][0].studentAmount <
              Object.values(teacherTemp)[0][0].maximumStudentAmount
            ) {
              const register =
                await this.universityService.registerTeacherForStudent(item);
              if (!register) {
                throw new HttpException(
                  'You have not been allowed to register more than one teacher',
                  HttpStatus.BAD_REQUEST,
                );
              } else {
                await this.emailService.sendMailToTeacher(
                  Object.values(teacherTemp)[0][0].email,
                  // 'thoa010600@gmail.com',
                  // 'tranltb@huflit.edu.vn',
                  // '18dh110815@st.huflit.edu.vn',
                  // 'kienmaitrungminh@gmail.com',
                  Object.values(teacherTemp)[0][0].fullName,
                  studentTemp.email,
                  studentTemp.firstName,
                  studentTemp.lastName,
                  studentTemp.identityNumber,
                  studentTemp.term,
                  studentTemp.academicYear,
                  studentTemp.class,
                  studentTemp.specialization,
                );
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
          const result =
            await this.universityService.acceptedStudentRegistration(item);
          await this.universityService.UpdateStudentInformation(
            item.studentId,
            {
              nameTeacher:
                Object.values(teacher)[0][0].fullName.toString() || '',
            },
          );
          const response = await this.universityService.getTeacherById(
            item.teacherId,
          );
          const studentTemp =
            await this.universityService.getStudentByIdForClient(
              item.studentId,
            );
          await this.emailService.sendAcceptedMailToStudent(
            Object.values(response)[0][0].email,
            Object.values(response)[0][0].fullName,
            Object.values(response)[0][0].phoneNumber,
            studentTemp.email,
            studentTemp.fullName,
            studentTemp.academicYear,
          );
          return {
            result,
            teacher: Object.values(response)[0],
            student: Object.values(response)[1] || [],
            studentWaitingAccepted: Object.values(response)[2] || [],
            message: 'Successfully accepted',
          };
        }),
      );
      return accepted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('student/internship-update')
  async updateStudentInternship(
    @Query('studentId') studentId: string,
    @Body() dto: ModifyInternship,
  ) {
    try {
      const certification =
        await this.universityService.modifyInternshipCertification(
          studentId,
          dto.internshipCertification.toLowerCase(),
        );
      const internshipCertification = Object.values(certification)[0];
      const report = await this.universityService.modifyInternshipReport(
        studentId,
        dto.internshipReport.toLowerCase(),
      );
      const internshipReport = Object.values(report)[0];
      const feedback = await this.universityService.modifyInternshipFeedback(
        studentId,
        dto.internshipFeedback.toLowerCase(),
      );
      const internshipFeedback = Object.values(feedback)[0];
      const survey = await this.universityService.modifyInternshipSurvey(
        studentId,
        dto.internshipSurvey.toLowerCase(),
      );
      const internshipSurvey = Object.values(survey)[0];
      return {
        studentId,
        internshipCertification,
        internshipReport,
        internshipFeedback,
        internshipSurvey,
        message: 'Successfully updated',
      };
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
          if (Object.values(teacher)[0][0].studentAmount <= 0) {
            await this.universityService.UpdateTeacherInformation(
              item.teacherId,
              {
                studentAmount: 0,
              },
            );
          }
          const result = await this.universityService.getTeacherById(
            item.teacherId,
          );
          const studentTemp =
            await this.universityService.getStudentByIdForClient(
              item.studentId,
            );
          await this.emailService.sendRejectedMailToStudent(
            Object.values(result)[0][0].email,
            Object.values(result)[0][0].fullName,
            Object.values(result)[0][0].phoneNumber,
            studentTemp.email,
            studentTemp.fullName,
            studentTemp.academicYear,
            item.reason == undefined ? 'Thầy/Cô có việc bận' : item.reason,
          );
          return {
            result: Object.values(result)[0],
            student: Object.values(result)[1] || [],
            studentWaitingAccepted: Object.values(result)[2] || [],
            status: HttpStatus.OK,
            message: 'Successfully rejected',
          };
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
          dto.specialization = student['Chuyên ngành'];
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
          dto.internshipFirstGrade = student['Điểm 1'].toFixed(2);
          dto.internshipSecondGrade = student['Điểm 2'].toFixed(2);
          dto.internshipThirdGrade = student['Điểm 3'].toFixed(2);
          const checkStudent =
            await this.universityService.getStudentByNameAndAcademicYear(
              dto.identityNumber,
              dto.academicYear,
            );
          if (checkStudent) {
            const student =
              await this.universityService.getStudentByIdForClient(
                checkStudent.id,
              );

            if (Object.entries(student)[0] == undefined) {
              throw new HttpException(
                'This student does not exist in our system...',
                HttpStatus.BAD_REQUEST,
              );
            } else if (
              dto.internshipFirstGrade < 0 ||
              dto.internshipSecondGrade < 0 ||
              dto.internshipThirdGrade < 0
            ) {
              throw new HttpException(
                'Internship grade must be between 0 and 10',
                HttpStatus.BAD_REQUEST,
              );
            } else if (
              dto.internshipFirstGrade > 10 ||
              dto.internshipSecondGrade > 10 ||
              dto.internshipThirdGrade > 10
            ) {
              throw new HttpException(
                'Internship grade must be between 0 and 10',
                HttpStatus.BAD_REQUEST,
              );
            } else if (student.nameTeacher != '') {
              dto.fullName =
                dto.lastName?.concat('', dto.firstName?.toString()) || null;
              dto.nameTeacher = student.nameTeacher;
              const result =
                await this.universityService.UpdateStudentInformation(
                  student.id,
                  dto,
                );
              return result;
            } else {
              dto.fullName =
                dto.lastName?.concat('', dto.firstName?.toString()) || null;
              const result =
                await this.universityService.UpdateStudentInformation(
                  checkStudent.id,
                  dto,
                );
              return result;
            }
          }
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

  // @Patch('student/import-internshipCertification')
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  // public async importInternshipCertification(
  //   @Query('id') id: string,
  //   @UploadedFiles() Files: { files?: Express.Multer.File[] },
  // ) {
  //   try {
  //     const student = await this.universityService.getStudentByIdForClient(id);
  //     if (Object.entries(student)[0] == undefined || !Files) {
  //       throw new HttpException(
  //         'This student does not exist in our system or you do not attach essential file...',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     } else {
  //       await this.uploadImages(Object.entries(student)[0][1], Files.files);
  //       const { files } = await this.getImages(Object.entries(student)[0][1]);
  //       if (Object.values(files)[0].url != null) {
  //         if (Object.entries(student)[16][1] == '') {
  //           const studentUpdate =
  //             await this.universityService.UpdateStudentInformation(id, {
  //               internshipCertification: Object.values(files)[0].url,
  //               status: Status.INTERNSHIP.toString(),
  //             });
  //           return studentUpdate;
  //         } else if (Object.entries(student)[16][1] != '') {
  //           const studentUpdate =
  //             await this.universityService.UpdateStudentInformation(id, {
  //               internshipCertification: Object.values(files)[0].url,
  //             });
  //           return studentUpdate;
  //         }
  //       } else {
  //         return {};
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw new HttpException(
  //       error.message,
  //       error?.status || HttpStatus.SERVICE_UNAVAILABLE,
  //     );
  //   }
  // }

  // @Patch('student/import-internshipReport')
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }]))
  // public async importInternshipReport(
  //   @Query('id') id: string,
  //   @UploadedFiles() Files: { files?: Express.Multer.File[] },
  // ) {
  //   try {
  //     const student = await this.universityService.getStudentByIdForClient(id);
  //     if (Object.entries(student)[0] == undefined || !Files) {
  //       throw new HttpException(
  //         'This student does not exist in our system or you do not attach essential file...',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     } else {
  //       if (Object.entries(student)[15][1] == '') {
  //         throw new HttpException(
  //           'This student does not have internship certification, please upload its first...',
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       } else if (Object.entries(student)[15][1] != '') {
  //         await this.uploadImages(Object.entries(student)[0][1], Files.files);
  //         const { files } = await this.getImages(Object.entries(student)[0][1]);
  //         if (Object.values(files)[0].url != null) {
  //           const studentUpdate =
  //             await this.universityService.UpdateStudentInformation(id, {
  //               internshipReport: Object.values(files)[0].url,
  //               status: Status.COMPLETED,
  //             });
  //           return studentUpdate;
  //         } else {
  //           return {};
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw new HttpException(
  //       error.message,
  //       error?.status || HttpStatus.SERVICE_UNAVAILABLE,
  //     );
  //   }
  // }

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
          const checkTeacher =
            await this.universityService.getTeacherByNameAndAcademicYear(
              dto.fullName,
              dto.academicYear,
            );
          if (checkTeacher) {
            const temp: TeacherDetail =
              await this.universityService.getTeacherById(checkTeacher.id);
            if (Object.values(temp)[0][0] == undefined) {
              throw new HttpException(
                'This teacher does not exist in our system...',
                HttpStatus.BAD_REQUEST,
              );
            }
            if (
              dto.firstName != '' ||
              dto.lastName != '' ||
              dto.fullName != ''
            ) {
              if (temp.student[0] != undefined) {
                console.log(temp.student[0]);
                dto.fullName =
                  dto.lastName
                    ?.toString()
                    .concat(' ', dto.firstName?.toString()) || '';
                const result = await this.universityService.UpdateTeacher(
                  checkTeacher.id,
                  dto,
                );
                await Promise.all(
                  temp.student.map(async (student) => {
                    const studentId = student.id;
                    await this.universityService.UpdateStudentInformation(
                      studentId,
                      {
                        nameTeacher: dto.fullName,
                      },
                    );
                  }),
                );
                return result;
              } else {
                dto.fullName =
                  dto.lastName?.concat(' ', dto.firstName?.toString()) || '';
                const result = await this.universityService.UpdateTeacher(
                  checkTeacher.id,
                  dto,
                );
                return result;
              }
            }
          }
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

          const checkStudent =
            await this.universityService.getStudentByNameAndAcademicYear(
              student.identityNumber,
              student.academicYear,
            );
          if (checkStudent) {
            const student =
              await this.universityService.getStudentByIdForClient(
                checkStudent.id,
              );

            if (Object.entries(student)[0] == undefined) {
              throw new HttpException(
                'This student does not exist in our system...',
                HttpStatus.BAD_REQUEST,
              );
            } else if (
              student.internshipFirstGrade < 0 ||
              student.internshipSecondGrade < 0 ||
              student.internshipThirdGrade < 0
            ) {
              throw new HttpException(
                'Internship grade must be between 0 and 10',
                HttpStatus.BAD_REQUEST,
              );
            } else if (
              student.internshipFirstGrade > 10 ||
              student.internshipSecondGrade > 10 ||
              student.internshipThirdGrade > 10
            ) {
              throw new HttpException(
                'Internship grade must be between 0 and 10',
                HttpStatus.BAD_REQUEST,
              );
            } else if (student.nameTeacher != '') {
              student.fullName =
                student.lastName?.concat('', student.firstName?.toString()) ||
                null;
              student.nameTeacher = student.nameTeacher;
              const result =
                await this.universityService.UpdateStudentInformation(
                  student.id,
                  student,
                );
              return result;
            } else {
              student.fullName =
                student.lastName?.concat('', student.firstName?.toString()) ||
                null;
              const result =
                await this.universityService.UpdateStudentInformation(
                  checkStudent.id,
                  student,
                );
              return result;
            }
          }
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
          const checkTeacher =
            await this.universityService.getTeacherByNameAndAcademicYear(
              teacher.fullName,
              teacher.academicYear,
            );
          if (checkTeacher) {
            const temp: TeacherDetail =
              await this.universityService.getTeacherById(checkTeacher.id);
            if (Object.values(temp)[0][0] == undefined) {
              throw new HttpException(
                'This teacher does not exist in our system...',
                HttpStatus.BAD_REQUEST,
              );
            }
            if (
              teacher.firstName != '' ||
              teacher.lastName != '' ||
              teacher.fullName != ''
            ) {
              if (temp.student != undefined) {
                teacher.fullName =
                  teacher.lastName
                    ?.toString()
                    .concat(' ', teacher.firstName?.toString()) || '';
                const result = await this.universityService.UpdateTeacher(
                  checkTeacher.id,
                  teacher,
                );
                const studentId = temp.student[0].id;
                await this.universityService.UpdateStudentInformation(
                  studentId,
                  {
                    nameTeacher: teacher.fullName,
                  },
                );
                return result;
              } else {
                teacher.fullName =
                  teacher.lastName?.concat(
                    ' ',
                    teacher.firstName?.toString(),
                  ) || '';
                const result = await this.universityService.UpdateTeacher(
                  checkTeacher.id,
                  teacher,
                );
                return result;
              }
            }
          }
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

  // @Patch('student')
  // public async updateStudentInformation(
  //   @Query('id') id: string,
  //   @Body() dto: UpdateStudentDto,
  // ) {
  //   try {
  //     const student = await this.universityService.getStudentByIdForClient(id);
  //     if (Object.entries(student)[0] == undefined) {
  //       throw new HttpException(
  //         'This student does not exist in our system...',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     } else if (
  //       Object.entries(student)[16][1] == '' &&
  //       dto.internshipCertification == ''
  //     ) {
  //       dto.status = Status.NONINTERNSHIP.toString();
  //       dto.fullName =
  //         dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
  //       const result = await this.universityService.UpdateStudentInformation(
  //         id,
  //         dto,
  //       );
  //       return result;
  //     } else if (
  //       Object.entries(student)[15][1] == '' &&
  //       dto.internshipReport == ''
  //     ) {
  //       dto.status = Status.NONINTERNSHIP.toString();
  //       dto.fullName =
  //         dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
  //       const result = await this.universityService.UpdateStudentInformation(
  //         id,
  //         dto,
  //       );
  //       return result;
  //     } else if (
  //       Object.entries(student)[16][1] != '' &&
  //       dto.internshipCertification == ''
  //     ) {
  //       dto.status = Status.INTERNSHIP.toString();
  //       dto.fullName =
  //         dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
  //       const result = await this.universityService.UpdateStudentInformation(
  //         id,
  //         { ...dto },
  //       );
  //       return result;
  //     } else if (
  //       Object.entries(student)[15][1] != '' &&
  //       dto.internshipReport == ''
  //     ) {
  //       dto.status = Status.INTERNSHIP.toString();
  //       dto.fullName =
  //         dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
  //       const result = await this.universityService.UpdateStudentInformation(
  //         id,
  //         { ...dto },
  //       );
  //       return result;
  //     } else {
  //       dto.fullName =
  //         dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
  //       const result = await this.universityService.UpdateStudentInformation(
  //         id,
  //         dto,
  //       );
  //       return result;
  //     }
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw new HttpException(
  //       error.message,
  //       error?.status || HttpStatus.SERVICE_UNAVAILABLE,
  //     );
  //   }
  // }

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
        dto.internshipFirstGrade < 0 ||
        dto.internshipSecondGrade < 0 ||
        dto.internshipThirdGrade < 0
      ) {
        throw new HttpException(
          'Internship grade must be between 0 and 10',
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        dto.internshipFirstGrade > 10 ||
        dto.internshipSecondGrade > 10 ||
        dto.internshipThirdGrade > 10
      ) {
        throw new HttpException(
          'Internship grade must be between 0 and 10',
          HttpStatus.BAD_REQUEST,
        );
      } else if (student.nameTeacher != '') {
        dto.fullName =
          dto.lastName?.concat(' ', dto.firstName?.toString()) || null;
        dto.nameTeacher = student.nameTeacher;
        const result = await this.universityService.UpdateStudentInformation(
          id,
          dto,
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
      const teacher: TeacherDetail =
        await this.universityService.getTeacherById(id);

      if (Object.values(teacher)[0][0] == undefined) {
        throw new HttpException(
          'This teacher does not exist in our system...',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (dto.firstName != '' || dto.lastName != '' || dto.fullName != '') {
        if (teacher.student[0] != undefined) {
          dto.fullName =
            dto.lastName?.toString().concat(' ', dto.firstName?.toString()) ||
            '';
          const result = await this.universityService.UpdateTeacherInformation(
            id,
            dto,
          );
          await Promise.all(
            teacher.student.map(async (student) => {
              const studentId = student.id;
              await this.universityService.UpdateStudentInformation(studentId, {
                nameTeacher: dto.fullName,
              });
            }),
          );
          return result;
        } else {
          dto.fullName =
            dto.lastName?.concat(' ', dto.firstName?.toString()) || '';
          const result = await this.universityService.UpdateTeacherInformation(
            id,
            dto,
          );
          return result;
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

  @Get('student/specialization')
  public async getAllSpecialization(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const result = await this.universityService.getAllSpecializationForClient(
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

  @Get('teacher/department')
  public async getAllDepartment(@Query('academicYear') academicYear: string) {
    try {
      const result = await this.universityService.getAllDepartmentForClient(
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

  @Get('teacher/position')
  public async getAllPosition(@Query('academicYear') academicYear: string) {
    try {
      const result = await this.universityService.getAllPositionForClient(
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

  @Get('/studentReport')
  public async getStudentReportForClient(
    @Query('academicYear') academicYear: string,
  ) {
    try {
      const report = await this.universityService.getStudentReportForUniversity(
        academicYear,
      );
      return { report };
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
      if (Object.values(total)[0] > 0 && data.length > 0) {
        await Promise.all(
          data.map(async (teacher) => {
            const result = await this.universityService.getTeacherById(
              teacher.id,
            );
            teacher.details = result;
            return teacher;
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

            item.details = relevant;
            return item.details;
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
