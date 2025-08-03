declare global {
  interface Window {
    refreshJournalEntries?: () => void;
    fontLoadingDebug?: {
      log: (message: string) => void;
    };
  }
}

export {};