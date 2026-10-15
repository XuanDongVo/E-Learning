import { create } from "zustand";
import { toast } from "sonner";
import * as ops from "./ops";
import { loadBuilderAssignment, saveBuilderAssignment } from "@/services/assignment/assignment-composition.service";
import type { Assignment, ID, InsertTarget, Selection, ToolKey } from "@/types/assignment-builder";
import type { DraftQuestion } from "@/types/question";

export const snapshotOf = (a: Assignment) => JSON.stringify({ ...a, updatedAt: "" });
export interface ConfirmAction { label: string; variant?: "default" | "destructive" | "outline"; run: () => void; }
export interface ConfirmState { title: string; description: string; actions: ConfirmAction[]; }
interface BuilderState {
  assignment: Assignment; savedSnapshot: string; loaded: boolean; loadError: string | null; selection: Selection;
  mode: "edit" | "preview"; saveStatus: "idle" | "saving" | "error"; saveError: string | null; lastSavedAt: string | null;
  revision: number; savedRevision: number;
  autosave: boolean; confirm: ConfirmState | null; settingsOpen: boolean;
  questionComposerOpen: boolean; questionComposerTarget: InsertTarget | null; questionComposerEditId: ID | null;
  questionComposerInitialQuestions: DraftQuestion[] | null; questionComposerBlankRefs: number[];
  load: (a: Assignment) => void;
  openQuestionComposer: (target?: InsertTarget | null, editId?: ID | null, initialQuestions?: DraftQuestion[] | null, blankRefs?: number[]) => void;
  closeQuestionComposer: () => void; mutate: (fn: (draft: Assignment) => void) => void; select: (s: Selection) => void;
  set: (p: Partial<BuilderState>) => void; save: () => Promise<boolean>;
  addTool: (tool: ToolKey, target?: InsertTarget | null, count?: number) => void;
  requestDeleteItem: (id: ID) => void; requestDeleteSection: (id: ID) => void; duplicate: (id: ID) => void; ask: (c: ConfirmState) => void;
}
const initialAssignment = ops.createEmptyAssignment();

function mergePersistedIdentity(draft: Assignment, saved: Assignment): Assignment {
  const savedSections = new Map(saved.sections.map((section) => [section.id, section]));
  const savedItems = saved.items;
  const items = { ...draft.items };

  for (const [id, item] of Object.entries(items)) {
    const persisted = savedItems[id];
    if (!persisted || persisted.kind !== item.kind) continue;

    if (item.kind === "question" && persisted.kind === "question") {
      items[id] = {
        ...item,
        compositionItemId: persisted.compositionItemId ?? item.compositionItemId,
        serverQuestionId: persisted.serverQuestionId ?? item.serverQuestionId,
        serverType: persisted.serverType ?? item.serverType,
        serverDifficulty: persisted.serverDifficulty ?? item.serverDifficulty,
        serverMediaIds: persisted.serverMediaIds ?? item.serverMediaIds,
        serverMedia: persisted.serverMedia ?? item.serverMedia,
        serverQuestionSnapshot: persisted.serverQuestionSnapshot ?? item.serverQuestionSnapshot,
      };
    } else if (item.kind === "block" && persisted.kind === "block") {
      items[id] = { ...item, compositionItemId: persisted.compositionItemId ?? item.compositionItemId };
    }
  }

  return {
    ...draft,
    serverId: saved.serverId ?? draft.serverId,
    updatedAt: saved.updatedAt ?? draft.updatedAt,
    sections: draft.sections.map((section) => ({
      ...section,
      serverId: savedSections.get(section.id)?.serverId ?? section.serverId,
    })),
    items,
  };
}

let savePromise: Promise<boolean> | null = null;
let saveRequested = false;

