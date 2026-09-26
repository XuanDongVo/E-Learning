import { request, requestMultipart } from "@/services/api.service";
import type { MediaResponse } from "@/types/media";

export const mediaService = {
    upload: (file: File) => {
        const body = new FormData();
        body.append("file", file);
        body.append("mediaType", "IMAGE");
        return requestMultipart<MediaResponse>("/v1/content/media", body);
    },
    delete: (mediaId: number) => request<void>(`/v1/content/media/${mediaId}`, { method: "DELETE" }),
};