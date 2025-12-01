import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUIStore = create(
  devtools(
    (set, get) => ({
      // Estado
      sidebarOpen: false,
      modalOpen: false,
      modalType: null,
      modalData: null,
      selectedTab: 'home',
      expandedGroups: {},
      loadingStates: {},
      notifications: [],
      theme: 'light',
      openMobileMenu: null, // ID del menú móvil abierto (null si ninguno)

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

      // Manejo de notificaciones
      addNotification: (notification) => {
        // Generar ID único combinando timestamp con número aleatorio
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = {
          id,
          timestamp: new Date(),
          ...notification
        };

        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remover solo si no es persistente
        const autoRemove = !newNotification.persistent;
        const delay = typeof newNotification.duration === 'number' ? newNotification.duration : 5000;
        if (autoRemove) {
          setTimeout(() => {
            get().removeNotification(id);
          }, delay);
        }

        return id;
      },
      removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Notificaciones de éxito
      showSuccess: (message, title = 'Éxito') => {
        return get().addNotification({
          type: 'success',
          title,
          message
        });
      },

      // Notificaciones de error
      showError: (message, title = 'Error') => {
        return get().addNotification({
          type: 'error',
          title,
          message
        });
      },

      // Notificaciones de información
      showInfo: (message, title = 'Información') => {
        return get().addNotification({
          type: 'info',
          title,
          message
        });
      },

      // Notificaciones de advertencia
      showWarning: (message, title = 'Advertencia') => {
        return get().addNotification({
          type: 'warning',
          title,
          message
        });
      },

      // Manejo de tema
      setTheme: (theme) => {
        set({ theme });
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Persistencia del tema
      initializeTheme: () => {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },

      // Manejo de focus
      focusElement: (selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.focus();
        }
      },

      // Manejo de responsive
      isMobile: () => {
        return window.innerWidth <= 768;
      },
      isTablet: () => {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
      },
      isDesktop: () => {
        return window.innerWidth > 1024;
      },

      // Manejo de animaciones
      enableAnimations: () => {
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
      },
      disableAnimations: () => {
        document.documentElement.style.setProperty('--animation-duration', '0s');
      },

      // Manejo de accesibilidad
      setHighContrast: (enabled) => {
        if (enabled) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      },

      setLargeText: (enabled) => {
        if (enabled) {
          document.documentElement.classList.add('large-text');
        } else {
          document.documentElement.classList.remove('large-text');
        }
      },

      // Resetear estado
      reset: () => {
        set({
          sidebarOpen: false,
          modalOpen: false,
          modalType: null,
          modalData: null,
          selectedTab: 'home',
          expandedGroups: {},
          loadingStates: {},
          notifications: [],
          openMobileMenu: null
        });
      }
    }),
    {
      name: 'ui-store',
      enabled: import.meta.env.DEV
    }
  )
); 