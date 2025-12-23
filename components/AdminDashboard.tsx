"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Button } from "./ui/button";
import EditContentForm from "./EditContentForm";
import { useRef, useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminDashboard() {
  const [editing, setEditing] = useState<"about" | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const closeModal = () => {
    setOpenForm(false);
  };
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [modalProduct, setModalProduct] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleToggleActiveProduct(productId: number) {
    setModalProduct(null);
    setActiveProduct((prev) => (prev === productId ? null : productId));
  }

  const openModal = (id: number) => {
    setActiveProduct(null);
    setModalProduct(id);
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/products/${id}?${params.toString()}`);
  };

  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({}); // Use a mutable ref object

  useEffect(() => {
    if (editing && panelRefs.current[editing]) {
      panelRefs.current[editing]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editing]);

  const mainPages = [
    { slug: "about", label: "Edit About" },

    { slug: "newsletter", label: "Edit Newsletter" },
    { slug: "the-store", label: "Edit Store" },
    { slug: "contact", label: "Edit Contact" },
    { slug: "imprint", label: "Edit Imprint" },
    { slug: "privacy-policy", label: "Edit Privacy Policy" },
  ];

  return (
    <>
      <LayoutGroup>
        <div className="pl-1 lg:pl-10 pr-1 pb-1 w-full flex-col bg- grid grid-cols-2 lg:grid-cols-12 pt-11 ">
          <div className="col-span-2  lg:col-span-10 grid grid-cols-2 lg:grid-cols-6 auto-rows-fr items-start justify-start gap-1 ">
            <Button variant="secondary" onClick={() => setOpenForm(true)}>
              Add/Edit Products
            </Button>
            {openForm && <ProductForm closeModal={closeModal} mode="create" />}

            {mainPages.map((mainPage) => (
              <motion.span
                key={mainPage.slug}
                layout
                className="col-span-1"
                onClick={() => setEditing(mainPage.slug as any)}
              >
                <Button variant="secondary" className="w-full">
                  {mainPage.label}
                </Button>
              </motion.span>
            ))}

            {mainPages.map(
              (mainPage) =>
                editing === mainPage.slug && (
                  <motion.div
                    key={mainPage.slug + "-panel"} // Ensure unique key for motion.div
                    ref={(el) => {
                      panelRefs.current[mainPage.slug] = el;
                    }}
                    layout
                    className=" z-20 absolute top-11 left-1 lg:left-10 w-full max-w-md lg:max-w-2xl   flex flex-col items-start justify-start bg-accent text-accent-foreground border border-secondary "
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setEditing(null)}
                      className="relative top-0 right-0"
                    >
                      Close
                    </Button>
                    <div className="jojo-container-padding">
                      <EditContentForm pageSlug={mainPage.slug} />
                    </div>
                  </motion.div>
                )
            )}
          </div>
        </div>
      </LayoutGroup>
    </>
  );
}
