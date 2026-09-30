"use client";
import { useParams } from "next/navigation";
import { ActivityEditor } from "@/components/features/teacher/activities/activity-editor";
export default function ActivityDetailPage(){
  const params=useParams<{id:string}>(); const id=Number(params.id);
  return Number.isFinite(id)?<ActivityEditor activityId={id}/>:<div>Invalid activity id.</div>;
}
