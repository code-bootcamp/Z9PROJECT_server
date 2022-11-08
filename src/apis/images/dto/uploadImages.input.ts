import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UploadImagesInput {
  @Field(() => [GraphQLUpload])
  image: FileUpload[];

  @Field(() => [Boolean])
  isMain: boolean[];

  @Field(() => [Boolean])
  isContents: boolean[];

  @Field(() => [Number], { nullable: true })
  contentsOrder: number[];

  @Field(() => [Boolean])
  isAuth: boolean[];

  @Field(() => [String])
  userId: string[];
}
