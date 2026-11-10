import type { Assignment, BlockItem, ID, QuestionItem, ToolKey } from "@/types/assignment-builder";
import type { GuideScenario } from "../../shared-guide";

export interface GuideActions {
  addBlock: (sectionId: ID) => void;
  addQuestion: (sectionId: ID, groupId?: ID | null) => void;
  generateBlanks: (blockId: ID) => void;
  updateBlock: (id: ID, fn: (block: BlockItem) => void) => void;
  updateQuestion: (id: ID, fn: (question: QuestionItem) => void) => void;
  selectQuestion: (id: ID) => void;
  moveBlock: (blockId: ID, sectionId: ID) => void;
  toggleGroup: (questionId: ID, blockId: ID) => void;
  deleteBlock: (blockId: ID, keepMembers: boolean) => void;
  addToolAt: (tool: ToolKey, sectionId: ID, groupId?: ID | null) => void;
}

export interface GuideWorkspaceProps {
  practice: Assignment;
  scenario: GuideScenario;
  step: number;
  selectedId: ID | null;
  block: BlockItem | null;
  actions: GuideActions;
}
