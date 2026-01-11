import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  closeMobileMenu: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  searchOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
}));
