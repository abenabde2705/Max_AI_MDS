import React, { createContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isHistoricOpen: boolean;
  setIsHistoricOpen: (open: boolean) => void;
  createNewConversation: () => void;
  setCreateNewConversation: (fn: () => void) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isHistoricOpen, setIsHistoricOpen] = useState(false);
  const [createNewConversation, setCreateNewConversation] = useState<() => void>(() => {});

  return (
    <ChatContext.Provider value={{ isHistoricOpen, setIsHistoricOpen, createNewConversation, setCreateNewConversation }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
