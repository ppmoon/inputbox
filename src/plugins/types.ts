export interface Plugin {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  execute: (query: string) => Promise<string | null>;
}
