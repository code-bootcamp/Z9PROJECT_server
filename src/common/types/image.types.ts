import { FileUpload } from 'graphql-upload';
import { User } from 'src/apis/users/entities/user.entity';

export interface ImageUploadData {
  image: FileUpload;
  isMain: boolean;
  isContents: boolean;
  contentsOrder?: number;
  userd?: string;
}
