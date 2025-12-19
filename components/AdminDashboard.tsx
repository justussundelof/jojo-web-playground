"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Button } from "./ui/button";
import EditContentForm from "./EditContentForm";
import { useRef, useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";

export default function AdminDashboard() {
  const [editing, setEditing] = useState<"about" | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const toggleForm = () => setOpenForm(!openForm);

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
    { slug: "about", label: "About" },

    { slug: "newsletter", label: "Newsletter" },
    { slug: "the-store", label: "Store" },
  ];

  const otherPages = [
    { slug: "contact", label: "Contact" },
    { slug: "imprint", label: "Imprint" },
    { slug: "privacy-policy", label: "Privacy Policy" },
  ];

  return (
    <>
      <LayoutGroup>
        <div className="pl-1 lg:pl-10 pr-1 pb-1 w-full flex-col bg- grid grid-cols-4 lg:grid-cols-12 ">
          <div className="col-span-4 lg:col-span-10 grid grid-cols-4 lg:grid-cols-6 auto-rows-fr items-start justify-start gap-1 ">
            <span
              onClick={toggleForm}
              className="col-span-1 bg-primary text-primary-foreground cursor-pointer aspect-3/4 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all font-serif-book text-sm"
            >
              Add Products
            </span>
            {openForm && <ProductForm toggleForm={toggleForm} mode="create" />}

            {mainPages.map((mainPage) => (
              <motion.span
                key={mainPage.slug}
                layout
                className="col-span-1lg:col-span-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground  transition-all  flex items-center justify-center cursor-pointer font-serif-book text-sm aspect-3/4"
                onClick={() => setEditing(mainPage.slug as any)}
              >
                {mainPage.label}
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
                    className="col-span-4 row-span-3   flex flex-col items-start justify-start bg-accent text-accent-foreground border border-secondary "
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
            {otherPages.map((otherPage) => (
              <motion.span
                key={otherPage.slug}
                layout
                className="col-span-1 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all aspect-3/4 flex items-center justify-center cursor-pointer font-serif-book text-sm    "
                onClick={() => setEditing(otherPage.slug as any)}
              >
                {otherPage.label}
              </motion.span>
            ))}

            {otherPages.map(
              (otherPage) =>
                editing === otherPage.slug && (
                  <motion.div
                    key={otherPage.slug + "-panel"} // Ensure unique key for motion.div
                    ref={(el) => {
                      panelRefs.current[otherPage.slug] = el;
                    }}
                    layout
                    className="col-span-4 row-span-3 bg-background shadow-xl flex flex-col items-start justify-start"
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setEditing(null)}
                    >
                      Close
                    </Button>
                    <div className="jojo-container-padding">
                      <EditContentForm pageSlug={otherPage.slug} />
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
