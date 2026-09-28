import { request, requestMultipart } from "@/services/api.service";
import type { MediaResponse } from "@/types/media";

/**
 * Generic upload → server immediately sets media to READY.
 * Used for cover images, course thumbnails, etc.
 */
export const mediaService = {
    upload: (file: File) => {
        const mediaType = file.type.startsWith("audio") ? "AUDIO" : "IMAGE";
        const body = new FormData();
        body.append("file", file);
        body.append("mediaType", mediaType);
        return requestMultipart<MediaResponse>("/v1/content/media", body);
    },

    /**
     * Question-draft upload flow.
     * Uploads to Cloudinary but keeps media status as PENDING on the server.
     * Status transitions to READY only when the question is saved with this mediaId.
     * Orphaned PENDING media (user navigates away without saving) are cleaned up by a server cron job.
     */
    uploadForQuestionDraft: (file: File) => {
        const mediaType = file.type.startsWith("audio") ? "AUDIO" : "IMAGE";
        const body = new FormData();
        body.append("file", file);
        body.append("mediaType", mediaType);
        return requestMultipart<MediaResponse>("/v1/content/media/question-draft", body);
    },

    delete: (mediaId: number) => request<void>(`/v1/content/media/${mediaId}`, { method: "DELETE" }),
};