import { TendiflowMimeType } from "@/api/services/tendiflow/types/file";

import { STORAGE_HEADERS } from "../constants/general";
import { StorageHeader } from "./enums";
/**
 * Gets the MIME type of a file.
 *
 * @param {File} file - The file to get the MIME type of.
 * @returns {MimeType | null} The MIME type of the file, or null if it is not recognised.
 */
export const getMimeType = (file: File | null): TendiflowMimeType | null => {
  if (!file) {
    return null;
  }
  const mimeType = file.type;
  const values = Object.values(TendiflowMimeType);
  if (values.includes(mimeType as TendiflowMimeType)) {
    return mimeType as TendiflowMimeType;
  }
  return null;
};

/**
 * Gets the MIME types of multiple files.
 *
 * @param {File[]} files - The files to get the MIME types of.
 * @returns {TendiflowMimeType[]} The MIME types of the files.
 */
export const getMimeTypes = (files: File[]): TendiflowMimeType[] => {
  const mimes: TendiflowMimeType[] = [];
  for (const file of files) {
    const mimeType = getMimeType(file);
    if (mimeType) {
      mimes.push(mimeType);
    }
  }
  return mimes;
};

/**
 * Uploads a file to Google Cloud Storage using a signed URL.
 *
 * @param {string} signedUrl - The signed URL provided by Google Cloud Storage for uploading the file.
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<Response>} A promise that resolves to the fetch response.
 */
export const uploadFileToGoogleStorage = async (
  signedUrl: string,
  file: File,
): Promise<Response> => {
  try {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Length": `${file.size}`,
        [StorageHeader.CONTENT_LENGTH_RANGE]:
          STORAGE_HEADERS[StorageHeader.CONTENT_LENGTH_RANGE],
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Uploads multiple files to Google Cloud Storage using signed URLs.
 *
 * @param {string[]} signedUrls - The signed URLs provided by Google Cloud Storage for uploading the files.
 * @param {File[]} files - The files to be uploaded.
 * @returns {Promise<boolean>} A promise that resolves to true if all files are uploaded successfully.
 */
export const uploadFilesToGoogleStorage = async (
  signedUrls: string[],
  files: File[],
): Promise<boolean> => {
  try {
    if (signedUrls.length !== files.length) {
      throw new Error("Signed URL and file arrays must be the same length");
    }

    const responses = await Promise.all(
      signedUrls.map((signedUrl, index) =>
        uploadFileToGoogleStorage(signedUrl, files[index]),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("Failed to upload one or more files");
    }

    return true;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

/**
 * Gets the URL of a file stored in Google Cloud Storage.
 *
 * @param {string} pathname - The pathname of the file in Google Cloud Storage.
 * @returns {string} The URL of the file.
 */
export const getGoogleStorageFileUrl = (pathname: string): string => {
  if (pathname.startsWith("blob:http")) {
    return pathname;
  }
  return `https://storage.googleapis.com/${pathname}`;
};

/**
 * Converts bytes to the most readable big unit (KB, MB, GB, TB, etc.)
 * @param {number} bytes The size in bytes.
 * @returns {string} A formatted string representing the size in the most readable unit.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 0) throw new Error("Bytes should not be negative");
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const precision = 2;
  let unitIndex = 0;
  let updatedBytes = bytes;
  while (updatedBytes >= 1024 && unitIndex < units.length - 1) {
    updatedBytes /= 1024;
    unitIndex += 1;
  }
  const formatted = updatedBytes.toFixed(precision);
  return `${formatted.endsWith(".00") ? parseInt(formatted, 10) : formatted} ${units[unitIndex]}`;
};
