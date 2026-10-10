import { request } from "@/services/api.service";
import type { Activity } from "@/types/student/activity";

export const studentActivityService = {
  list: (unitId: number) =>
    request<Activity[]>(`/v1/activities?unitId=${unitId}&includeArchived=false`),
  get: (id: number) => request<Activity>(`/v1/activities/${id}`),
};
