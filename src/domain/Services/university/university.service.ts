import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DatabaseError, QueryTypes } from 'sequelize';
import slugify from 'vietnamese-slug';
import { StudentsFilter } from '../../interfaces/getStudentForClients.interface';
import { AddNewStudentsByImportDto } from './dtos/addNewStudents.dtos';
import { Student } from '../../Models/student.model';
import { UpdateStudentDto } from './dtos/updateStudent.dtos';
import { FilterStudentDto } from './dtos/filterStudent.dtos';

@Injectable()
export class UniversityService {
  private readonly logger = new Logger('UniversityService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewStudent(
    addNewStudentsDto: AddNewStudentsByImportDto,
  ): Promise<StudentsFilter[]> {
    try {
      if (!addNewStudentsDto.firstName || !addNewStudentsDto.lastName)
        return [];
      const slug = slugify(
        addNewStudentsDto.lastName + '-' + addNewStudentsDto.firstName,
        // {
        //   lower: true,
        //   trim: true,
        //   replacement: '-',
        // },
      );
      const inserted: StudentsFilter[] = await this.sequelize.query(
        'SP_AddNewStudents @firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @email=:email,' +
          '@birthDate=:birthDate,@identityNumber=:identityNumber, @phoneNumber=:phoneNumber, @address=:address, @class=:class,' +
          '@term=:term,@status=:status,@academicYear=:academicYear,@slug=:slug',
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
      if (!updateStudentDto.firstName || !updateStudentDto.lastName) return [];
      const slug = slugify(
        updateStudentDto.lastName + '-' + updateStudentDto.firstName,
        // {
        //   lower: true,
        //   trim: true,
        //   replacement: '-',
        // },
      );
      const updated = await this.sequelize.query(
        'SP_UpdateStudent @id=:id,@firstName=:firstName, @lastName=:lastName,@fullName=:fullName, @email=:email,' +
          '@birthDate=:birthDate,@identityNumber=:identityNumber, @phoneNumber=:phoneNumber, @address=:address, @class=:class,' +
          '@term=:term,@status=:status,@academicYear=:academicYear,@slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            firstName: updateStudentDto?.firstName.trim() ?? null,
            lastName: updateStudentDto?.lastName.trim() ?? null,
            fullName: updateStudentDto?.fullName.trim() ?? null,
            email: updateStudentDto.email ?? null,
            birthDate: updateStudentDto.birthDate ?? null,
            identityNumber: updateStudentDto.identityNumber ?? null,
            phoneNumber: updateStudentDto.phoneNumber ?? null,
            address: updateStudentDto.address ?? null,
            class: updateStudentDto.class ?? null,
            term: updateStudentDto.term ?? null,
            status: updateStudentDto.status ?? null,
            academicYear: updateStudentDto.academicYear ?? null,
            slug,
          },
          raw: true,
          mapToModel: true,
          model: Student,
        },
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
          '@offset=:offset,@status=:status',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterStudentDto.fullName.trim(),
            limit,
            offset,
            identityNumber: filterStudentDto.identityNumber,
            status: filterStudentDto.status,
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
        'SP_GetTotalStudentsByConditions @identityNumber=:identityNumber,@fullName=:fullName,@status=:status',
        {
          type: QueryTypes.SELECT,
          replacements: {
            fullName: filterStudentDto?.fullName.trim(),
            status: filterStudentDto?.status,
            identityNumber: filterStudentDto?.identityNumber,
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
}
