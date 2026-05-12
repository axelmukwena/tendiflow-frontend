export enum TendiflowMimeType {
  PNG = "image/png",
  GIF = "image/gif",
  JPG = "image/jpeg",
  WEBP = "image/webp",
  TIFF = "image/tiff",
  SVG = "image/svg+xml",
  ICON = "image/x-icon",
  BMP = "image/bmp",
  PDF = "application/pdf",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  CSV = "text/csv",
  TSV = "text/tab-separated-values",
  JSON = "application/json",
  XML = "application/xml",
}

export interface TendiflowFileCreate {
  blob_name: string;
  name: string;
  pathname: string;
  mime_type: TendiflowMimeType;
  size_bytes: number;
  position: number;
  notes?: string | null;
  file: File;
}

export interface TendiflowFile {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  blob_name: string;
  name: string;
  pathname: string;
  mime_type: TendiflowMimeType;
  size_bytes: number;
  position: number;
  notes: string | null;
}

export interface SignedUrl {
  signed_url: string;
  blob_name: string;
  pathname: string;
  mime_type: TendiflowMimeType;
}
