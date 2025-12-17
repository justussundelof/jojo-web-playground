import { Button } from "./ui/button";
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <header className="fixed top-8 lg:top-0 left-0 right-0 z-40 bg-accent w-full lg:w-14 h-8 lg:h-screen">
      <div className=" mt-0 lg:mt-12 flex flex-row items-center justify-between lg:flex-col bg-accent w-full">
        <Button asChild variant="link" size="sm">
          <Link href="/admin" className="">
            CMS
          </Link>
        </Button>

        <div className="flex flex-row items-center justify-end lg:flex-col  h-full">
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit" className="">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
