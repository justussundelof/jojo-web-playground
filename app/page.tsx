import HeaderNav from "@/components/HeaderNav";
import ProductsGrid from "@/components/ProductsGrid";

export default async function Home() {
  return (
    <main className="min-h-screen ">
      <HeaderNav />
      <section className="mt-8 h-[25vh] bg-pink-600 flex flex-col items-start justify-center px-6 text-white font-sans text-base space-y-6 "></section>
      <section className="">
        <ProductsGrid />
      </section>
      <section className="h-screen"></section>
    </main>
  );
}
