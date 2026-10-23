import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ questionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { questionId } = await params;
  return <ContentRoutePage view="question" id={Number(questionId)} />;
}
