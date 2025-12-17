import ProductModalClient from "@/components/product-page/ProductModalClient";

export default async function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <--- await here

  return (
    <div className="overflow-hidden">
      <ProductModalClient mode="view" id={id} />
    </div>
  );
}
