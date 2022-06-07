import { authPackageProvideToken } from './../../../constants/authService.constant';
import { Controller, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import { SaveStudentAccountForOwnerRequest } from '../../interfaces/saveStudentAccountForOwnerRequest.interface';
import { SaveStudentAccountForOwnerResponse } from '../../interfaces/saveStudentAccountForOwnerResponse.interface';
import { Observable } from 'rxjs';

interface IAuthService {
  registerStudent(
    data: SaveStudentAccountForOwnerRequest,
  ): Observable<SaveStudentAccountForOwnerResponse>;
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
}
