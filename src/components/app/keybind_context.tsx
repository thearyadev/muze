"use client";
import React, { useEffect } from "react";

type KeybindAction = () => void;

interface KeybindChainKey {
  [key: string]: KeybindAction;
}

interface KeybindCollection {
  [key: string]: KeybindChainKey;
}
interface KeybindContextType {
  registerKeybind: (
    rootKey: string,
    chainKey?: string,
  ) => (action: KeybindAction) => void;
}

export const KeybindContext = React.createContext<KeybindContextType>({
  registerKeybind: () => () => {},
});

export default function KeybindContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [keybinds, setKeybinds] = React.useState<KeybindCollection>({});
  const keyPressRef = React.useRef<string[]>([]);
  const registerKeybind = (rootKey: string, chainKey?: string) => {
    return (action: KeybindAction) => {
      setKeybinds((prevKeybinds) => {
        return {
          ...prevKeybinds,
          [rootKey]: {
            ...prevKeybinds[rootKey],
            [chainKey ?? ""]: action,
          },
        };
      });
    };
  };
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      const { key } = event;
      if (keyPressRef.current.includes(key)) return;

      keyPressRef.current.push(key);
      // check if any of the root keys are in the currently pressed keys
      const rootKeys = Object.keys(keybinds);
      if (rootKeys.includes(keyPressRef.current[0] as string)) {
        const rootKey = keyPressRef.current[0] as string;
        const chainKey = keyPressRef.current.slice(1).join("");

        // @ts-ignore - unsafe object key retrieval, confirmed before
        const action = keybinds[rootKey][chainKey];
        if (action) {
          action();
        }
      }
      console.log(`Keys Pressed: ${keyPressRef.current}`);
    };

    const keyUpHandler = (event: KeyboardEvent) => {
      // on key up assume all commands are cancelled
      keyPressRef.current = [];
    };
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      keyPressRef.current = [];
    };
  }, [keybinds]);

  return (
    <KeybindContext.Provider value={{ registerKeybind: registerKeybind }}>
      {children}
    </KeybindContext.Provider>
  );
}
