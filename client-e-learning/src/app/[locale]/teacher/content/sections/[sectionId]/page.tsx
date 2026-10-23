import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ sectionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sectionId } = await params;
  return <ContentRoutePage view="section" id={Number(sectionId)} />;
}
