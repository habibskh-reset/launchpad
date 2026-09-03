import { create } from "zustand";

export type MobileTab = "tasks" | "launchpad";

interface DashboardUIState {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  linkModalOpen: boolean;
  folderModalOpen: boolean;
  editingLinkId: string | null;
  editingFolderId: string | null;
  preferredColumnId: string | null;
  openLinkModal: (preferredColumnId?: string | null) => void;
  openEditLinkModal: (id: string) => void;
  openFolderModal: () => void;
  openEditFolderModal: (id: string) => void;
  closeLinkModal: () => void;
  closeFolderModal: () => void;
  reset: () => void;
}

export const useDashboardUI = create<DashboardUIState>((set) => ({
  activeTab: "tasks", // Tasks is default
  setActiveTab: (activeTab) => set({ activeTab }),
  linkModalOpen: false,
  folderModalOpen: false,
  editingLinkId: null,
  editingFolderId: null,
  preferredColumnId: null,
  openLinkModal: (preferredColumnId = null) =>
    set({
      linkModalOpen: true,
      editingLinkId: null,
      preferredColumnId,
    }),
  openEditLinkModal: (id) =>
    set({ linkModalOpen: true, editingLinkId: id }),
  openFolderModal: () => set({ folderModalOpen: true, editingFolderId: null }),
  openEditFolderModal: (id) =>
    set({ folderModalOpen: true, editingFolderId: id }),
  closeLinkModal: () => set({ linkModalOpen: false, editingLinkId: null }),
  closeFolderModal: () => set({ folderModalOpen: false, editingFolderId: null }),
  reset: () =>
    set({
      activeTab: "tasks",
      linkModalOpen: false,
      folderModalOpen: false,
      editingLinkId: null,
      editingFolderId: null,
      preferredColumnId: null,
    }),
}));