import { Search } from "lucide-react";
export function StudentsToolbar({ value,onChange,status,onStatusChange }: {value:string;onChange:(v:string)=>void;status:string;onStatusChange:(v:string)=>void}) {
 return <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 sm:flex-row">
  <label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-neutral-subtle"/><input aria-label="Search students" value={value} onChange={e=>onChange(e.target.value)} placeholder="Search by name or email..." className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app pl-9 pr-3 text-body outline-none focus:border-primary"/></label>
  <select aria-label="Filter by status" value={status} onChange={e=>onStatusChange(e.target.value)} className="h-10 sm:w-44 rounded-[var(--radius-md)] border border-border-color bg-background-app px-3 text-body outline-none focus:border-primary"><option value="all">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
 </div>;
}
