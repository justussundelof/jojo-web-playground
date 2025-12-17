"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Button } from "./ui/button";
import EditContentForm from "./EditContentForm";
import { useRef, useEffect, useState } from "react";

const panelRefs = useRef<HTMLDivElement[]>([]);

export default function AdminDashboard() {
  const [editing, setEditing] = useState<"about" | null>(null);

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
    { slug: "contact", label: "Contact" },

    { slug: "newsletter", label: "Newsletter" },
    { slug: "the-store", label: "Store" },
  ];

  const otherPages = [
    { slug: "imprint", label: "Imprint" },
    { slug: "privacy-policy", label: "Privacy Policy" },
  ];

  return (
    <LayoutGroup>
      <div className="pt-19 lg:pt-10 pl-1 lg:pl-10 pr-1 pb-1 w-full flex-col bg-background grid grid-cols-12 ">
        <div className="col-span-8 grid grid-cols-6 auto-rows-fr items-start justify-start gap-1 ">
          <span className="col-span-2 bg-primary text-primary-foreground cursor-pointer aspect-square flex items-center justify-center hover:bg-primary/60 transition-all font-serif-display ">
            Add Products
          </span>
          {mainPages.map((mainPage) => (
            <motion.span
              key={mainPage.slug}
              layout
              className="col-span-2 bg-secondary text-secondary-foreground aspect-square flex items-center justify-center cursor-pointer font-serif-display "
              onClick={() => setEditing(mainPage.slug as any)}
            >
              {mainPage.label}
            </motion.span>
          ))}

          {mainPages.map(
            (mainPage) =>
              editing === mainPage.slug && (
                <motion.div
                  key={mainPage.slug + "-panel"}
                  ref={(el) => (panelRefs.current[mainPage.slug] = el)}
                  layout
                  className="col-span-4 row-span-3 bg-background shadow-xl flex flex-col items-start justify-start"
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
              className="col-span-1 bg-accent aspect-square flex items-center justify-center cursor-pointer font-serif-display "
              onClick={() => setEditing(otherPage.slug as any)}
            >
              {otherPage.label}
            </motion.span>
          ))}

          {otherPages.map(
            (otherPage) =>
              editing === otherPage.slug && (
                <motion.div
                  key={otherPage.slug + "-panel"}
                  ref={panelRef} // attach ref here
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
  );
}
