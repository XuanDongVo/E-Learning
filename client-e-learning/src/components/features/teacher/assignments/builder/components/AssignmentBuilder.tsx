"use client";

import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Loader2, PanelLeft, PanelRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import { loadAssignment, useBuilder, useIsDirty } from "@/components/features/teacher/assignments/builder/store";
import type { InsertTarget, ToolKey } from "@/types/assignment-builder";
import { AssignmentQuestionComposerDialog } from "./AssignmentQuestionComposerDialog";
import { Canvas } from "./Canvas";
import { ConfirmHost } from "./ConfirmHost";
import { Header } from "./Header";
import { Outline } from "./Outline";
import { PropertyPanel } from "./PropertyPanel";
import { SettingsSheet } from "./SettingsSheet";
import { StudentPreview } from "./StudentPreview";
import { TOOLS, Toolbox } from "./Toolbox";
import { ValidationPanel } from "./ValidationPanel";

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1100px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

function targetFromOver(overId: string, activeIsTool: boolean): InsertTarget | null {
  const a = useBuilder.getState().assignment;
  const [kind, id] = [overId.slice(0, overId.indexOf(":")), overId.slice(overId.indexOf(":") + 1)];
  if (kind === "cs" || kind === "os") {
    const s = ops.getSection(a, id);
    return s ? { sectionId: s.id, groupId: null, index: s.itemIds.length } : null;
  }
  if (kind === "cg" || kind === "og") {
    const loc = ops.locate(a, id);
    const b = a.items[id];
    return loc && b?.kind === "block" ? { sectionId: loc.sectionId, groupId: id, index: b.memberIds.length } : null;
  }
  const loc = ops.locate(a, id);
  if (!loc) return null;
  return activeIsTool ? { ...loc, index: loc.index + 1 } : loc;
}

function LeftPanel() {
  return (
    <Tabs defaultValue="add" className="flex h-full flex-col gap-0">
      <TabsList className="m-2 grid grid-cols-2">
        <TabsTrigger value="add">Add content</TabsTrigger>
        <TabsTrigger value="outline">Outline</TabsTrigger>
      </TabsList>
      <TabsContent value="add" className="min-h-0 flex-1 overflow-y-auto"><Toolbox /></TabsContent>
      <TabsContent value="outline" className="min-h-0 flex-1 overflow-y-auto"><Outline /></TabsContent>
    </Tabs>
  );
}

export function AssignmentBuilder({ id }: { id?: string }) {
  const loaded = useBuilder((s) => s.loaded);
  const loadError = useBuilder((s) => s.loadError);
  const mode = useBuilder((s) => s.mode);
  const questionComposerOpen = useBuilder((s) => s.questionComposerOpen);
  const assignment = useBuilder((s) => s.assignment);
  const autosave = useBuilder((s) => s.autosave);
  const selection = useBuilder((s) => s.selection);
  const dirty = useIsDirty();
  const wide = useWide();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    loadAssignment(id);
  }, [id]);

  // Ctrl/Cmd+S
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        useBuilder.getState().save();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  // Warn on tab close / reload
  useEffect(() => {
    if (!dirty) return;
    const on = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [dirty]);

  // Autosave 5s after the last change
  useEffect(() => {
    if (!autosave || !dirty || !loaded) return;
    const t = setTimeout(() => {
      if (useBuilder.getState().saveStatus !== "saving") useBuilder.getState().save();
    }, 5000);
    return () => clearTimeout(t);
  }, [assignment, autosave, dirty, loaded]);

  // On narrow screens, open the property drawer when something gets selected
  useEffect(() => {
    if (!wide && selection) {
      const timer = setTimeout(() => setRightOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [selection, wide]);

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    if (id.startsWith("t:")) setDragLabel(TOOLS.find((t) => t.key === id.slice(2))?.label ?? null);
    else setDragLabel(null);
  };
  const onDragEnd = (e: DragEndEvent) => {
    setDragLabel(null);
    if (!e.over) return;
    const activeId = String(e.active.id);
    const overId = String(e.over.id);
    const isTool = activeId.startsWith("t:");
    const target = targetFromOver(overId, isTool);
    if (!target) return;
    const st = useBuilder.getState();
    if (isTool) {
      setLeftOpen(false);
      return st.addTool(activeId.slice(2) as ToolKey, target);
    }
    const itemId = activeId.slice(2);
    if (overId.slice(2) === itemId) return;
    st.mutate((d) => ops.moveTo(d, itemId, target));
  };

  if (loadError) return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="max-w-xl space-y-3 rounded-xl border bg-card p-6">
        <h1 className="text-lg font-semibold">Could not open Assignment Builder</h1>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <div className="flex gap-2">
          <Button onClick={() => void loadAssignment(id)}>Retry</Button>
          <Button variant="outline" onClick={() => window.location.assign("/teacher/assignments")}>Back to assignments</Button>
        </div>
      </div>
    </div>
  );

  if (!loaded)
    return (
      <div className="grid h-screen place-items-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );

  if (questionComposerOpen) {
    return <AssignmentQuestionComposerDialog assignmentId={id ?? assignment.id} />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex h-screen flex-col overflow-hidden bg-white text-slate-900">
        <Header />
        {mode !== "preview" && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800">Quick guide · Build an assignment</p>
                <p className="mt-1 text-slate-600">
                  1. Add a question or content from the left panel. 2. Select an item to edit its settings on the right.
                  3. Drag items to reorder them. 4. Use Student Preview to check the student experience, then Save Draft.
                </p>
              </div>
              <p className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                Tip: click a question to select it · Ctrl/Cmd + S to save
              </p>
            </div>
          </div>
        )}
        {mode === "preview" ? (
          <div className="min-h-0 flex-1"><StudentPreview /></div>
        ) : (
          <div className="flex min-h-0 flex-1">
            {wide && <aside className="w-72 shrink-0 border-r border-slate-200 bg-white"><LeftPanel /></aside>}
            <main className="flex min-w-0 flex-1 flex-col">
              {!wide && (
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setLeftOpen(true)}><PanelLeft className="h-4 w-4" /> Add & outline</Button>
                  <Button variant="ghost" size="sm" onClick={() => setRightOpen(true)}><PanelRight className="h-4 w-4" /> Properties</Button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto"><Canvas /></div>
              <ValidationPanel />
            </main>
            {wide && <aside className="w-80 shrink-0 overflow-y-auto border-l bg-card"><PropertyPanel /></aside>}
          </div>
        )}
      </div>
      {!wide && (
        <>
          <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
            <SheetContent side="left" className="w-80 border-slate-200 bg-white p-0">
              <SheetHeader className="sr-only"><SheetTitle>Add content and outline</SheetTitle></SheetHeader>
              <div className="h-full pt-8"><LeftPanel /></div>
            </SheetContent>
          </Sheet>
          <Sheet open={rightOpen} onOpenChange={setRightOpen} modal={false}>
            <SheetContent side="right" className="w-96 border-slate-200 bg-white overflow-y-auto p-0">
              <SheetHeader className="sr-only"><SheetTitle>Properties</SheetTitle></SheetHeader>
              <div className="pt-8"><PropertyPanel /></div>
            </SheetContent>
          </Sheet>
        </>
      )}
      <DragOverlay>{dragLabel ? <div className="rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-lg">+ {dragLabel}</div> : null}</DragOverlay>
      <SettingsSheet />
      <ConfirmHost />
    </DndContext>
  );
}
