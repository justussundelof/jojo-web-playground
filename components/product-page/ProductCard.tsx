import { Book, BookmarkIcon } from "lucide-react";
import { Card, CardContent, CardDescription } from "../ui/card";
import Image from "next/image";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";

interface ProductCardProps {
  product: {
    img: string;
    title: string;
    price: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const productPrice = `${product.price} SEK`;

  const isVideo = product.img.includes("aspect-video");
  const aspectClass = isVideo ? "aspect-video" : "aspect-[3/4]";

  return (
    <Card className={`w-full `}>
      <CardContent className="p-0">
        <div className={`relative w-full ${aspectClass}`}>
          <Image
            src={`/${product.img}`}
            alt={product.title}
            fill
            className="object-cover object-top"
          />
        </div>
      </CardContent>
      <CardDescription className="py-3 px-1.5 space-y-1.5">
        <h3 className="font-bold truncate w-2/3">{product.title}</h3>
        <h4 className="flex w-full justify-between items-baseline font-mono ">
          {productPrice}
        </h4>
      </CardDescription>
    </Card>
  );
}
