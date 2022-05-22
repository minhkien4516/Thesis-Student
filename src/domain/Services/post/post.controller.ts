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
} from '@nestjs/common';
import { PostsFilterResponse } from '../../interfaces/getPostForClients.interface';
import { AddNewPostsDto } from './dtos/addNewPost.dto';
import { UpdatePostDto } from './dtos/updatePost.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  private readonly logger = new Logger('PostController');

  constructor(private postService: PostService) {}

  @Post()
  async addNewPost(
    @Query('authorId') authorId: string,
    @Body() addNewPostsDto: AddNewPostsDto,
  ) {
    try {
      const multiPost = await Promise.all(
        addNewPostsDto.post.map(async (item) => {
          const post = await this.postService.addNewPost(authorId, item);
          return post;
        }),
      );
      return multiPost;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch()
  public async updatePost(
    @Query('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      const result = await this.postService.UpdatePost(id, updatePostDto);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Patch('status')
  public async updatePostStatus(@Query('id') id: string) {
    try {
      const result = await this.postService.UpdateStatusPost(id);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('all')
  public async GetAllPosts(
    @Query('authorId') authorId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<PostsFilterResponse> {
    try {
      const data = await this.postService.getAllPostForClient(
        authorId,
        limit,
        offset,
      );
      const total = await this.postService.getTotalPostsForClient(authorId);
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
}
