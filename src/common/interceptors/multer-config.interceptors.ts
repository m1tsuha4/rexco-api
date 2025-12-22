import { BadRequestException, UseInterceptors } from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const ensureDirExists = (folder: string) => {
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }
};

export function UploadImageInterceptor(folderName: string = '') {
  const folderPath = `./uploads/${folderName}`;

  ensureDirExists(folderPath);

  return UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, folderPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  );
}

export function UploadImagesInterceptor(folderName: string, maxCount = 3) {
  const folderPath = `./uploads/${folderName}`;
  ensureDirExists(folderPath);

  return UseInterceptors(
    FilesInterceptor('files', maxCount, {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, folderPath),
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  );
}

export function UploadPdfInterceptor(
  folderName: string = 'pdfs',
  maxSizeBytes = 10 * 1024 * 1024,
) {
  const folderPath = `./uploads/${folderName}`;
  ensureDirExists(folderPath);

  return UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, folderPath),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname) || '.pdf';
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: maxSizeBytes,
      },
    }),
  );
}

export function UploadProductFilesInterceptor() {
  const imagePath = './uploads/product/images';
  const docPath = './uploads/product/documents';
  const iconPath = './uploads/product/icons';
  const primaryImagePath = './uploads/product/primary-image';

  ensureDirExists(imagePath);
  ensureDirExists(docPath);
  ensureDirExists(iconPath);
  ensureDirExists(primaryImagePath);

  return UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'documents', maxCount: 5 },
        { name: 'icon', maxCount: 5 },
        { name: 'primaryImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'images') {
              cb(null, imagePath);
            } else if (file.fieldname === 'documents') {
              cb(null, docPath);
            } else if (file.fieldname === 'icon') {
              cb(null, iconPath);
            } else if (file.fieldname === 'primaryImage') {
              cb(null, primaryImagePath);
            } else {
              cb(new BadRequestException('Invalid file field'), '');
            }
          },
          filename: (_req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (
            file.fieldname === 'images' &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(new BadRequestException('Only images allowed'), false);
          }

          if (
            file.fieldname === 'documents' &&
            file.mimetype !== 'application/pdf'
          ) {
            return cb(new BadRequestException('Only PDF allowed'), false);
          }

          if (
            file.fieldname === 'icon' &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(new BadRequestException('Only images allowed'), false);
          }

          if (
            file.fieldname === 'primaryImage' &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(new BadRequestException('Only images allowed'), false);
          }

          cb(null, true);
        },
      },
    ),
  );
}

export function UploadFilesInterceptor(options: {
  imageField: string;
  documentField: string;
  imagePath: string;
  documentPath: string;
  imageMax?: number;
  documentMax?: number;
}) {
  const {
    imageField,
    documentField,
    imagePath,
    documentPath,
    imageMax = 1,
    documentMax = 1,
  } = options;

  ensureDirExists(imagePath);
  ensureDirExists(documentPath);

  return UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: imageField, maxCount: imageMax },
        { name: documentField, maxCount: documentMax },
      ],
      {
        storage: diskStorage({
          destination: (_req, file, cb) => {
            if (file.fieldname === imageField) {
              cb(null, imagePath);
            } else if (file.fieldname === documentField) {
              cb(null, documentPath);
            } else {
              cb(new BadRequestException('Invalid file field'), '');
            }
          },
          filename: (_req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (
            file.fieldname === imageField &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(
              new BadRequestException('Only image files allowed'),
              false,
            );
          }

          if (
            file.fieldname === documentField &&
            file.mimetype !== 'application/pdf'
          ) {
            return cb(new BadRequestException('Only PDF files allowed'), false);
          }

          cb(null, true);
        },
      },
    ),
  );
}
