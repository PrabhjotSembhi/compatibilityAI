import { AppError } from "@/server/errors";

export type StorageObject = {
  bucket: string;
  key: string;
  contentType: string;
  size: number;
};

export interface StorageService {
  putObject(object: StorageObject, body: Blob | Buffer): Promise<void>;
  getPublicUrl(object: Pick<StorageObject, "bucket" | "key">): string;
}

export class DeferredStorageService implements StorageService {
  async putObject(): Promise<void> {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      "File storage is not configured in Phase 2.",
    );
  }

  getPublicUrl(): string {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      "File storage is not configured in Phase 2.",
    );
  }
}

export const storageService: StorageService = new DeferredStorageService();
