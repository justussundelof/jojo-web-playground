"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ImageUploadMultiple from "@/components/ImageUploadMultiple";
import TagSelect from "@/components/TagSelect";
import MeasurementFields from "@/components/MeasurementFields";
import type {
  Category,
  Tag,
  Size,
  Article,
  ProductMeasurements,
} from "@/types/database";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface ProductFormProps {
  mode: "create" | "edit";
  initialProduct?: Article;
  toggleForm: () => void;
}

export default function ProductForm({
  toggleForm,
  mode,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [orderedImageUrls, setOrderedImageUrls] = useState<string[]>([]);

  // Fetched data from database
  const [genders, setGenders] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    title: initialProduct?.title || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price?.toString() || "",
    category_id: initialProduct?.category_id?.toString() || "",
    tag_id: initialProduct?.tag_id?.toString() || "",
    size_id: initialProduct?.size_id?.toString() || "",
    in_stock: initialProduct?.in_stock ?? true,
    for_sale: initialProduct?.for_sale ?? true,
  });

  const [measurements, setMeasurements] = useState<ProductMeasurements | null>(
    initialProduct?.measurements || null
  );

  // Fetch categories, tags, and sizes on mount
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch top-level categories (genders)
      const { data: genderData } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("name");

      if (genderData) setGenders(genderData);

      // Fetch tags
      const { data: tagData } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (tagData) setTags(tagData);

      // Fetch sizes
      const { data: sizeData } = await supabase
        .from("sizes")
        .select("*")
        .order("sort_order");

      if (sizeData) setSizes(sizeData);

      // If editing, fetch the parent category (gender) for the product's category
      if (mode === "edit" && initialProduct) {
        // Fetch category data if available
        if (initialProduct.category_id) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("*")
            .eq("id", initialProduct.category_id)
            .single();

          if (categoryData) {
            setSelectedCategoryName(categoryData.name);
            if (categoryData.parent_id) {
              setSelectedGender(categoryData.parent_id.toString());
            }
          }
        }

        // Fetch existing images (always, regardless of category)
        const { data: imagesData } = await supabase
          .from("product_images")
          .select("*")
          .eq("article_id", initialProduct.id)
          .order("display_order");

        if (imagesData && imagesData.length > 0) {
          const urls = imagesData.map((img) => img.image_url);
          setExistingImageUrls(urls);
        } else if (initialProduct.img_url) {
          // Fallback to old single image
          setExistingImageUrls([initialProduct.img_url]);
        }
      }
    };

    fetchData();
  }, [mode, initialProduct]);

  // Fetch subcategories when gender changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedGender) {
        setCategories([]);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", selectedGender)
        .order("name");

      if (data) setCategories(data);
    };

    fetchSubcategories();
  }, [selectedGender]);

  useEffect(() => {
    if (mode === "edit" && initialProduct) {
      setFormData({
        title: initialProduct.title || "",
        description: initialProduct.description || "",
        price: initialProduct.price?.toString() || "",
        category_id: initialProduct.category_id?.toString() || "",
        tag_id: initialProduct.tag_id?.toString() || "",
        size_id: initialProduct.size_id?.toString() || "",
        in_stock: initialProduct.in_stock ?? true,
        for_sale: initialProduct.for_sale ?? true,
      });

      setMeasurements(initialProduct.measurements || null);
    }
  }, [mode, initialProduct]);

  const handleTagCreated = (newTag: Tag) => {
    // Add new tag to the tags list
    setTags((prev) =>
      [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
    // Reset category when gender changes
    setFormData((prev) => ({
      ...prev,
      category_id: "",
    }));
    setSelectedCategoryName(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category_id: categoryId,
    }));

    // Find and set the category name
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    setSelectedCategoryName(category?.name || null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Get signature from our API
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
      });

      if (!signResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } =
        await signResponse.json();

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Upload to Cloudinary failed");
      }

      const data = await uploadResponse.json();

      // Return the secure URL
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Upload all new images to Cloudinary
      const uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadedUrl = await uploadImage(file);
          if (!uploadedUrl) {
            throw new Error("Failed to upload one or more images");
          }
          uploadedUrls.push(uploadedUrl);
        }
      }

      // Determine the primary image URL
      let firstImageUrl: string | null = null;

      if (orderedImageUrls.length > 0) {
        // Use the first image from the reordered list (works for both create and edit)
        const firstOrderedUrl = orderedImageUrls[0];

        // If it's a blob URL (new image), replace with uploaded URL
        if (firstOrderedUrl.startsWith("blob:")) {
          const blobIndex = orderedImageUrls
            .filter((u) => u.startsWith("blob:"))
            .indexOf(firstOrderedUrl);
          firstImageUrl = uploadedUrls[blobIndex] || null;
        } else {
          // It's an existing image URL (only in edit mode)
          firstImageUrl = firstOrderedUrl;
        }
      } else if (uploadedUrls.length > 0) {
        // Fallback: use first uploaded image
        firstImageUrl = uploadedUrls[0];
      } else if (existingImageUrls.length > 0) {
        // Fallback: use first existing image
        firstImageUrl = existingImageUrls[0];
      }

      const productData: any = {
        title: formData.title || null,
        description: formData.description || null,
        price: formData.price ? parseInt(formData.price) : null,
        in_stock: formData.in_stock,
        for_sale: formData.for_sale,
        img_url: firstImageUrl,
        measurements: measurements || {},
      };

      // Only include foreign key fields if they have values
      if (formData.category_id)
        productData.category_id = parseInt(formData.category_id);
      if (formData.tag_id) productData.tag_id = parseInt(formData.tag_id);
      if (formData.size_id) productData.size_id = parseInt(formData.size_id);

      let productId: number;

      if (mode === "create") {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from("article")
          .insert([productData])
          .select()
          .single();

        if (insertError || !newProduct) {
          throw insertError || new Error("Failed to create product");
        }

        productId = newProduct.id;

        if (orderedImageUrls.length > 0) {
          const finalOrderedUrls = orderedImageUrls.map((url) => {
            if (url.startsWith("blob:")) {
              const index = orderedImageUrls
                .filter((u) => u.startsWith("blob:"))
                .indexOf(url);
              return uploadedUrls[index] || url;
            }
            return url;
          });

          const imageRecords = finalOrderedUrls.map((url, index) => ({
            article_id: productId,
            image_url: url,
            display_order: index,
            is_primary: index === 0,
          }));

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imageRecords);

          if (imagesError) {
            console.error("Failed to save images:", imagesError);
            // Don't fail the whole operation, just log
          }
        } else if (uploadedUrls.length > 0) {
          // Fallback: if no ordered list, just save uploaded URLs in order
          const imageRecords = uploadedUrls.map((url, index) => ({
            article_id: productId,
            image_url: url,
            display_order: index,
            is_primary: index === 0,
          }));

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imageRecords);

          if (imagesError) {
            console.error("Failed to save images:", imagesError);
          }
        }

        router.push("/admin");
      } else {
        // Update existing product
        productId = initialProduct!.id!;

        const { error: updateError } = await supabase
          .from("article")
          .update(productData)
          .eq("id", productId);

        if (updateError) {
          throw updateError;
        }

        // Handle image order updates
        if (orderedImageUrls.length > 0) {
          // Build final ordered list: replace preview URLs with uploaded URLs
          const finalOrderedUrls = orderedImageUrls.map((url) => {
            // If it's a blob URL (preview), find the corresponding uploaded URL
            if (url.startsWith("blob:")) {
              const index = orderedImageUrls
                .filter((u) => u.startsWith("blob:"))
                .indexOf(url);
              return uploadedUrls[index] || url;
            }
            return url;
          });

          // Delete all existing images for this product
          const { error: deleteError } = await supabase
            .from("product_images")
            .delete()
            .eq("article_id", productId);

          if (deleteError) {
            console.error("Failed to delete old images:", deleteError);
          }

          // Insert all images with new order
          const imageRecords = finalOrderedUrls.map((url, index) => ({
            article_id: productId,
            image_url: url,
            display_order: index,
            is_primary: index === 0,
          }));

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imageRecords);

          if (imagesError) {
            console.error("Failed to save images:", imagesError);
          }
        }

        router.push(`/admin/products/${productId}`);
      }

      router.refresh();
      toggleForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialProduct) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const supabase = createClient();

      // Delete associated images first
      await supabase
        .from("product_images")
        .delete()
        .eq("article_id", initialProduct.id);

      // Delete the product
      const { error } = await supabase
        .from("article")
        .delete()
        .eq("id", initialProduct.id);

      if (error) throw error;

      // Refresh admin page and close modal
      toggleForm();
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  return (
    <form
      className="fixed top-14 left-0  lg:top-8 z-40 bg-background border-r border-b w-full  h-screen 
    overflow-y-auto grid grid-cols-1 lg:grid-cols-2 pl-0 pr-0 pt-3 lg:pl-14 lg:pt-6   pb-3    "
      onSubmit={handleSubmit}
    >
      <div className="col-start-1 col-span-2 flex justify-between items-center w-full ">
        <h1 className=" font-serif-book text-sm pl-3 pt-3 ">Add Product</h1>

        <Button onClick={toggleForm} variant="link" className="">
          Close [x]
        </Button>
      </div>

      {error && (
        <div className="mb-6 border border-red-600 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      <div className="col-start-1 col-span-1  lg:col-start-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6 py-9 px-3   ">
        {/* Photo Section */}
        <div className="col-start-1 col-span-1">
          <h3 className="text-sm font-serif-book mb-3">
            Add media (images/video)
          </h3>
          <ImageUploadMultiple
            onImagesChange={setImageFiles}
            onOrderChange={setOrderedImageUrls}
            existingImages={existingImageUrls}
            maxImages={8}
          />
        </div>

        {/* Form Section */}
        <div className="col-start-1 lg:col-start-2 col-span-1  flex flex-col space-y-6  w-full">
          <h3 className=" font-serif-book text-sm">Product Details</h3>
          <div className="">
            <Label className=" ">Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full"
              placeholder="Vintage Leather Jacket"
            />
          </div>

          <div>
            <Label className=" ">Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full"
              placeholder="About the article..."
            />
          </div>

          <div>
            <Label className="">Price (SEK)</Label>
            <Input
              type="number"
              name="price"
              step="1"
              min="0"
              pattern="[0-9]*"
              value={formData.price}
              onChange={handleChange}
              className="w-full"
              placeholder="299"
            />
          </div>

          <div className="w-full">
            <Label>Gender</Label>

            <Select value={selectedGender} onValueChange={handleGenderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>

              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.id} value={gender.id.toString()}>
                    {gender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>

            <Select
              value={formData.category_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  category_id: value,
                }));

                const category = categories.find(
                  (cat) => cat.id.toString() === value
                );
                setSelectedCategoryName(category?.name || null);
              }}
              disabled={!selectedGender}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="">Tag</Label>
            <TagSelect
              tags={tags}
              selectedTagId={formData.tag_id}
              onChange={(tagId) =>
                setFormData((prev) => ({ ...prev, tag_id: tagId }))
              }
              onTagCreated={handleTagCreated}
            />
          </div>
          <div>
            <Label>Size</Label>

            <Select
              value={formData.size_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, size_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>

              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id.toString()}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className=" grid grid-cols-2 items-start justify-star mt-6">
            <div>
              <RadioGroup
                value={formData.for_sale ? "sale" : "rent"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    for_sale: value === "sale",
                  }))
                }
                className=""
              >
                <Label className="flex items-center gap-3 cursor-pointer">
                  <RadioGroupItem value="sale" />
                  <span className="">Till salu (For Sale)</span>
                </Label>

                <Label className="flex items-center gap-3 cursor-pointer">
                  <RadioGroupItem value="rent" />
                  <span className="">Uthyrning (For Rent)</span>
                </Label>
              </RadioGroup>
            </div>
            <Label className="flex items-center gap-3 cursor-pointer mb-6">
              <Checkbox
                checked={formData.in_stock}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    in_stock: Boolean(checked),
                  }))
                }
              />
              In Stock
            </Label>
            {/* Listing Type: Sale or Rent */}
          </div>

          {/* Measurements Section */}
          <MeasurementFields
            categoryName={selectedCategoryName}
            measurements={measurements}
            onChange={setMeasurements}
          />

          <Button size="lg" type="submit" disabled={loading} className="w-full">
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Product"
              : "Save Changes"}
          </Button>

          {mode === "edit" && (
            <Button
              size="lg"
              variant="destructive"
              type="button"
              onClick={handleDelete}
              className="w-full"
            >
              Delete Product
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
