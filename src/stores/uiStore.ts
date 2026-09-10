import { create } from "zustand";

export type ActiveTab = "tasks" | "reports" | "launchpad";

interface UIState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  captureModalOpen: boolean;
  openCaptureModal: () => void;
  closeCaptureModal: () => void;
  linkModalOpen: boolean;
  editingLinkId: string | null;
  preferredFolderId: string | null;
  openAddLink: (preferredFolderId?: string | null) => void;
  openEditLink: (id: string) => void;
  closeLinkModal: () => void;
  folderModalOpen: boolean;
  editingFolderId: string | null;
  openAddFolder: () => void;
  openEditFolder: (id: string) => void;
  closeFolderModal: () => void;
  reportPasteModalOpen: boolean;
  openReportPasteModal: () => void;
  closeReportPasteModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "tasks",
  setActiveTab: (activeTab) => set({ activeTab }),

  captureModalOpen: false,
  openCaptureModal: () => set({ captureModalOpen: true }),
  closeCaptureModal: () => set({ captureModalOpen: false }),

  linkModalOpen: false,
  editingLinkId: null,
  preferredFolderId: null,
  openAddLink: (preferredFolderId = null) =>
    set({ linkModalOpen: true, editingLinkId: null, preferredFolderId }),
  openEditLink: (id) =>
    set({ linkModalOpen: true, editingLinkId: id }),
  closeLinkModal: () =>
    set({ linkModalOpen: false, editingLinkId: null, preferredFolderId: null }),

  folderModalOpen: false,
  editingFolderId: null,
  openAddFolder: () =>
    set({ folderModalOpen: true, editingFolderId: null }),
  openEditFolder: (id) =>
    set({ folderModalOpen: true, editingFolderId: id }),
  closeFolderModal: () =>
    set({ folderModalOpen: false, editingFolderId: null }),

  reportPasteModalOpen: false,
  openReportPasteModal: () => set({ reportPasteModalOpen: true, activeTab: "reports" }),
  closeReportPasteModal: () => set({ reportPasteModalOpen: false }),
}));