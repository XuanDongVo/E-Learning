import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePlaceholderPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Profile</h1>
          <p className="text-sm text-[#64748B]">Account & Learning Settings</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center space-y-3">
        <p className="text-[#64748B]">Module Profile đang sẵn sàng để triển khai tiếp theo.</p>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
