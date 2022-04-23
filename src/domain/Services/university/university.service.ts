import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DatabaseError, QueryTypes } from 'sequelize';
import slugify from 'vietnamese-slug';
import { StudentsFilter } from '../../interfaces/getStudentForClients.interface';
import { AddNewStudentsDto } from './dtos/addNewStudents.dtos';

@Injectable()
export class UniversityService {
  private readonly logger = new Logger('UniversityService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewStudent(
    addNewStudentsDto: AddNewStudentsDto,
  ): Promise<StudentsFilter[]> {
    try {
      if (!addNewStudentsDto.firstName || !addNewStudentsDto.lastName)
        return [];
      const slug = slugify(
        addNewStudentsDto.lastName + addNewStudentsDto.firstName,
        '-',
        // {
        //   lower: true,
        //   trim: true,
        //   replacement: '-',
        // },
      );
      const inserted: StudentsFilter[] = await this.sequelize.query(
        'SP_AddNewStudents @firstName=:firstName, @lastName=:lastName, @email=:email,' +
          '@birthDate=:birthDate,@identityNumber=:identityNumber, @phoneNumber=:phoneNumber, @address=:address, @class=:class,' +
          '@term=:term,@status=:status,@academicYear=:academicYear,@slug=:slug',
        {
          type: QueryTypes.SELECT,
          replacements: {
            firstName: addNewStudentsDto.firstName.trim(),
            lastName: addNewStudentsDto.lastName.trim(),
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
}
