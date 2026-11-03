"use client";

import { useState } from "react";
import { mockSessions } from "@/mock/mock-student-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentActivitiesPage() {
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = mockSessions.filter(
    (s) => (mode === "all" || s.mode === mode) && (status === "all" || s.status === status)
  );

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border p-4">
        <div>
          <h2 className="font-extrabold text-base">Lịch sử luyện tập</h2>
          <p className="text-xs text-muted-foreground">Các phiên luyện tập Learning và thử thách Try Hard</p>
        </div>
        <div className="flex gap-2">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Mọi chế độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi chế độ</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Try Hard">Try Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Mọi trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi trạng thái</SelectItem>
              <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
              <SelectItem value="Hết mạng">Hết mạng</SelectItem>
              <SelectItem value="Bỏ dở">Bỏ dở</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 uppercase font-bold text-muted-foreground">
            <tr>
              <th className="p-3 pl-4">Hoạt động</th>
              <th className="p-3">Chế độ</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Kết quả</th>
              <th className="p-3 pr-4">Hoàn thành lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 pl-4">
                  <p className="font-bold text-sm">{s.activity}</p>
                  <p className="text-[11px] text-muted-foreground">{s.unit}</p>
                </td>
                <td className="p-3">
                  <span className="font-bold text-primary">{s.mode}</span>
                </td>
                <td className="p-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 font-bold text-[11px] ${
                    s.status === "Hoàn thành" ? "bg-emerald-500/10 text-emerald-600" :
                    s.status === "Hết mạng" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">
                  {s.firstCorrect !== undefined ? (
                    <span>
                      <strong className="text-foreground">{s.firstCorrect}/{s.total}</strong> đúng lần đầu
                      {s.hints ? ` · ${s.hints} gợi ý` : ""}
                    </span>
                  ) : "—"}
                </td>
                <td className="p-3 pr-4 text-muted-foreground">{s.completedAt ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
