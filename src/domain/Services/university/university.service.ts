import { StudentFilter } from './../../interfaces/getStudentForClients.interface';
import { TeachersFilter } from './../../interfaces/getTeacherForClients.interface';
import { AddNewTeachersByImportDto } from './dtos/addNewTeachers.dtos';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DatabaseError, QueryTypes } from 'sequelize';
import slugify from 'vietnamese-slug';
import { StudentsFilter } from '../../interfaces/getStudentForClients.interface';
import { AddNewStudentsByImportDto } from './dtos/addNewStudents.dtos';
import { Student } from '../../Models/student.model';
import { UpdateStudentDto } from './dtos/updateStudent.dtos';
import { FilterStudentDto } from './dtos/filterStudent.dtos';
import { UpdateTeacherDto } from './dtos/updateTeacher.dtos';
import { FilterTeacherDto } from './dtos/filterTeacher.dtos';
import { SaveStudentAccountForOwnerResponse } from '../../interfaces/saveStudentAccountForOwnerResponse.interface';
import { RegisterTeacherForStudentDto } from './dtos/registerTeacherForStudent.dtos';
import { SaveStudentAccountForOwnerRequest } from '../../interfaces/saveStudentAccountForOwnerRequest.interface';
import { SaveTeacherAccountForOwnerResponse } from '../../interfaces/saveTeacherAccountForOwnerResponse.interface';

