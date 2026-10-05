"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { studentService } from "@/services/student.service";
import type { CreateStudentRequest, Gender, StudentGuardianRequest } from "@/types/student";

const emptyGuardian: StudentGuardianRequest={relationship:"GUARDIAN",fullName:"",phone:"",email:"",primary:true};
export function StudentForm({onSuccess,onCancel}:{onSuccess:()=>void;onCancel:()=>void}){
 const {data:classesData}=useQuery({queryKey:["classes"],queryFn:classService.list});
 const classes=classesData?.data??[];
 const [form,setForm]=useState<CreateStudentRequest>({email:"",password:"",fullName:"",classId:0,guardians:[emptyGuardian]});
 const [saving,setSaving]=useState(false); const [error,setError]=useState<string|null>(null);
 const set=(key:keyof CreateStudentRequest,value:unknown)=>setForm(f=>({...f,[key]:value}));
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);setError(null);try{await studentService.create(form);onSuccess();}catch(err){setError(err instanceof Error?err.message:"Unable to create student");}finally{setSaving(false);}};
 return <form onSubmit={submit} className="space-y-5 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5">
  <div><h2 className="text-ui-xl font-extrabold">Add student</h2><p className="mt-1 text-body text-neutral-muted">Create the account and assign the student to a class.</p></div>
  {error&&<div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
  <div className="grid gap-4 md:grid-cols-2">
   <label className="text-body font-bold">Full name<input required value={form.fullName} onChange={e=>set("fullName",e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label>
   <label className="text-body font-bold">Email<input required type="email" value={form.email} onChange={e=>set("email",e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label>
   <label className="text-body font-bold">Temporary password<input required minLength={8} type="password" value={form.password} onChange={e=>set("password",e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label>
   <label className="text-body font-bold">Class<select required value={form.classId||""} onChange={e=>set("classId",Number(e.target.value))} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"><option value="" disabled>Select class</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} · {c.grade.name}</option>)}</select></label>
   <label className="text-body font-bold">Date of birth<input type="date" value={form.dateOfBirth||""} onChange={e=>set("dateOfBirth",e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label>
   <label className="text-body font-bold">Gender<select value={form.gender||""} onChange={e=>set("gender",(e.target.value||undefined) as Gender|undefined)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"><option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label>
   <label className="text-body font-bold md:col-span-2">Student phone<input value={form.phone||""} onChange={e=>set("phone",e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label>
  </div>
  <div className="border-t border-border-color pt-4"><h3 className="font-extrabold">Guardian</h3><div className="mt-3 grid gap-4 md:grid-cols-2"><label className="text-body font-bold">Name<input required value={form.guardians?.[0]?.fullName||""} onChange={e=>set("guardians",[{...(form.guardians?.[0]||emptyGuardian),fullName:e.target.value}])} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label><label className="text-body font-bold">Phone<input required value={form.guardians?.[0]?.phone||""} onChange={e=>set("guardians",[{...(form.guardians?.[0]||emptyGuardian),phone:e.target.value}])} className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"/></label></div></div>
  <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="h-10 rounded-md border border-border-color px-4 font-bold">Cancel</button><button disabled={saving} className="h-10 rounded-md bg-primary px-4 font-bold text-primary-foreground">{saving?"Creating...":"Create student"}</button></div>
 </form>;
}
