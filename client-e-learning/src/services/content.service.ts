import { request } from "@/services/api.service";
import type { ContentSection, ContentTopic, ContentUnit, CreateSectionRequest, CreateTopicRequest, CreateUnitRequest, UpdateSectionRequest, UpdateTopicRequest, UpdateUnitRequest } from "@/types/content";

export const contentService = {
  listUnits: (gradeId: number) => request<ContentUnit[]>(`/v1/content/units?gradeId=${gradeId}`),
  getUnit: (id: number) => request<ContentUnit>(`/v1/content/units/${id}`),
  createUnit: (payload: CreateUnitRequest) => request<ContentUnit>("/v1/content/units", { method: "POST", body: JSON.stringify(payload) }),
  updateUnit: (id: number, payload: UpdateUnitRequest) => request<ContentUnit>(`/v1/content/units/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveUnit: (id: number) => request<ContentUnit>(`/v1/content/units/${id}/archive`, { method: "PATCH" }),

  listSections: (unitId: number) => request<ContentSection[]>(`/v1/content/sections?unitId=${unitId}`),
  getSection: (id: number) => request<ContentSection>(`/v1/content/sections/${id}`),
  createSection: (payload: CreateSectionRequest) => request<ContentSection>("/v1/content/sections", { method: "POST", body: JSON.stringify(payload) }),
  updateSection: (id: number, payload: UpdateSectionRequest) => request<ContentSection>(`/v1/content/sections/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveSection: (id: number) => request<ContentSection>(`/v1/content/sections/${id}/archive`, { method: "PATCH" }),

  listTopics: (sectionId: number) => request<ContentTopic[]>(`/v1/content/topics?sectionId=${sectionId}`),
  getTopic: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}`),
  createTopic: (payload: CreateTopicRequest) => request<ContentTopic>("/v1/content/topics", { method: "POST", body: JSON.stringify(payload) }),
  updateTopic: (id: number, payload: UpdateTopicRequest) => request<ContentTopic>(`/v1/content/topics/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  archiveTopic: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}/archive`, { method: "PATCH" }),
};
