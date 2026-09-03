export type FolderColor =
  | "amber"
  | "emerald"
  | "violet"
  | "rose"
  | "cyan"
  | "blue";

export type FolderStyle = "filled" | "outline";

export interface Folder {
  id: string;
  title: string;
  icon: string;
  color: FolderColor;
  style: FolderStyle;
}

export interface LinkItem {
  id: string;
  columnId: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
}

export type TaskPriority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  dueTime?: string;
  reminder?: boolean;
  priority?: TaskPriority;
  date: string;
}

export interface WorkspaceSettings {
  title: string;
}

export interface Workspace {
  settings: WorkspaceSettings;
  columns: Folder[];
  links: LinkItem[];
  todos: TodoItem[];
}

export const DEFAULT_WORKSPACE: Workspace = {
  settings: { title: "Reset Launchpad" },
  columns: [
    {
      id: "col-1",
      title: "Daily & Essentials",
      icon: "fa-solid fa-star",
      color: "amber",
      style: "filled",
    },
    {
      id: "col-2",
      title: "Chats & Socials",
      icon: "fa-solid fa-comments",
      color: "emerald",
      style: "filled",
    },
    {
      id: "col-3",
      title: "Tools & AI",
      icon: "fa-solid fa-wand-magic-sparkles",
      color: "violet",
      style: "filled",
    },
    {
      id: "col-4",
      title: "Dev & Projects",
      icon: "fa-solid fa-code",
      color: "rose",
      style: "filled",
    },
  ],
  links: [
    {
      id: "link-1",
      columnId: "col-1",
      title: "Google Search",
      url: "https://google.com",
      description: "Quick web searches & tools",
      tags: ["Search"],
      pinned: true,
    },
    {
      id: "link-3",
      columnId: "col-2",
      title: "WhatsApp Web",
      url: "https://web.whatsapp.com",
      description: "Messaging & team chats",
      tags: ["Chat"],
      pinned: true,
    },
    {
      id: "link-5",
      columnId: "col-3",
      title: "ChatGPT",
      url: "https://chatgpt.com",
      description: "AI assistant & code helper",
      tags: ["AI"],
      pinned: true,
    },
  ],
  todos: [],
};

export function cloneDefaultWorkspace(): Workspace {
  return JSON.parse(JSON.stringify(DEFAULT_WORKSPACE)) as Workspace;
}
