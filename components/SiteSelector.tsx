import { Button } from "./ui/button";
import { useSite } from "@/app/context/SiteContext";

export default function SiteSelector() {
  const { currentSite, setCurrentSite } = useSite();
  return (
    <section className=" h-[75vh] lg:h-[25vh] grid grid-cols-2 px-3 mt-8 ">
      <div
        className={`${
          currentSite === "sale" ? "bg-pink-600" : "bg-pink-600"
        } flex flex-col items-center justify-center px-6 text-white font-sans text-base space-y-6 hover:bg-pink-700`}
      >
        <Button onClick={() => setCurrentSite("sale")}>FOR SALE</Button>
      </div>
      <div
        className={`${
          currentSite === "rent" ? "bg-blue-600" : "bg-blue-600"
        } flex flex-col items-center justify-center px-6 text-white font-sans text-base space-y-6 hover:bg-blue-700`}
      >
        <Button onClick={() => setCurrentSite("rent")}>FOR RENT</Button>
      </div>
    </section>
  );
}
