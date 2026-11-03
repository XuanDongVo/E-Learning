"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, UserRound, GraduationCap, Contact } from "lucide-react";
import { mockStudent } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentEditPage({ params }: { params: { studentId: string } }) {
  const [name, setName] = useState(mockStudent.name);
  const [className, setClassName] = useState(mockStudent.className);
  const [status, setStatus] = useState(mockStudent.status);
  const [notes, setNotes] = useState(mockStudent.notes);

  return (
    <div className="space-y-4">
      <Link
        href={`/students/${params.studentId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Quay lại thông tin học sinh
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Cập nhật học sinh</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chỉnh sửa thông tin cá nhân, lớp học và thông tin liên hệ phụ huynh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-bold text-xs">
            <Link href={`/students/${params.studentId}`}>Hủy</Link>
          </Button>
          <Button size="sm" className="gap-1.5 font-bold text-xs">
            <Save className="size-3.5" /> Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Cột form chính */}
        <div className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          {/* 1. Thông tin cá nhân */}
          <div>
            <div className="flex items-center gap-2 font-bold text-sm border-b border-border pb-2 mb-4">
              <UserRound className="size-4 text-primary" />
              <span>Thông tin nhận diện</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Họ và tên *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Mã học sinh *</label>
                <Input defaultValue={mockStudent.code} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Ngày sinh</label>
                <Input type="date" defaultValue="2014-03-12" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Giới tính</label>
                <Select defaultValue={mockStudent.gender === "Nữ" ? "female" : "male"}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 2. Lớp học & Học tập */}
          <div>
            <div className="flex items-center gap-2 font-bold text-sm border-b border-border pb-2 mb-4">
              <GraduationCap className="size-4 text-primary" />
              <span>Học tập & Phân lớp</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Lớp học</label>
                <Select value={className} onValueChange={setClassName}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lớp 6A">Lớp 6A</SelectItem>
                    <SelectItem value="Lớp 6C">Lớp 6C</SelectItem>
                    <SelectItem value="Lớp 7A">Lớp 7A</SelectItem>
                    <SelectItem value="Lớp 8B">Lớp 8B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Trạng thái học</label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang học">Đang học</SelectItem>
                    <SelectItem value="Cần hỗ trợ">Cần hỗ trợ</SelectItem>
                    <SelectItem value="Tạm nghỉ">Tạm nghỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Ghi chú học tập</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20 text-sm"
                placeholder="Nhập ghi chú cho giáo viên..."
              />
            </div>
          </div>

          {/* 3. Liên hệ & Phụ huynh */}
          <div>
            <div className="flex items-center gap-2 font-bold text-sm border-b border-border pb-2 mb-4">
              <Contact className="size-4 text-primary" />
              <span>Liên hệ & Phụ huynh</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Email học sinh</label>
                <Input defaultValue={mockStudent.email} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Số điện thoại</label>
                <Input defaultValue={mockStudent.phone} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Họ tên phụ huynh</label>
                <Input defaultValue={mockStudent.parent} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">SĐT phụ huynh</label>
                <Input defaultValue={mockStudent.parentPhone} className="h-10 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Thao tác & Trạng thái tài khoản */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm">Trạng thái tài khoản</h3>
            <p className="text-xs text-muted-foreground">Tài khoản hiện đang được kích hoạt sử dụng bình thường.</p>
            <div className="pt-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                {mockStudent.accountStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
