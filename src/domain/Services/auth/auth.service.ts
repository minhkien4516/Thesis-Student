import { Controller, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import { SaveStudentAccountForOwnerRequest } from '../../interfaces/saveStudentAccountForOwnerRequest.interface';
import { SaveStudentAccountForOwnerResponse } from '../../interfaces/saveStudentAccountForOwnerResponse.interface';
import { Observable } from 'rxjs';
import { authPackageProvideToken } from '../../../common/constants/authService.constant';
import { SaveTeacherAccountForOwnerRequest } from '../../interfaces/saveTeacherAccountForOwnerRequest.interface';
import { SaveTeacherAccountForOwnerResponse } from '../../interfaces/saveTeacherAccountForOwnerResponse.interface';

interface IAuthService {
  registerStudent(
    data: SaveStudentAccountForOwnerRequest,
  ): Observable<SaveStudentAccountForOwnerResponse>;
  registerTeacher(
    data: SaveTeacherAccountForOwnerRequest,
  ): Observable<SaveTeacherAccountForOwnerResponse>;
}

@Controller()
export class AuthService implements IAuthService, OnModuleInit {
  private authService!: IAuthService;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(authPackageProvideToken)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<IAuthService>(AuthService.name);
  }

  registerStudent(
    data: SaveStudentAccountForOwnerRequest,
  ): Observable<SaveStudentAccountForOwnerResponse> {
    return this.authService.registerStudent(data);
  }

  registerTeacher(
    data: SaveTeacherAccountForOwnerRequest,
  ): Observable<SaveTeacherAccountForOwnerResponse> {
    return this.authService.registerTeacher(data);
  }
}
