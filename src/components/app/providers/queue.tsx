import React, { useContext, createContext, useState } from "react";

const QueueContext = createContext<{
  queue: boolean;
  setQueue: (loop: boolean) => void;
} | null>(null);

const useQueue = () => useContext(QueueContext);
const QueueProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queue, setQueue] = useState(false);
  return (
    <QueueContext.Provider
      value={{
        queue,
        setQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export { useQueue, QueueProvider};
