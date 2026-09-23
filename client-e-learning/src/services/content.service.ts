import { request, requestMultipart } from "@/services/api.service";
import type { MediaResponse } from "@/types/media";
import type { ContentSection, ContentTopic, ContentUnit, CreateSectionRequest, CreateTopicRequest, CreateUnitRequest, ReorderRequest, UpdateSectionRequest, UpdateStatusRequest, UpdateTopicRequest, UpdateUnitRequest } from "@/types/content";

export const contentService = {
  uploadMedia: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "IMAGE");
    return requestMultipart<MediaResponse>("/v1/content/media", body);
  },
  listUnits: (gradeId: number) => request<ContentUnit[]>(`/v1/content/units?gradeId=${gradeId}`),
  getUnit: (id: number) => request<ContentUnit>(`/v1/content/units/${id}`),
  createUnit: (payload: CreateUnitRequest) => request<ContentUnit>("/v1/content/units", { method: "POST", body: JSON.stringify(payload) }),
  updateUnit: (id: number, payload: UpdateUnitRequest) => request<ContentUnit>(`/v1/content/units/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveUnit: (id: number) => request<ContentUnit>(`/v1/content/units/${id}/archive`, { method: "PATCH" }),
  updateUnitStatus: (id: number, payload: UpdateStatusRequest) => request<ContentUnit>(`/v1/content/units/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  reorderUnits: (gradeId: number, payload: ReorderRequest) => request<void>(`/v1/content/units/order?gradeId=${gradeId}`, { method: "PUT", body: JSON.stringify(payload) }),

  listSections: (unitId: number) => request<ContentSection[]>(`/v1/content/sections?unitId=${unitId}`),
  getSection: (id: number) => request<ContentSection>(`/v1/content/sections/${id}`),
  createSection: (payload: CreateSectionRequest) => request<ContentSection>("/v1/content/sections", { method: "POST", body: JSON.stringify(payload) }),
  updateSection: (id: number, payload: UpdateSectionRequest) => request<ContentSection>(`/v1/content/sections/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveSection: (id: number) => request<ContentSection>(`/v1/content/sections/${id}/archive`, { method: "PATCH" }),
  updateSectionStatus: (id: number, payload: UpdateStatusRequest) => request<ContentSection>(`/v1/content/sections/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  reorderSections: (unitId: number, payload: ReorderRequest) => request<void>(`/v1/content/sections/order?unitId=${unitId}`, { method: "PUT", body: JSON.stringify(payload) }),

  listTopics: (sectionId: number) => request<ContentTopic[]>(`/v1/content/topics?sectionId=${sectionId}`),
  getTopic: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}`),
  createTopic: (payload: CreateTopicRequest) => request<ContentTopic>("/v1/content/topics", { method: "POST", body: JSON.stringify(payload) }),
  updateTopic: (id: number, payload: UpdateTopicRequest) => request<ContentTopic>(`/v1/content/topics/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveTopic: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}/archive`, { method: "PATCH" }),
  updateTopicStatus: (id: number, payload: UpdateStatusRequest) => request<ContentTopic>(`/v1/content/topics/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  reorderTopics: (sectionId: number, payload: ReorderRequest) => request<void>(`/v1/content/topics/order?sectionId=${sectionId}`, { method: "PUT", body: JSON.stringify(payload) }),
};
