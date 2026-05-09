export interface Suggestion {
  title: string;
  value: string;
}

export interface Plugin {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  execute: (query: string) => Promise<string | null>;
  suggestions?: () => Promise<Suggestion[]>;
}
