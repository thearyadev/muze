import React, { useState, useContext, createContext } from "react";

const PositionContext = createContext<{
  position: number[];
  changePosition: (position: number[]) => void;
  maxposition: number;
  setMaxPosition: (maxposition: number) => void;
  reactPosition: () => void;
} | null>(null);

const usePosition = () => useContext(PositionContext);

const PositionProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>;
  children: React.ReactNode;
}> = ({ audioRef, children }) => {
  const [position, setPosition] = useState([0]);
  const [maxposition, setMaxPosition] = useState(0);
  const reactPosition = () => {
    if (!audioRef.current) return;
    setPosition([audioRef.current.currentTime]);
    localStorage.setItem("position", audioRef.current.currentTime.toString());
  };

  const changePosition = (newPosition: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = newPosition[0]! ;
    setPosition(newPosition);
    localStorage.setItem("position", (newPosition[0]!).toString());
  };
  return (
    <PositionContext.Provider
      value={{
        position: position,
        changePosition: changePosition,
        maxposition: maxposition,
        setMaxPosition: setMaxPosition,
        reactPosition: reactPosition,
      }}
    >
      {children}
    </PositionContext.Provider>
  );
};

export { usePosition, PositionProvider };
