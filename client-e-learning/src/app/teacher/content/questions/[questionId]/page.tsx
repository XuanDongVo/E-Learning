import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ bankName?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { questionId } = await params;
  const query = await searchParams;
  return <ContentRoutePage view="question" id={Number(questionId)} />;
}
