import { createContext, useContext } from "react";

interface HeaderActionsContextType {
  setOnCreate?: (fn?: () => void) => void;
  setOnCreateProject?: (fn?: () => void) => void;
  setOnCreateNote?: (fn?: () => void) => void;
  setOnCreateCommand?: (fn?: () => void) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextType>({});

export const useHeaderActions = () => useContext(HeaderActionsContext);

export const HeaderActionsProvider = HeaderActionsContext.Provider;
