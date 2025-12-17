"use client";

import { useState } from "react";
import type { Tag } from "@/types/database";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
  CardTitle,
} from "./ui/card";

interface TagSelectProps {
  tags: Tag[];
  selectedTagId: string;
  onChange: (tagId: string) => void;
  onTagCreated: (newTag: Tag) => void;
}

export default function TagSelect({
  tags,
  selectedTagId,
  onChange,
  onTagCreated,
}: TagSelectProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError("Tag name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tag");
      }

      const newTag: Tag = await response.json();

      onTagCreated(newTag);
      onChange(newTag.id.toString());

      setShowCreateModal(false);
      setNewTagName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (value === "__create_new__") {
      setShowCreateModal(true);
      return;
    }

    onChange(value);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewTagName("");
    setError(null);
  };

  return (
    <>
      {/* Tag Select */}
      <Select value={selectedTagId} onValueChange={handleValueChange}>
        <SelectTrigger className="">
          <SelectValue placeholder="Select tag" />
        </SelectTrigger>

        <SelectContent>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id.toString()}>
              {tag.name}
            </SelectItem>
          ))}

          <SelectItem value="__create_new__" className="font-medium">
            + Skapa ny tagg
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div
          className="absolute z-10 mt-3 max-w-lg w-full   "
          onClick={handleCloseModal}
        >
          <Card
            className="bg-background    font-serif-book text-sm py-9 px-3 w-full h-full flex flex-col space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <CardHeader className="  ">
              <CardTitle className="mb-3">Create new tag</CardTitle>
            </CardHeader>

            {/* Content */}
            <CardContent className="">
              {error && <div className="">{error}</div>}

              <Input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
                className=""
                placeholder="Vintage, Y2K, etc."
                autoFocus
                disabled={isCreating}
              />
            </CardContent>

            {/* Actions */}
            <CardAction className=" flex flex-col w-full justify-end">
              <Button
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className=""
              >
                {isCreating ? "Skapar..." : "Skapa"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isCreating}
                className=""
              >
                Avbryt
              </Button>
            </CardAction>
          </Card>
        </div>
      )}
    </>
  );
}
