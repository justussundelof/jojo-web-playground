import { Button } from "./ui/button";
import { Card, CardContent, CardDescription } from "./ui/card";

import Image from "next/image";

export default function ProductsGrid() {
  return (
    <div className="">
      {/* FILTER BUTTONS */}
      <div className="z-10 sticky left-0 top-0  justify-start items-baseline  bg-white">
        <div className=" col-start-1 lg:col-start-3 flex  items-start font-mono text-xs ">
          <Button size="sm" variant="ghost" className=" ">
            FILTER
          </Button>
          <Button size="sm" variant="ghost" className=" ">
            Latest Added [x]
          </Button>
        </div>
      </div>
      <div className=" px-3">
        {/* GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-6 z-0 ">
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/17122024_Bootleg-Aphex-Twin_005.webp"
                  alt="login image"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Short-sleeve shirt [Desigual]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK{" "}
                <h4 className="text-xs text-gray-400 mr-1.5">2 available</h4>
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video">
                <Image
                  src="/aspect-video.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/1350715.avif"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/sweatshirt_men.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/17122024_Bootleg-Aphex-Twin_005.webp"
                  alt="login image"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Short-sleeve shirt [Desigual]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK{" "}
                <h4 className="text-xs text-gray-400 mr-1.5">2 available</h4>
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video">
                <Image
                  src="/aspect-video.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/1350715.avif"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/sweatshirt_men.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/17122024_Bootleg-Aphex-Twin_005.webp"
                  alt="login image"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Short-sleeve shirt [Desigual]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK{" "}
                <h4 className="text-xs text-gray-400 mr-1.5">2 available</h4>
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video">
                <Image
                  src="/aspect-video.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/1350715.avif"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/sweatshirt_men.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/17122024_Bootleg-Aphex-Twin_005.webp"
                  alt="login image"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Short-sleeve shirt [Desigual]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK{" "}
                <h4 className="text-xs text-gray-400 mr-1.5">2 available</h4>
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video">
                <Image
                  src="/aspect-video.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/1350715.avif"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src="/sweatshirt_men.png"
                  alt="login image"
                  fill
                  className="object-cover object-top-left"
                />
              </div>
            </CardContent>
            <CardDescription className="py-3 px-1.5">
              <h3 className="font-bold">Turtleneck sweater [JW ANDERSON]</h3>
              <span className="flex w-full justify-between items-baseline font-mono ">
                400 SEK
              </span>
            </CardDescription>
          </Card>
          <div className="h-screen"></div>
        </div>
      </div>
    </div>
  );
}
