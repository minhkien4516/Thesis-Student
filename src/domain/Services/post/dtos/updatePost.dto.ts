import { PartialType } from '@nestjs/swagger';
import { AddNewPostDto } from './addNewPost.dto';

export class UpdatePostDto extends PartialType(AddNewPostDto) {}
