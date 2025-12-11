import { HamburgerMenuIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Link from "next/link";

export default function HeaderNav() {
  return (
    <>
      {/* TOP PART OF HEADER */}
      <header className="relative top-0 grid grid-cols-2 lg:grid-cols-6 bg-white">
        <div className=" absolute z-10 top-0 left-0 flex bg-white w-full    ">
          <Button variant="ghost" size="sm" className="font-mono text-sm">
            JOJO
          </Button>
          <Button
            size="sm"
            className="font-mono font-normal text-xs bg-pink-600 "
          >
            <span className="">FOR SALE</span> /{" "}
            <span className="text-black/60 line-through"> RENT</span>
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
      <div className="fixed z-20 top-0  right-0 flex justify-between   rounded-none items-center bg-white ">
        <span className="flex justify-end ">
          <Button variant="ghost" size="sm" className="font-mono text-xs ">
            Log In
          </Button>

          <Button variant="ghost" size="sm" className="font-mono text-xs">
            Cart
          </Button>

          <Button variant="ghost" className=" " size="sm">
            <HamburgerMenuIcon />
          </Button>
        </span>
      </div>

      {/* <div className="z-40 fixed bottom-0 left-0 right-0  flex items-baseline justify-between font-serif-densed  w-full text-sm py-1.5 px-3 text-black ">
        J<div className="w-2.5 aspect-square rounded-full bg-black" />J
        <span className="font-serif-wide">O</span>
      </div> */}
    </>
  );
}
