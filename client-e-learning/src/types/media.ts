export type MediaType = "IMAGE" | "AUDIO";
export type MediaStatus = "PENDING" | "READY" | "FAILED" | "DELETED";

export interface MediaResponse {
  id: number;
  mediaType: MediaType;
  originalName: string;
  format: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  status: MediaStatus;
  url?: string;
}