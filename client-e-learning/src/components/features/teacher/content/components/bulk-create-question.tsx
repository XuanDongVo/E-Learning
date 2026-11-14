"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileSpreadsheet, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { QuestionComposer } from "@/components/features/teacher/question-authoring/QuestionComposer";
import { importedQuestionsToDrafts } from "./imported-question.mapper";
import {
  clearQuestionImportHandoff,
  getQuestionImportHandoff,
  markQuestionImportApplied,
  type QuestionImportHandoff,
} from "@/services/content/question-import-handoff";
import { contentService } from "@/services/content.service";
import { questionService } from "@/services/content/content.question.service";
import type { ContentView } from "@/types/content";
import type { DraftQuestion } from "@/types/question";

type EditorState =
  | { kind: "loading" }
  | { kind: "ready"; entry: QuestionImportHandoff | null }
  | { kind: "conflict"; entry: QuestionImportHandoff }
  | { kind: "error"; message: string };

function existingDraft(key: string): boolean {
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.length) return false;
  if (!parsed.every((item) => typeof item === "object" && item !== null
    && typeof item.draftId === "string" && typeof item.text === "string")) {
    throw new Error("Bản nháp hiện tại bị lỗi. Không ghi đè bản nháp tự động.");
  }
  return true;
}

