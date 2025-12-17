import Image from "next/image";
import { useSite } from "@/app/context/SiteContext";

export default function LoaderGIF() {
  const { currentSite } = useSite();
  return (
    <div className="fixed top-0 left-0 right-0 loader-container min-h-screen flex flex-col justify-center items-center bg-background z-50 px-3 lg:px-0 ">
      <Image
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjFtcXNvazI0eTY0Z2d5anNxaGgxZ3F5YmZtdGF1eTVwZm5maWJpaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wcBMpl6V6ZZE4/giphy.gif"
        width={400}
        height={281}
        alt="loading"
        className="object-cover w-full lg:max-w-2xl mx-auto aspect-video "
      />
    </div>
  );
}
