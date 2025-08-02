export interface JournalBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list';
  level?: 1 | 2 | 3;
  text: string;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  date: string;
  blocks: JournalBlock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommandOption {
  id: string;
  label: string;
  description: string;
  shortcut: string;
  type: JournalBlock['type'];
  level?: number;
  icon: string;
}