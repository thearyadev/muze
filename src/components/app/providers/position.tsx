import React, { useState, useContext, createContext } from "react";

const PositionContext = createContext<{
  position: number[];
  changePosition: (position: number[]) => void;
  maxposition: number;
  setMaxPosition: (maxposition: number) => void;
} | null>(null);

const usePosition = () => useContext(PositionContext);

const PositionProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>;
  children: React.ReactNode;
}> = ({ audioRef, children }) => {
  const [position, setPosition] = useState([0]);
  const [maxposition, setMaxPosition] = useState(0);
  const changePosition = () => {
    if (!audioRef.current) return;
    setPosition([audioRef.current.currentTime]);
  };
  return (
    <PositionContext.Provider
      value={{
        position: position,
        changePosition: changePosition,
        maxposition: maxposition,
        setMaxPosition: setMaxPosition,
      }}
    >
      {children}
    </PositionContext.Provider>
  );
};

export { usePosition, PositionProvider };
