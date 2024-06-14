"use client";
import React from "react";

export const SearchContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export default function SearchContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <SearchContext.Provider
        value={{
          open: open,
          setOpen: setOpen,
        }}
      >
        {children}
      </SearchContext.Provider>
    </>
  );
}
