"use client";

import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useSite } from "@/app/context/SiteContext";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function MenuOverlay({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentSite } = useSite();
  const [gender, setGender] = useState<"man" | "woman">("woman");

  const categories = ["Clothing", "Accessories", "Shoes", "Bags"];

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full w-full ${
        currentSite === "sale" ? "bg-pink-600" : "bg-blue-600"
      } `}
    >
      <Button
        onClick={() => setOpen(false)}
        variant="ghost"
        size="sm"
        className="font-mono absolute top-0 right-0"
      >
        <Cross1Icon />
      </Button>

      <div className="h-[50vh] pt-24 px-6">
        <div className="grid w-full max-w-sm items-center gap-1.5 font-mono font-normal text-xs rounded-none mb-6">
          <Input
            className=" border-black placeholder:text-black placeholder:text-xs font-mono text-xs rounded-none shadow-none "
            id="text"
            type="text"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="h-[50vh] bg-pink-600 pt-12 px-6">
        <div className="mb-4">
          <Button variant="link" size="sm" className="font-mono text-xs">
            Latest Added
          </Button>
        </div>

        {/* Gender Selector */}
        <div className="flex gap-2 mb-4 items-center">
          <Button
            variant="link"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setGender("man")}
          >
            Man
          </Button>
          <span className=" font-mono text-xs">/</span>
          <Button
            variant="link"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setGender("woman")}
          >
            Woman
          </Button>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 ">
          {categories.map((category, index) => (
            <div key={index} className="col-span-1  ">
              <Button variant="link" size="sm" className="font-mono text-xs ">
                {gender === "man" ? "Men's" : "Women's"} {category}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeaderNav() {
  const { currentSite, toggleSite } = useSite();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* TOP PART OF HEADER */}
      <header
        className={`bg-white fixed z-30 top-0 left-0 grid grid-cols-2 lg:grid-cols-6`}
      >
        <div className="flex  w-full    ">
          <Button variant="ghost" size="sm" className="font-mono text-xs">
            JOJO STUDIO
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="font-mono font-normal text-xs"
            onClick={toggleSite}
          >
            <span className={`text-foreground`}>
              {currentSite === "sale" ? "FOR RENT" : "FOR SALE"}
            </span>{" "}
            /{" "}
            <span className="text-foreground/60 line-through">
              {" "}
              {currentSite === "sale" ? "SALE" : "RENT"}
            </span>
          </Button>
        </div>

        {/* OPEN/CLOSED SIGN */}

        {/* <div className="col-span-1 flex flex-col justify-baseline items-end font-mono w-full">
          <Badge className="flex items-center space-x-1.5">
            open
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="line-through opacity-30">closed</span>
          </Badge>
          <span className="ml-3 hidden lg:flex">mon—sat 10—16</span>
        </div> */}
      </header>

      {/* 🍀 STICKY → FIXED NAVBAR */}
      <div
        className={`bg-white fixed z-40 top-0  right-0 flex justify-between   rounded-none items-center`}
      >
        <span className="flex justify-end ">
          <Button variant="ghost" size="sm" className="font-mono text-xs ">
            Log In
          </Button>

          <Button variant="ghost" size="sm" className="font-mono text-xs">
            Cart
          </Button>

          <Button
            onClick={() => setOpen(!open)}
            variant="ghost"
            className=" "
            size="sm"
          >
            <HamburgerMenuIcon />
          </Button>
        </span>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white h-3"></div>

      {open && <MenuOverlay setOpen={setOpen} />}

      {/* <div className="z-40 fixed bottom-0 left-0 right-0  flex items-baseline justify-between font-serif-densed  w-full text-sm py-1.5 px-3 text-black ">
        J<div className="w-2.5 aspect-square rounded-full bg-black" />J
        <span className="font-serif-wide">O</span>
      </div> */}
    </>
  );
}
