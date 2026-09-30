import { request } from "@/services/api.service";
import type { Activity, ActivityReadiness, ActivitySourceOption, CreateActivityRequest, UpdateActivityRequest, ActivityStatus } from "@/types/activity";

export const activityService = {
  list: (unitId:number, includeArchived=false) =>
    request<Activity[]>(`/v1/activities?unitId=${unitId}&includeArchived=${includeArchived}`),
  get: (id:number) => request<Activity>(`/v1/activities/${id}`),
  sources: (unitId:number) => request<ActivitySourceOption[]>(`/v1/activities/sources?unitId=${unitId}`),
  create: (payload:CreateActivityRequest) => request<Activity>("/v1/activities", {method:"POST", body:JSON.stringify(payload)}),
  update: (id:number,payload:UpdateActivityRequest) => request<Activity>(`/v1/activities/${id}`, {method:"PUT", body:JSON.stringify(payload)}),
  updateStatus: (id:number,status:ActivityStatus) => request<Activity>(`/v1/activities/${id}/status`, {method:"PATCH", body:JSON.stringify({status})}),
  readiness: (id:number) => request<ActivityReadiness>(`/v1/activities/${id}/readiness`),
};
