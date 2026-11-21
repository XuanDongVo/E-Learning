import { redirect } from "@/i18n/navigation";

export default async function NewKnowledgeNotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/teacher/knowledge-notes", locale });
}