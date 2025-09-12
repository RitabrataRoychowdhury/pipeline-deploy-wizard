import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface InteractiveState {
  isLoading: boolean;
  isDragging: boolean;
  isHovered: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isDisabled: boolean;
}

interface InteractiveStateContextType {
  states: Map<string, InteractiveState>;
  updateState: (id: string, updates: Partial<InteractiveState>) => void;
  getState: (id: string) => InteractiveState;
  resetState: (id: string) => void;
  clearAllStates: () => void;
}

const defaultState: InteractiveState = {
  isLoading: false,
  isDragging: false,
  isHovered: false,
  isSelected: false,
  isFocused: false,
  isPressed: false,
  isDisabled: false,
};

const InteractiveStateContext = createContext<InteractiveStateContextType | null>(null);

export const useInteractiveState = (id: string) => {
  const context = useContext(InteractiveStateContext);
  if (!context) {
    throw new Error("useInteractiveState must be used within an InteractiveStateProvider");
  }

  const state = context.getState(id);
  
  const updateState = useCallback((updates: Partial<InteractiveState>) => {
    context.updateState(id, updates);
  }, [context, id]);

  const resetState = useCallback(() => {
    context.resetState(id);
  }, [context, id]);

  // Convenience methods
  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const setDragging = useCallback((dragging: boolean) => {
    updateState({ isDragging: dragging });
  }, [updateState]);

  const setHovered = useCallback((hovered: boolean) => {
    updateState({ isHovered: hovered });
  }, [updateState]);

  const setSelected = useCallback((selected: boolean) => {
    updateState({ isSelected: selected });
  }, [updateState]);

  const setFocused = useCallback((focused: boolean) => {
    updateState({ isFocused: focused });
  }, [updateState]);

  const setPressed = useCallback((pressed: boolean) => {
    updateState({ isPressed: pressed });
  }, [updateState]);

  const setDisabled = useCallback((disabled: boolean) => {
    updateState({ isDisabled: disabled });
  }, [updateState]);

  return {
    ...state,
    updateState,
    resetState,
    setLoading,
    setDragging,
    setHovered,
    setSelected,
    setFocused,
    setPressed,
    setDisabled,
  };
};

interface InteractiveStateProviderProps {
  children: ReactNode;
}

export const InteractiveStateProvider = ({ children }: InteractiveStateProviderProps) => {
  const [states, setStates] = useState<Map<string, InteractiveState>>(new Map());

  const updateState = useCallback((id: string, updates: Partial<InteractiveState>) => {
    setStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(id) || { ...defaultState };
      newStates.set(id, { ...currentState, ...updates });
      return newStates;
    });
  }, []);

  const getState = useCallback((id: string): InteractiveState => {
    return states.get(id) || { ...defaultState };
  }, [states]);

  const resetState = useCallback((id: string) => {
    setStates(prev => {
      const newStates = new Map(prev);
      newStates.set(id, { ...defaultState });
      return newStates;
    });
  }, []);

  const clearAllStates = useCallback(() => {
    setStates(new Map());
  }, []);

  const value: InteractiveStateContextType = {
    states,
    updateState,
    getState,
    resetState,
    clearAllStates,
  };

  return (
    <InteractiveStateContext.Provider value={value}>
      {children}
    </InteractiveStateContext.Provider>
  );
};

// Higher-order component for adding interactive states
interface WithInteractiveStatesProps {
  id: string;
  children: (state: ReturnType<typeof useInteractiveState>) => ReactNode;
}

export const WithInteractiveStates = ({ id, children }: WithInteractiveStatesProps) => {
  const state = useInteractiveState(id);
  return <>{children(state)}</>;
};

// Hook for managing drag and drop states
export const useDragAndDrop = (id: string) => {
  const { isDragging, setDragging } = useInteractiveState(id);

  const handleDragStart = useCallback((event: React.DragEvent) => {
    setDragging(true);
    event.dataTransfer.effectAllowed = 'move';
  }, [setDragging]);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
  }, [setDragging]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    isDragging,
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
    dropProps: {
      onDragOver: handleDragOver,
    },
  };
};

// Hook for managing hover states with delays
export const useHoverState = (id: string, delay: number = 0) => {
  const { isHovered, setHovered } = useInteractiveState(id);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (delay > 0) {
      const newTimeoutId = setTimeout(() => {
        setHovered(true);
      }, delay);
      setTimeoutId(newTimeoutId);
    } else {
      setHovered(true);
    }
  }, [setHovered, delay, timeoutId]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setHovered(false);
  }, [setHovered, timeoutId]);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

// Hook for managing selection states
export const useSelectionState = (id: string) => {
  const { isSelected, setSelected } = useInteractiveState(id);

  const toggleSelection = useCallback(() => {
    setSelected(!isSelected);
  }, [isSelected, setSelected]);

  const select = useCallback(() => {
    setSelected(true);
  }, [setSelected]);

  const deselect = useCallback(() => {
    setSelected(false);
  }, [setSelected]);

  return {
    isSelected,
    setSelected,
    toggleSelection,
    select,
    deselect,
  };
};

export default InteractiveStateProvider;