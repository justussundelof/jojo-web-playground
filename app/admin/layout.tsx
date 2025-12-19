import React from "react";
import AdminSidebar from "@/components/AdminSideBar";
import HeaderNav from "@/components/Navigation-header/HeaderNav";
import { ProductProvider } from "@/context/ProductContext";

export default function AdminLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <ProductProvider>
        <HeaderNav />
        <AdminSidebar />
        {children}
        {modal}
      </ProductProvider>
    </>
  );
}
