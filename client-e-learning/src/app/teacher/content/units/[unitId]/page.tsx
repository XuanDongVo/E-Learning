import { ContentRoutePage } from "@/components/features/teacher/content/content-route-page";

type PageProps = {
  params: Promise<{ unitId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { unitId } = await params;
  return <ContentRoutePage view="unit" id={Number(unitId)} />;
}
