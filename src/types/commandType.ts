export type CommandCategory = "Bash" | "Git" | "Docker" | "SQL" | "NPM" | "Other";

export const CATEGORIES: CommandCategory[] = ["Bash", "Git", "Docker", "SQL", "NPM", "Other"];

export type CommandType = {
  id: string;
  title: string;
  command: string;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type CommandRequest = {
  title: string;
  command: string;
  description?: string;
  category: string;
};
