import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const defaultUiState = {
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  modalData: null,
  selectedTab: 'home',
  expandedGroups: {},
  loadingStates: {},
  theme: 'light',
  openMobileMenu: null
};

const cleanDomFlags = () => {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('no-scroll', 'modal-open');
  document.documentElement.classList.remove('high-contrast', 'large-text');
  document.documentElement.style.removeProperty('--animation-duration');
};

export const useUIStore = create(
  devtools(
    (set, get) => ({
      // Estado
      ...defaultUiState,

      // Acciones
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),

      // Manejo de modales
      openModal: (type, data = null) => set({
        modalOpen: true,
        modalType: type,
        modalData: data
      }),
      closeModal: () => set({
        modalOpen: false,
        modalType: null,
        modalData: null
      }),

      // Manejo de menú móvil de progreso
      setOpenMobileMenu: (menuId) => set({ openMobileMenu: menuId }),
      closeMobileMenu: () => set({ openMobileMenu: null }),

      // Manejo de tabs
      setSelectedTab: (tab) => set({ selectedTab: tab }),

      // Manejo de grupos expandidos
      toggleGroup: (groupId) => set(state => ({
        expandedGroups: {
          ...state.expandedGroups,
          [groupId]: !state.expandedGroups[groupId]
        }
      })),
      expandGroup: (groupId) => set(state => ({
        expandedGroups: {
          ...state.expandedGroups,
          [groupId]: true
        }
      })),
      collapseGroup: (groupId) => set(state => ({
        expandedGroups: {
          ...state.expandedGroups,
          [groupId]: false
        }
      })),
      collapseAllGroups: () => set({ expandedGroups: {} }),

      // Manejo de estados de carga
      setLoading: (key, loading) => set(state => ({
        loadingStates: {
          ...state.loadingStates,
          [key]: loading
        }
      })),
      isLoading: (key) => {
        const { loadingStates } = get();
        return loadingStates[key] || false;
      },

      // Manejo de tema
      setTheme: (theme) => {
        set({ theme });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', theme);
        }
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Persistencia del tema
      initializeTheme: () => {
        const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
        const systemTheme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        get().setTheme(theme);
      },

      // Obtener tema actual
      getCurrentTheme: () => {
        return get().theme;
      },

      // Verificar si es tema oscuro
      isDarkTheme: () => {
        return get().theme === 'dark';
      },

      // Verificar si es tema claro
      isLightTheme: () => {
        return get().theme === 'light';
      },

      // Manejo de scroll
      scrollToTop: () => {
        if (typeof window === 'undefined') return;
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },

      // Manejo de focus
      focusElement: (selector) => {
        if (typeof document === 'undefined') return;
        const element = document.querySelector(selector);
        if (element) {
          element.focus();
        }
      },

      // Manejo de responsive
      isMobile: () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768;
      },
      isTablet: () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth > 768 && window.innerWidth <= 1024;
      },
      isDesktop: () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth > 1024;
      },

      // Manejo de animaciones
      enableAnimations: () => {
        if (typeof document === 'undefined') return;
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
      },
      disableAnimations: () => {
        if (typeof document === 'undefined') return;
        document.documentElement.style.setProperty('--animation-duration', '0s');
      },

      // Manejo de accesibilidad
      setHighContrast: (enabled) => {
        if (typeof document === 'undefined') return;
        if (enabled) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      },

      setLargeText: (enabled) => {
        if (typeof document === 'undefined') return;
        if (enabled) {
          document.documentElement.classList.add('large-text');
        } else {
          document.documentElement.classList.remove('large-text');
        }
      },

      // Resetear estado
      reset: () => {
        cleanDomFlags();
        const currentTheme = get().theme || defaultUiState.theme;
        set({
          ...defaultUiState,
          theme: currentTheme
        });
      },

      resetHomeUi: () => {
        cleanDomFlags();
        const currentTheme = get().theme || defaultUiState.theme;
        set({
          ...defaultUiState,
          theme: currentTheme
        });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', currentTheme);
        }
      }
    }),
    {
      name: 'ui-store',
      enabled: import.meta.env.DEV
    }
  )
);