export function BulkQuestionCreator({
  bankId,
  bankName = "Question Bank",
  importId,
  onNavigate,
}: {
  bankId: number;
  bankName?: string;
  importId?: string;
  onNavigate: (view: ContentView, bankId: number) => void;
}) {
  const { user, isLoading } = useAuth();
  const storageKey = "elearning_question_draft:QUESTION_BANK:" + bankId;
  const [state, setState] = useState<EditorState>({ kind: "loading" });

  const removeImportFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    query.delete("importId");
    window.history.replaceState(window.history.state, "", window.location.pathname + (query.size ? "?" + query.toString() : ""));
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "TEACHER") {
      setState({ kind: "error", message: "Vui lòng đăng nhập bằng tài khoản giáo viên." });
      return;
    }
    if (!importId) {
      setState({ kind: "ready", entry: null });
      return;
    }
    const entry = getQuestionImportHandoff(importId, bankId, user.id);
    if (!entry) {
      setState({ kind: "error", message: "Phiên import không còn tồn tại hoặc không thuộc Question Bank và tài khoản này. Vui lòng upload CSV lại." });
      return;
    }
    if (entry.status === "applied") {
      try {
        if (!existingDraft(storageKey)) {
          setState({ kind: "error", message: "Bản nháp CSV không còn được lưu. Vui lòng import lại file." });
          return;
        }
        setState({ kind: "ready", entry });
      } catch (error) {
        setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể tải bản nháp." });
      }
      return;
    }
    try {
      if (existingDraft(storageKey)) {
        setState({ kind: "conflict", entry });
      } else {
        const drafts = importedQuestionsToDrafts(entry.result.validQuestions, bankId);
        localStorage.setItem(storageKey, JSON.stringify(drafts));
        markQuestionImportApplied(entry);
        setState({ kind: "ready", entry: getQuestionImportHandoff(importId, bankId, user.id) });
      }
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể lưu bản nháp CSV." });
    }
  }, [bankId, importId, isLoading, storageKey, user?.id, user?.role]);

  const resolve = (choice: "keep" | "replace") => {
    if (state.kind !== "conflict") return;
    try {
      if (choice === "keep") {
        clearQuestionImportHandoff(state.entry.importId);
        setState({ kind: "ready", entry: null });
        removeImportFromUrl();
        return;
      }
      const drafts = importedQuestionsToDrafts(state.entry.result.validQuestions, bankId);
      localStorage.setItem(storageKey, JSON.stringify(drafts));
      markQuestionImportApplied(state.entry);
      setState({
        kind: "ready",
        entry: user ? getQuestionImportHandoff(state.entry.importId, bankId, user.id) : null,
      });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể ghi bản nháp." });
    }
  };

  if (state.kind === "loading") {
    return <div role="status" className="flex items-center gap-2 p-8 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Đang tải bản nháp...</div>;
  }
  if (state.kind === "error") {
    return (
      <section role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="flex items-center gap-2 font-semibold text-rose-900"><AlertTriangle size={18} /> Không thể mở trình chỉnh sửa</p>
        <p className="mt-2 text-sm text-rose-800">{state.message}</p>
        <button type="button" onClick={() => onNavigate("import", bankId)} className="mt-4 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold">Quay lại Import CSV</button>
      </section>
    );
  }
  if (state.kind === "conflict") {
    return (
      <section role="dialog" aria-modal="true" aria-labelledby="csv-draft-conflict" className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <FileSpreadsheet size={24} className="shrink-0 text-amber-700" />
          <div>
            <h2 id="csv-draft-conflict" className="text-lg font-bold text-slate-900">Đã có bản nháp chưa lưu</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Question Bank này đang có bản nháp. Bạn muốn giữ nó hay thay bằng {state.entry.result.validCount} câu hợp lệ từ CSV?
              Thay thế sẽ ghi đè bản nháp cũ. Báo cáo lỗi CSV vẫn được giữ.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => resolve("keep")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Giữ bản nháp cũ</button>
          <button type="button" onClick={() => resolve("replace")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thay bằng câu từ CSV</button>
        </div>
      </section>
    );
  }

  const activeImportId = state.entry?.importId;
  return (
    <QuestionComposer
      key={String(bankId) + ":" + (activeImportId ?? "manual")}
      title={"Create questions for " + bankName}
      onBack={() => onNavigate("bank", bankId)}
      description="Create direct or Guided Questions in one draft. Guided steps are saved atomically with their final Question."
      storageKey={storageKey}
      importReport={state.entry?.result}
      onDraftCleared={() => {
        if (activeImportId) {
          clearQuestionImportHandoff(activeImportId);
          setState({ kind: "ready", entry: null });
          removeImportFromUrl();
        }
      }}
      onUploadMedia={async (file) => {
        const response = await contentService.uploadQuestionDraftMedia(file);
        if (!response.data) throw new Error("Upload failed — server returned no data.");
        return { id: response.data.id, url: response.data.url };
      }}
      onSave={async (questions) => {
        const payload = questions.map((question) => ({
          draftId: question.draftId,
          guidedDefinition: question.guidedDefinition?.enabled && question.type !== "MATCHING" && question.type !== "CLOZE"
            ? {
                expectedVersion: 0,
                introContent: question.guidedDefinition.introContent.trim() || null,
                steps: question.guidedDefinition.steps,
              }
            : undefined,
          question: {
          questionBankId: bankId,
          type: question.type,
          difficulty: question.difficulty,
          content: question.text.trim(),
          explanation: question.explanation?.trim() || undefined,
          hint: question.hint?.trim() || undefined,
          options: question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE"
            ? question.options.map((option) => ({
                content: option.text.trim(),
                isCorrect: question.correctOptionIds.includes(option.id),
              }))
            : undefined,
          answers: question.type === "TRUE_FALSE"
            ? [{ rawValue: question.trueFalseAnswer }]
            : question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER"
              ? question.acceptedAnswers.map((answer) => ({ rawValue: answer.trim() }))
              : undefined,
          mediaIds: question.media.map((media) => Number(media.id)).filter((id) => !Number.isNaN(id)),
          },
        }));
        await questionService.createWithGuided(payload);
      }}
      successDescription={"Saved in " + bankName + "."}
      onSaveSuccess={() => {
        if (activeImportId) clearQuestionImportHandoff(activeImportId);
        window.setTimeout(() => onNavigate("bank", bankId), 1000);
      }}
    />
  );
}
