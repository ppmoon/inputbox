export interface Suggestion {
  title: string;
  value: string;
  timestamp?: number;
}

export interface Plugin {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  execute: (query: string) => Promise<string | null>;
  suggestions?: () => Promise<Suggestion[]>;
  /** Remove a single item by its value. Return true if removed. */
  removeItem?: (value: string) => boolean;
  /** Clear all items. */
  clearItems?: () => void;
}
