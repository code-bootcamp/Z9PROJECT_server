import { FileUpload } from 'graphql-upload';

export interface ImageUploadData {
  image: FileUpload;
  isMain: boolean;
  isContents: boolean;
  contentsOrder?: number;
  userd?: string;
}
