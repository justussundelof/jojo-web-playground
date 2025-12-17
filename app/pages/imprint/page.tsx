"use client";

import { useContent } from "@/context/ContentContext";

export default function ImprintPage() {
  const { getPageBySlug } = useContent();
  const page = getPageBySlug("imprint");

  if (!page) return <p>Page not found.</p>;

  return (
    <div className="pt-8 grid grid-cols-2 gap-x-12 bg-popover text-popover-foreground min-h-screen">
      <div className="col-span-2 lg:col-span-1 flex flex-col px-6 pt-12 pb-24 space-y-8">
        {/* Page Title */}
        {page.title && (
          <h1 className="font-serif-display leading-tight">{page.title}</h1>
        )}

        {/* Optional: render HTML content if available */}
        {page.content_html && (
          <div
            className="text-2xl font-serif-book "
            dangerouslySetInnerHTML={{ __html: page.content_html }}
          />
        )}
      </div>
    </div>
  );
}