export const useBuilder = create<BuilderState>((set, get) => ({
  assignment: initialAssignment, savedSnapshot: snapshotOf(initialAssignment), loaded: false, loadError: null, selection: null,
  mode: "edit", saveStatus: "idle", saveError: null, lastSavedAt: null, revision: 0, savedRevision: 0, autosave: true, confirm: null, settingsOpen: false,
  questionComposerOpen: false, questionComposerTarget: null, questionComposerEditId: null, questionComposerInitialQuestions: null, questionComposerBlankRefs: [],
  load: (a) => {
    saveRequested = false;
    set({ assignment: a, savedSnapshot: snapshotOf(a), revision: 0, savedRevision: 0, loaded: true, loadError: null, selection: null, saveStatus: "idle", saveError: null, lastSavedAt: a.updatedAt });
  },
  mutate: (fn) => {
    const draft = structuredClone(get().assignment);
    fn(draft);
    set((state) => ({ assignment: draft, revision: state.revision + 1 }));
  },
  select: (selection) => set({ selection }),
  openQuestionComposer: (target, editId, initialQuestions, blankRefs) => set({ questionComposerOpen: true, questionComposerTarget: target ?? null, questionComposerEditId: editId ?? null, questionComposerInitialQuestions: initialQuestions ?? null, questionComposerBlankRefs: blankRefs ?? [] }),
  closeQuestionComposer: () => set({ questionComposerOpen: false, questionComposerTarget: null, questionComposerEditId: null, questionComposerInitialQuestions: null, questionComposerBlankRefs: [] }),
  set: (p) => set(p), ask: (confirm) => set({ confirm }),
  save: () => {
    if (savePromise) {
      saveRequested = true;
      return savePromise;
    }

    savePromise = (async () => {
      let savedAtLeastOnce = false;
      try {
        do {
          saveRequested = false;
          const start = get();
          const revisionAtStart = start.revision;
          const assignmentAtStart = structuredClone(start.assignment);
          set({ saveStatus: "saving", saveError: null });

          const saved = await saveBuilderAssignment(assignmentAtStart);
          const latest = get();
          const changedDuringSave = latest.revision !== revisionAtStart;
          const assignment = changedDuringSave
            ? mergePersistedIdentity(latest.assignment, saved)
            : saved;

          set({
            assignment,
            saveStatus: "idle",
            savedSnapshot: snapshotOf(saved),
            savedRevision: revisionAtStart,
            lastSavedAt: saved.updatedAt,
            loadError: null,
          });
          savedAtLeastOnce = true;

          // Do not overwrite edits made while the request was in flight.
          // If another edit/save was requested, immediately persist the newer revision.
          if (!changedDuringSave && !saveRequested) break;
        } while (true);

        return savedAtLeastOnce;
      } catch (error) {
        set({
          saveStatus: "error",
          saveError: error instanceof Error ? error.message : "Could not save Assignment.",
        });
        return false;
      } finally {
        savePromise = null;
        saveRequested = false;
      }
    })();

    return savePromise;
  },
  addTool: (tool, target, count = 1) => {
    const { selection } = get();
    if (ops.isQuestionTool(tool)) {
      const total = Math.max(1, Math.min(50, Math.floor(count)));
      const created: ID[] = [];
      get().mutate((d) => {
        let t = target ?? ops.targetFromSelection(d, selection, false);
        if (!t) { const s = ops.newSection(); d.sections.push(s); t = { sectionId: s.id, groupId: null, index: 0 }; }
        for (let i = 0; i < total; i += 1) {
          const item = ops.createItem(tool);
          d.items[item.id] = item;
          ops.place(d, item.id, { ...t, index: t.index + i });
          created.push(item.id);
        }
      });
      const last = created.at(-1);
      if (last) set({ selection: { kind: "item", id: last } });
      if (created.length === 1) setTimeout(() => document.getElementById(`item-${created[0]}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
      return;
    }
    if (tool === "SECTION") {
      const s = ops.newSection();
      get().mutate((d) => { const cur = selection ? (selection.kind === "section" ? selection.id : ops.locate(d, selection.id)?.sectionId) : null; const idx = cur ? d.sections.findIndex((x) => x.id === cur) + 1 : d.sections.length; d.sections.splice(idx, 0, s); });
      set({ selection: { kind: "section", id: s.id } }); return;
    }
    const item = ops.createItem(tool);
    get().mutate((d) => {
      let t = target ?? ops.targetFromSelection(d, selection, item.kind === "block");
      if (!t) { const s = ops.newSection(); d.sections.push(s); t = { sectionId: s.id, groupId: null, index: 0 }; }
      d.items[item.id] = item; ops.place(d, item.id, t);
    });
    set({ selection: { kind: "item", id: item.id } });
    setTimeout(() => document.getElementById(`item-${item.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  },
  duplicate: (id) => { let nid: ID | null = null; get().mutate((d) => (nid = ops.duplicateItem(d, id))); if (nid) set({ selection: { kind: "item", id: nid } }); toast.success("Duplicated"); },
  requestDeleteItem: (id) => {
    const a = get().assignment; const it = a.items[id]; if (!it) return;
    const done = () => { if (get().selection?.id === id) set({ selection: null }); };
    if (it.kind === "block" && it.memberIds.length) { get().ask({ title: `Delete "${ops.blockLabel(it)}"?`, description: `This shared block owns ${it.memberIds.length} question(s). Delete them too, or keep them as standalone questions?`, actions: [{ label: "Ungroup & keep questions", variant: "outline", run: () => (get().mutate((d) => ops.removeItem(d, id, false)), done()) }, { label: "Delete with members", variant: "destructive", run: () => (get().mutate((d) => ops.removeItem(d, id, true)), done()) }] }); return; }
    get().mutate((d) => ops.removeItem(d, id)); done(); toast("Item deleted");
  },
  requestDeleteSection: (id) => {
    const s = get().assignment.sections.find((x) => x.id === id); if (!s) return;
    const run = () => { get().mutate((d) => ops.removeSection(d, id)); if (get().selection?.id === id) set({ selection: null }); };
    if (s.itemIds.length === 0) return run();
    get().ask({ title: `Delete section "${s.title || "Untitled"}"?`, description: "All items in this section will be deleted.", actions: [{ label: "Delete section", variant: "destructive", run }] });
  },
}));
export function useIsDirty() { return useBuilder((s) => snapshotOf(s.assignment) !== s.savedSnapshot); }
export async function loadAssignment(id?: string) {
  useBuilder.setState({ loaded: false, loadError: null, saveStatus: "idle", saveError: null });
  try { if (!id) throw new Error("Select or create an Assignment from the Assignments page first."); useBuilder.getState().load(await loadBuilderAssignment(id)); }
  catch (error) { useBuilder.setState({ loaded: true, loadError: error instanceof Error ? error.message : "Could not load Assignment." }); }
}
