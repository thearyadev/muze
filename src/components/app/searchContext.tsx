"use client";
import React, { useEffect } from "react";

export const SearchContext = React.createContext({
  open: false,
  setOpen: (open: boolean) => {},
});

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
