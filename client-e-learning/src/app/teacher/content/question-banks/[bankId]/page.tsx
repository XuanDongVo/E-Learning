import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ bankId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { bankId } = await params;
  return <ContentRoutePage view="bank" id={Number(bankId)} />;
}
