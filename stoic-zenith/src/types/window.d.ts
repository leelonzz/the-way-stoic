declare global {
  interface Window {
    refreshJournalEntries?: () => void;
  }
}

export {};