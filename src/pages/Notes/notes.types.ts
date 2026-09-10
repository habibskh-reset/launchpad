export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  color?: "default" | "amber" | "emerald" | "violet" | "rose" | "blue";
  createdAt: string;
  updatedAt: string;
}

export type NoteCreateInput = {
  title: string;
  content: string;
  pinned?: boolean;
  color?: NoteItem["color"];
};

export type NoteUpdateInput = Partial<
  Pick<NoteItem, "title" | "content" | "pinned" | "color">
>;