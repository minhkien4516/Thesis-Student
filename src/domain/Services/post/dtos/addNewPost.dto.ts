import { IsNotEmpty, IsString } from 'class-validator';

export class AddNewPostDto {
  @IsString()
  @IsNotEmpty()
  title?: string | null;

  @IsString()
  @IsNotEmpty()
  content?: string | null;
}

export class AddNewPostsDto {
  post: [AddNewPostDto];
}
