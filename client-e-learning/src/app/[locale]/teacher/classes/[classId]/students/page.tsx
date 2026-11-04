// import { ClassStudentsView } from "@/components/features/teacher/classes/class-students-view";
// export default async function ClassStudentsPage({
//   params,
// }: {
//   params: Promise<{ classId: string }>;
// }) {
//   const { classId } = await params;
//   return <ClassStudentsView classId={Number(classId)} />;
// }


"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Eye,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { mockClassStudents } from "@/mock/mock-teacher-classes";
import { StudentSummary } from "@/types/teacher/teacher-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClassStudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>(mockClassStudents);
  const [search, setSearch] = useState("");
  const [isLoading] = useState(false);

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState<StudentSummary | null>(null);
  const [removeStudent, setRemoveStudent] = useState<StudentSummary | null>(null);
  const [targetClass, setTargetClass] = useState("102"); // default Lớp 6C

  // Add form mock
  const [newStudentId, setNewStudentId] = useState("");

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.email.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleAddMember = () => {
    if (!newStudentId.trim()) return;
    const added: StudentSummary = {
      id: Date.now(),
      fullName: newStudentId,
      email: `${newStudentId.toLowerCase().replace(/\s+/g, "")}@example.edu.vn`,
      phone: "090 999 8888",
      accountStatus: "ACTIVE",
      classes: [],
    };
    setStudents((prev) => [added, ...prev]);
    setNewStudentId("");
    setAddOpen(false);
  };

  const handleTransferConfirm = () => {
    if (!transferStudent) return;
    // Chuyển lớp: Học sinh sẽ bị rời khỏi lớp hiện tại
    setStudents((prev) => prev.filter((s) => s.id !== transferStudent.id));
    setTransferStudent(null);
  };

  const handleRemoveConfirm = () => {
    if (!removeStudent) return;
    setStudents((prev) => prev.filter((s) => s.id !== removeStudent.id));
    setRemoveStudent(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc email..."
            className="h-10 pl-9 bg-background text-sm"
          />
        </div>

        <Button onClick={() => setAddOpen(true)} className="h-10 gap-2 font-bold text-xs shadow-sm">
          <UserPlus className="size-4" /> Thêm học sinh vào lớp
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải danh sách học sinh...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-10 text-muted-foreground opacity-30" />
            <h3 className="mt-3 text-sm font-extrabold">Không có học sinh nào</h3>
            <p className="mt-1 text-xs text-muted-foreground">Thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="p-3.5 pl-4">Học sinh</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Số điện thoại</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 pr-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const initials = s.fullName
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      {/* Avatar & Name */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                            {initials}
                          </span>
                          <div>
                            <p className="font-extrabold text-sm text-foreground">{s.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">ID: #{s.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-muted-foreground font-medium">{s.email}</td>
                      <td className="p-3.5 text-muted-foreground font-medium">{s.phone || "—"}</td>

                      {/* Account Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            s.accountStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {s.accountStatus === "ACTIVE" ? "Đang hoạt động" : "Tạm khóa"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransferStudent(s)}
                            className="h-8 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            title="Chuyển lớp"
                          >
                            <ArrowRightLeft className="size-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Chuyển lớp</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemoveStudent(s)}
                            className="h-8 gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/10"
                            title="Rời khỏi lớp"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="hidden sm:inline">Xóa</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog 1: Add Student */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">Thêm học sinh vào lớp</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập tên hoặc mã ID học sinh để thêm vào danh sách lớp.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs font-bold space-y-3">
            <div>
              <label className="mb-1 block text-muted-foreground">Họ tên học sinh *</label>
              <Input
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                placeholder="Ví dụ: Lê Hoàng Long"
                className="h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="text-xs font-bold">
              Hủy
            </Button>
            <Button onClick={handleAddMember} className="text-xs font-bold">
              Thêm vào lớp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Transfer Student Confirmation */}
      <Dialog open={Boolean(transferStudent)} onOpenChange={() => setTransferStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-blue-600">
              <ArrowRightLeft className="size-4" /> Chuyển lớp học sinh
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mỗi học sinh chỉ có một lớp học ở trạng thái ACTIVE. Khi chuyển, học sinh sẽ tự động rời khỏi lớp hiện tại.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs space-y-3">
            <p className="font-semibold">
              Học sinh: <strong className="text-foreground">{transferStudent?.fullName}</strong>
            </p>
            <div>
              <label className="font-bold text-muted-foreground mb-1 block">Chọn lớp chuyển đến:</label>
              <Select value={targetClass} onValueChange={setTargetClass}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="102">Lớp 6C (Khối 6)</SelectItem>
                  <SelectItem value="103">Lớp 7A (Khối 7)</SelectItem>
                  <SelectItem value="104">Lớp 8B (Khối 8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferStudent(null)} className="text-xs font-bold">
              Hủy
            </Button>
            <Button onClick={handleTransferConfirm} className="text-xs font-bold bg-blue-600 hover:bg-blue-700">
              Xác nhận chuyển lớp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Remove Student Confirmation */}
      <Dialog open={Boolean(removeStudent)} onOpenChange={() => setRemoveStudent(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-rose-600">
              Xóa học sinh khỏi lớp
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa học sinh <strong>{removeStudent?.fullName}</strong> khỏi lớp này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveStudent(null)} className="text-xs font-bold">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} className="text-xs font-bold">
              Xóa khỏi lớp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
