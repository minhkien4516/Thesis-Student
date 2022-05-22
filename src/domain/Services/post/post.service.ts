import { DatabaseError } from 'sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { AddNewPostDto } from './dtos/addNewPost.dto';
import { Post } from '../../Models/post.model';
import { UpdatePostDto } from './dtos/updatePost.dto';
import { PostsFilter } from '../../interfaces/getPostForClients.interface';

@Injectable()
export class PostService {
  private readonly logger = new Logger('PostService');

  constructor(private readonly sequelize: Sequelize) {}

  public async addNewPost(
    authorId: string,
    addNewPostDto: AddNewPostDto,
  ): Promise<Post> {
    try {
      const inserted = await this.sequelize.query(
        'SP_AddNewPostInformation @title=:title, @content=:content, @authorId=:authorId',
        {
          type: QueryTypes.SELECT,
          replacements: {
            title: addNewPostDto.title,
            content: addNewPostDto.content,
            authorId,
          },
          raw: true,
          mapToModel: true,
          model: Post,
        },
      );
      console.log(inserted);
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  async UpdateStatusPost(id: string) {
    try {
      const updatedStatus = await this.sequelize.query(
        'SP_UpdateStatusPost @id=:id',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
          },
          raw: true,
          mapToModel: true,
          model: Post,
        },
      );
      return updatedStatus[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async UpdatePost(id: string, updatePostDto?: UpdatePostDto) {
    try {
      const updated = await this.sequelize.query(
        'SP_UpdatePostInformation @id=:id,@title=:title, @content=:content',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id,
            title: updatePostDto.title ?? null,
            content: updatePostDto.content ?? null,
          },
          raw: true,
          mapToModel: true,
          model: Post,
        },
      );
      return updated[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  public async getAllPostForClient(
    authorId: string,
    limit?: number,
    offset?: number,
  ): Promise<PostsFilter[]> {
    try {
      if (limit < 1 || offset < 0) return [];
      const total: PostsFilter[] = await this.sequelize.query(
        'SP_GetAllPostByAuthorId @authorId=:authorId,@limit=:limit,@offset=:offset',
        {
          type: QueryTypes.SELECT,
          replacements: {
            authorId,
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

  async getTotalPostsForClient(authorId: string) {
    try {
      const total = await this.sequelize.query(
        'SP_GetTotalPostsForClient @authorId=:authorId',
        {
          type: QueryTypes.SELECT,
          replacements: { authorId },
          raw: true,
          mapToModel: true,
          model: Post,
        },
      );
      return total[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
