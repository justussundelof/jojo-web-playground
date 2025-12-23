import ProductModalClient from "@/components/product-page/ProductModalClient";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="overflow-hidden">
      <ProductModalClient mode="edit" id={id} />
    </div>
  );
}
