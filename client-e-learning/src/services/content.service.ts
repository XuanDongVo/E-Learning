import { unitService } from "./content/content.unit.service";
import { sectionService } from "./content/content.section.service";
import { topicService } from "./content/content.topic.service";
import { questionBankService } from "./content/content.questionBank.service"
import { questionService } from "./content/content.question.service";
import { mediaService } from "./content/content.media.service";

export const contentService = {
  // Media
  uploadMedia: mediaService.upload,
  deleteMedia: mediaService.delete,

  // Unit
  listUnits: unitService.list,
  getUnit: unitService.get,
  createUnit: unitService.create,
  updateUnit: unitService.update,
  archiveUnit: unitService.archive,
  updateUnitStatus: unitService.updateStatus,
  reorderUnits: unitService.reorder,

  // Section
  listSections: sectionService.list,
  getSection: sectionService.get,
  createSection: sectionService.create,
  updateSection: sectionService.update,
  archiveSection: sectionService.archive,
  updateSectionStatus: sectionService.updateStatus,
  reorderSections: sectionService.reorder,

  // Topic
  listTopics: topicService.list,
  getTopic: topicService.get,
  createTopic: topicService.create,
  updateTopic: topicService.update,
  archiveTopic: topicService.archive,
  updateTopicStatus: topicService.updateStatus,
  reorderTopics: topicService.reorder,

  // QuestionBank
  listQuestionBanks: questionBankService.list,
  getQuestionBank: questionBankService.get,
  createQuestionBank: questionBankService.create,
  updateQuestionBank: questionBankService.update,
  archiveQuestionBank: questionBankService.archive,
  updateQuestionBankStatus: questionBankService.updateStatus,

  // Question
  listQuestions: questionService.list,
  getQuestion: questionService.get,
};

export { unitService, sectionService, topicService, questionBankService, questionService, mediaService };