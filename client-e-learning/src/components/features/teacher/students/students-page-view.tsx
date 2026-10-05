"use client";
import { useMemo,useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { StudentsHeader } from "./students-header";
import { StudentsToolbar } from "./students-toolbar";
import { StudentTable } from "./student-table";
import { filterStudents } from "./student-filters";
import { StudentForm } from "./student-form";

export function StudentsPageView(){
 const [search,setSearch]=useState("");const [status,setStatus]=useState("all");const [creating,setCreating]=useState(false);
 const query=useQuery({queryKey:["students"],queryFn:studentService.list});
 const students=query.data?.data??[];
 const filtered=useMemo(()=>filterStudents(students,search,status),[students,search,status]);
 if(creating)return <StudentForm onCancel={()=>setCreating(false)} onSuccess={()=>{setCreating(false);void query.refetch();}}/>;
 return <div className="space-y-6"><StudentsHeader onCreate={()=>setCreating(true)}/><StudentsToolbar value={search} onChange={setSearch} status={status} onStatusChange={setStatus}/><StudentTable students={filtered} isLoading={query.isLoading}/></div>;
}
