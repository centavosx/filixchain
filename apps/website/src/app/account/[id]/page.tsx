export type AccountProps = {
  params: Promise<{ id: string }>;
};
export default async function Account({ params }: AccountProps) {
  const accountId = (await params).id;

  return <div className="flex flex-col p-6 gap-8"></div>;
}
