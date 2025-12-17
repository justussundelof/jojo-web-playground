"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Page } from "@/types/content";

interface EditContentFormProps {
  pageSlug: string; // e.g., "about", "privacy-policy"
}

export default function EditContentForm({ pageSlug }: EditContentFormProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient(); // make sure this works in your client environment

  // Load page data
  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", pageSlug)
        .single();
      if (error) {
        console.error("Error fetching page:", error);
      } else {
        setPage(data);
      }
      setLoading(false);
    }

    fetchPage();
  }, [pageSlug, supabase]);

  // Handle form submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;

    setSaving(true);

    const { error } = await supabase
      .from("pages")
      .update({
        title: page.title,
        content: page.content,
        content_html: page.content_html,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
      })
      .eq("id", page.id);

    if (error) {
      console.error("Error saving page:", error);
      alert("Error saving page, check console.");
    } else {
      alert("Page saved successfully!");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!page) return <p>Page not found.</p>;

  return (
    <form className="space-y-6 w-full" onSubmit={handleSave}>
      <div className="w-full">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={page.title || ""}
          onChange={(e) => setPage({ ...page, title: e.target.value })}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="content">Content (Text)</Label>
        <Textarea
          id="content"
          value={page.content || ""}
          rows={6}
          onChange={(e) => setPage({ ...page, content: e.target.value })}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="content_html">Content (HTML)</Label>
        <Textarea
          id="content_html"
          value={page.content_html || ""}
          rows={6}
          onChange={(e) => setPage({ ...page, content_html: e.target.value })}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="seo_title">SEO Title</Label>
        <Input
          id="seo_title"
          value={page.seo_title || ""}
          onChange={(e) => setPage({ ...page, seo_title: e.target.value })}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="seo_description">SEO Description</Label>
        <Textarea
          id="seo_description"
          value={page.seo_description || ""}
          rows={3}
          onChange={(e) =>
            setPage({ ...page, seo_description: e.target.value })
          }
        />
      </div>

      <Button className="w-full" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