@Injectable()
export class UniversityService {
  private readonly logger = new Logger('UniversityService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewTeacher(
    addNewTeachersByImportDto: AddNewTeachersByImportDto,
  ): Promise<TeachersFilter[]> {
    try {
      if (
        !addNewTeachersByImportDto.firstName ||
        !addNewTeachersByImportDto.lastName
      )
        return [];
      const slug = slugify(
        addNewTeachersByImportDto.lastName +
          '-' +
          addNewTeachersByImportDto.firstName,
      );
      const inserted: TeachersFilter[] = await this.sequelize.query(
        'SP_AddNewTeachers @firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @position=:position,' +
          '@department=:department, @phoneNumber=:phoneNumber,@slug=:slug,@studentAmount=:studentAmount,' +
          '@maximumStudentAmount=:maximumStudentAmount,@email=:email',
        {
          type: QueryTypes.SELECT,
          replacements: {
            firstName: addNewTeachersByImportDto.firstName.trim(),
            lastName: addNewTeachersByImportDto.lastName.trim(),
            fullName: addNewTeachersByImportDto.fullName.trim(),
            email: addNewTeachersByImportDto.email.trim(),
            position: addNewTeachersByImportDto.position,
            department: addNewTeachersByImportDto.department,
            phoneNumber: addNewTeachersByImportDto.phoneNumber,
            studentAmount: addNewTeachersByImportDto.studentAmount,
            maximumStudentAmount:
              addNewTeachersByImportDto.maximumStudentAmount,
            slug,
          },
          raw: true,
        },
      );
      return inserted;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  public async registerTeacherForStudent(dto: RegisterTeacherForStudentDto) {
    try {
      const inserted = await this.sequelize.query(
        'SP_RegisterTeacherForStudent @teacherId=:teacherId, @studentId=:studentId',
        {
          type: QueryTypes.SELECT,
          replacements: { teacherId: dto.teacherId, studentId: dto.studentId },
          raw: true,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async unRegisterTeacherForStudent(dto: RegisterTeacherForStudentDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UnRegisterTeacherForStudent @teacherId=:teacherId, @studentId=:studentId',
        {
          type: QueryTypes.SELECT,
          replacements: { teacherId: dto.teacherId, studentId: dto.studentId },
          raw: true,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async acceptedStudentRegistration(dto: RegisterTeacherForStudentDto) {
    try {
      const accepted = await this.sequelize.query(
        'SP_AcceptedStudentRegistration @teacherId=:teacherId, @studentId=:studentId',
        {
          type: QueryTypes.SELECT,
          replacements: { teacherId: dto.teacherId, studentId: dto.studentId },
          raw: true,
        },
      );
      return accepted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async unacceptedStudentRegistration(
    dto: RegisterTeacherForStudentDto,
  ) {
    try {
      const unaccepted = await this.sequelize.query(
        'SP_UnAcceptedStudentRegistration @teacherId=:teacherId, @studentId=:studentId',
        {
          type: QueryTypes.SELECT,
          replacements: { teacherId: dto.teacherId, studentId: dto.studentId },
          raw: true,
        },
      );
      return unaccepted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async addNewStudent(
    addNewStudentsDto: AddNewStudentsByImportDto,
  ): Promise<StudentsFilter[]> {
    try {
      if (!addNewStudentsDto.firstName || !addNewStudentsDto.lastName)
        return [];
      const slug = slugify(
        addNewStudentsDto.lastName + '-' + addNewStudentsDto.firstName,
      );
      const inserted: StudentsFilter[] = await this.sequelize.query(
        'SP_AddNewStudents @firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @email=:email,' +
          '@birthDate=:birthDate,@identityNumber=:identityNumber, @phoneNumber=:phoneNumber, @address=:address, @class=:class,' +
          '@term=:term,@status=:status,@academicYear=:academicYear,@nameTeacher=:nameTeacher,@slug=:slug,' +
          '@internshipCertification=:internshipCertification,@internshipReport=:internshipReport,@internshipGrade=:internshipGrade',
        {
          type: QueryTypes.SELECT,
          replacements: {
            firstName: addNewStudentsDto.firstName.trim(),
            lastName: addNewStudentsDto.lastName.trim(),
            fullName: addNewStudentsDto.fullName.trim(),
            email: addNewStudentsDto.email,
            birthDate: addNewStudentsDto.birthDate,
            identityNumber: addNewStudentsDto.identityNumber,
            phoneNumber: addNewStudentsDto.phoneNumber,
            address: addNewStudentsDto.address,
            class: addNewStudentsDto.class,
            term: addNewStudentsDto.term,
            status: addNewStudentsDto.status,
            academicYear: addNewStudentsDto.academicYear,
            nameTeacher: addNewStudentsDto.nameTeacher,
            internshipCertification: addNewStudentsDto.internshipCertification,
            internshipReport: addNewStudentsDto.internshipReport,
            internshipGrade: addNewStudentsDto.internshipGrade,
            slug,
          },
          raw: true,
        },
      );
      return inserted;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateStudentInformation(
    id: string,
    updateStudentDto?: UpdateStudentDto,
  ) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateStudent @id=:id,@firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @email=:email,' +
          '@birthDate=:birthDate,@identityNumber=:identityNumber, @phoneNumber=:phoneNumber, @address=:address, @class=:class,' +
          '@term=:term,@status=:status,@academicYear=:academicYear,@nameTeacher=:nameTeacher,@slug=:slug,' +
          '@internshipCertification=:internshipCertification,@internshipReport=:internshipReport,@internshipGrade=:internshipGrade',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            firstName: updateStudentDto.firstName?.trim() ?? null,
            lastName: updateStudentDto.lastName?.trim() ?? null,
            fullName: updateStudentDto.fullName?.trim() ?? null,
            email: updateStudentDto.email ?? null,
            birthDate: updateStudentDto.birthDate ?? null,
            identityNumber: updateStudentDto.identityNumber ?? null,
            phoneNumber: updateStudentDto.phoneNumber ?? null,
            address: updateStudentDto.address ?? null,
            class: updateStudentDto.class ?? null,
            term: updateStudentDto.term ?? null,
            status: updateStudentDto.status ?? null,
            academicYear: updateStudentDto.academicYear ?? null,
            nameTeacher: updateStudentDto.nameTeacher ?? null,
            slug: updateStudentDto.slug ?? null,
            internshipCertification:
              updateStudentDto.internshipCertification ?? null,
            internshipReport: updateStudentDto.internshipReport ?? null,
            internshipGrade: updateStudentDto.internshipGrade ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Student,
        },
      );
      updated[0].slug = slugify(
        updated[0].lastName + '-' + updated[0].firstName,
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdateTeacherInformation(
    id: string,
    updateTeacherDto?: UpdateTeacherDto,
  ) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdateTeacher @id=:id,@firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @email=:email,' +
          '@position=:position,@department=:department, @phoneNumber=:phoneNumber,@studentAmount=:studentAmount,@slug=:slug,' +
          '@maximumStudentAmount=:maximumStudentAmount',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            firstName: updateTeacherDto.firstName?.trim() ?? null,
            lastName: updateTeacherDto.lastName?.trim() ?? null,
            fullName: updateTeacherDto.fullName?.trim() ?? null,
            email: updateTeacherDto.email ?? null,
            position: updateTeacherDto.position ?? null,
            department: updateTeacherDto.department ?? null,
            phoneNumber: updateTeacherDto.phoneNumber ?? null,
            studentAmount: updateTeacherDto.studentAmount ?? null,
            slug: updateTeacherDto.slug ?? null,
            maximumStudentAmount: updateTeacherDto.maximumStudentAmount ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Student,
        },
      );
      updated[0].slug = slugify(
        updated[0].lastName + '-' + updated[0].firstName,
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllStudentForClient(
    limit?: number,
    offset?: number,
  ): Promise<StudentsFilter[]> {
    try {
      if (limit < 1 || offset < 0) return [];
      const total: StudentsFilter[] = await this.sequelize.query(
        'SP_GetAllStudentsForClient @limit=:limit,@offset=:offset',
        {
          type: QueryTypes.SELECT,
          replacements: {
            limit,
            offset,
          },
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllStudentForClientByCondition(
    limit?: number,
    offset?: number,
    term?: string,
    fullName?: string,
  ): Promise<StudentsFilter[]> {
    try {
      if (limit < 1 || offset < 0) return [];
      const total: StudentsFilter[] = await this.sequelize.query(
        'SP_GetAllStudentsByTerm @limit=:limit,@offset=:offset,@term=:term,@fullName=:fullName',
        {
          type: QueryTypes.SELECT,
          replacements: {
            limit,
            offset,
            term,
            fullName,
          },
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllStudents(): Promise<SaveStudentAccountForOwnerResponse> {
    try {
      const students = await this.sequelize.query('SP_GetAllStudents', {
        type: QueryTypes.SELECT,
        raw: true,
      });
      return { students };
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllTeachers(): Promise<SaveTeacherAccountForOwnerResponse> {
    try {
      const teachers = await this.sequelize.query('SP_GetAllTeachers', {
        type: QueryTypes.SELECT,
        raw: true,
      });
      return { teachers };
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getStudentByIds(
    id: string,
  ): Promise<SaveStudentAccountForOwnerResponse> {
    try {
      const students = await this.sequelize.query(
        'SP_GetStudentByIds @id=:id ',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
          },
          raw: true,
        },
      );
      return { students };
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getTeacherByIds(
    id: string,
  ): Promise<SaveTeacherAccountForOwnerResponse> {
    try {
      const teachers = await this.sequelize.query(
        'SP_GetTeacherByIds @id=:id ',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
          },
          raw: true,
        },
      );
      return { teachers };
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllStudentsForClientNotPagination() {
    try {
      const total = await this.sequelize.query(
        'SP_GetAllStudentsNotPaginationForClient',
        {
          type: QueryTypes.SELECT,
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllTeacherForClientNotPagination() {
    try {
      const total = await this.sequelize.query(
        'SP_GetAllTeachersNotPaginationForClient',
        {
          type: QueryTypes.SELECT,
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllTeacherForClient(
    limit?: number,
    offset?: number,
  ): Promise<TeachersFilter[]> {
    try {
      if (limit < 1 || offset < 0) return [];
      const total: TeachersFilter[] = await this.sequelize.query(
        'SP_GetAllTeachersForClient @limit=:limit,@offset=:offset',
        {
          type: QueryTypes.SELECT,
          replacements: {
            limit,
            offset,
          },
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllIdentityNumberForClient() {
    try {
      const identityNumber = await this.sequelize.query(
        'SP_GetAllIdentityNumber',
        {
          type: QueryTypes.SELECT,
        },
      );
      return identityNumber;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllTermForClient() {
    try {
      const Term = await this.sequelize.query('SP_GetAllTerm', {
        type: QueryTypes.SELECT,
      });
      return Term;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllClassForClient() {
    try {
      const result = await this.sequelize.query('SP_GetAllClass', {
        type: QueryTypes.SELECT,
      });
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalStudentsInUniversityForClient() {
    try {
      const total = await this.sequelize.query('SP_GetTotalStudentsForClient', {
        type: QueryTypes.SELECT,
        raw: true,
        mapToModel: true,
        model: Student,
      });
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalStudentsInUniversityForClientByCondition(
    term?: string,
    fullName?: string,
  ) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalStudentsByTerm @term=:term,@fullName=:fullName',
        {
          type: QueryTypes.SELECT,
          replacements: {
            term,
            fullName,
          },
          raw: true,
          mapToModel: true,
          model: Student,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalTeachersInUniversityForClient() {
    try {
      const total = await this.sequelize.query('SP_GetTotalTeachersForClient', {
        type: QueryTypes.SELECT,
        raw: true,
        mapToModel: true,
        model: Student,
      });
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getAllDataForStudentByStudentId(id: string) {
    try {
      const total = await this.sequelize.query(
        'SP_GetAllDataForStudentByStudentId @studentId=:id',
        {
          type: QueryTypes.RAW,
          replacements: {
            id,
          },
          raw: true,
        },
      );
      if (
        typeof Object.keys(total) == null ||
        typeof Object.keys(total) == 'undefined' ||
        !total[0].length
      )
        return total[0];
      {
        const info: string = total[0]
          .map((each: string) => {
            return Object.values(each)[0];
          })
          .reduce((acc: string, curr: string) => acc + curr, '');
        return JSON.parse(info);
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getFilterStudentByConditions(
    limit: number,
    offset: number,
    filterStudentDto: FilterStudentDto,
  ): Promise<StudentsFilter[]> {
    try {
      const total: StudentsFilter[] = await this.sequelize.query(
        'SP_GetStudentByConditions @identityNumber=:identityNumber,@fullName=:fullName, @limit=:limit,' +
          '@offset=:offset,@status=:status,@term=:term',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterStudentDto.fullName.trim() ?? null,
            limit,
            offset,
            identityNumber: filterStudentDto.identityNumber ?? null,
            term: filterStudentDto.term ?? null,
            status: filterStudentDto.status ?? null,
          },
          raw: true,
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getFilterTeacherByConditions(
    limit: number,
    offset: number,
    filterTeacherDto: FilterTeacherDto,
  ): Promise<TeachersFilter[]> {
    try {
      const total: TeachersFilter[] = await this.sequelize.query(
        'SP_GetTeacherByConditions @position=:position,@fullName=:fullName, @limit=:limit,' +
          '@offset=:offset,@department=:department',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterTeacherDto.fullName.trim() ?? null,
            limit,
            offset,
            position: filterTeacherDto.position ?? null,
            department: filterTeacherDto.department ?? null,
          },
          raw: true,
        },
      );
      return total;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalFilterStudentByConditions(filterStudentDto?: FilterStudentDto) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalStudentsByConditions @identityNumber=:identityNumber,@fullName=:fullName,@status=:status,@term=:term',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterStudentDto?.fullName.trim(),
            status: filterStudentDto?.status,
            identityNumber: filterStudentDto?.identityNumber,
            term: filterStudentDto?.term,
          },
          raw: true,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getTotalFilterTeacherByConditions(filterTeacherDto?: FilterTeacherDto) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalTeachersByConditions @position=:position,@fullName=:fullName,@department=:department',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterTeacherDto?.fullName.trim(),
            department: filterTeacherDto?.department,
            position: filterTeacherDto?.position,
          },
          raw: true,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getStudentByIdForClient(id: string): Promise<StudentFilter> {
    try {
      const student = await this.sequelize.query('SP_GetStudentById @id=:id', {
        type: QueryTypes.RAW,
        replacements: {
          id,
        },
        raw: true,
      });

      if (
        typeof Object.keys(student) == null ||
        typeof Object.keys(student) == 'undefined' ||
        !student[0].length
      )
        return student[0][0];
      {
        const info: string = student[0]
          .map((each: string) => {
            return Object.values(each)[0];
          })
          .reduce((acc: string, curr: string) => acc + curr, '');
        return JSON.parse(info);
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  public async getTeacherById(id: string) {
    try {
      const teacher = await this.sequelize.query('SP_GetTeacherById @id=:id', {
        type: QueryTypes.RAW,
        replacements: {
          id,
        },
        raw: true,
      });
      if (
        typeof Object.keys(teacher) == null ||
        typeof Object.keys(teacher) == 'undefined' ||
        !teacher[0].length
      )
        return teacher[0];
      {
        const info: string = teacher[0]
          .map((each: string) => {
            return Object.values(each)[0];
          })
          .reduce((acc: string, curr: string) => acc + curr, '');
        return JSON.parse(info);
      }
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
