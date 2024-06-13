import React, { useContext, createContext, useState } from "react";

const LoopContext = createContext<{
  loop: boolean;
  setLoop: (loop: boolean) => void;
} | null>(null);

const useLoop = () => useContext(LoopContext);
const LoopProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [loop, setLoop] = useState(false);
  return (
    <LoopContext.Provider
      value={{
        loop,
        setLoop,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export { useLoop, LoopProvider };
