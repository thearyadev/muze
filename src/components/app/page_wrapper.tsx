"use client";
import React, { useRef } from "react";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-screen w-full pb-20 text-white">{children}</div>
    </>
  );
}
