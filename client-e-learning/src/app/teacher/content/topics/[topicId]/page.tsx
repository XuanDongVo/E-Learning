import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { topicId } = await params;
  return <ContentRoutePage view="topic" id={Number(topicId)} />;
}
