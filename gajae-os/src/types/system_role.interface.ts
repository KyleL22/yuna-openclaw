export interface SystemRole {
  id: string;
  name: string;
  persona: {
    tone: string;
    core_values: string[];
  };
  responsibilities: Record<string, string>;
}
