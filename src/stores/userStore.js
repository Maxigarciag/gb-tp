import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { userProfiles } from '../lib/supabase';

export const useUserStore = create(
  devtools(
    (set, get) => ({
      // Estado
      userProfile: null,
      loading: false,
      error: null,
      isProfileComplete: false,

      // Acciones
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Cargar perfil del usuario
      loadUserProfile: async (userId) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await userProfiles.getCurrent();
          
          if (error) {
            set({ error: 'Error al cargar perfil', loading: false });
            return;
          }

          set({ 
            userProfile: data,
            isProfileComplete: !!data,
            loading: false 
          });
        } catch (error) {
          set({ error: 'Error al cargar perfil', loading: false });
        }
      },

      // Crear perfil de usuario
      createUserProfile: async (profileData) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await userProfiles.create(profileData);
          
          if (error) {
            set({ error: 'Error al crear perfil', loading: false });
            return null;
          }

          set({ 
            userProfile: data[0],
            isProfileComplete: true,
            loading: false 
          });
          
          return data[0];
        } catch (error) {
          set({ error: 'Error al crear perfil', loading: false });
          return null;
        }
      },

      // Actualizar perfil de usuario
      updateUserProfile: async (updates) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await userProfiles.update(updates);
          
          if (error) {
            set({ error: 'Error al actualizar perfil', loading: false });
            return false;
          }

          set({ 
            userProfile: data[0],
            loading: false 
          });
          
          return true;
        } catch (error) {
          set({ error: 'Error al actualizar perfil', loading: false });
          return false;
        }
      },

      // Actualizar nombre del usuario
      updateUserName: async (nombre) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await userProfiles.updateName(nombre);
          
          if (error) {
            set({ error: 'Error al actualizar nombre', loading: false });
            return false;
          }

          set({ 
            userProfile: data[0],
            loading: false 
          });
          
          return true;
        } catch (error) {
          set({ error: 'Error al actualizar nombre', loading: false });
          return false;
        }
      },

      // Verificar si el perfil está completo
      checkProfileCompleteness: () => {
        const { userProfile } = get();
        
        if (!userProfile) {
          return false;
        }

        const requiredFields = [
          'altura', 'peso', 'edad', 'sexo', 
          'objetivo', 'experiencia', 
          'tiempo_entrenamiento', 'dias_semana'
        ];

        return requiredFields.every(field => 
          userProfile[field] !== null && 
          userProfile[field] !== undefined && 
          userProfile[field] !== ''
        );
      },

      // Obtener datos del perfil para mostrar
      getProfileDisplayData: () => {
        const { userProfile } = get();
        
        if (!userProfile) {
          return null;
        }

        return {
          // Datos básicos
          altura: userProfile.altura,
          peso: userProfile.peso,
          edad: userProfile.edad,
          sexo: userProfile.sexo,
          nombre: userProfile.nombre,
          
          // Objetivos y preferencias
          objetivo: userProfile.objetivo,
          experiencia: userProfile.experiencia,
          tiempoEntrenamiento: userProfile.tiempo_entrenamiento,
          diasSemana: userProfile.dias_semana,
          
          // Formatear para mostrar
          objetivoFormateado: formatObjective(userProfile.objetivo),
          experienciaFormateada: formatExperience(userProfile.experiencia),
          tiempoFormateado: formatTime(userProfile.tiempo_entrenamiento),
          diasFormateados: formatDays(userProfile.dias_semana)
        };
      },

      // Calcular IMC
      calculateBMI: () => {
        const { userProfile } = get();
        
        if (!userProfile || !userProfile.altura || !userProfile.peso) {
          return null;
        }

        const alturaMetros = userProfile.altura / 100;
        const bmi = userProfile.peso / (alturaMetros * alturaMetros);
        
        return {
          value: bmi.toFixed(1),
          category: getBMICategory(bmi)
        };
      },

      // Obtener recomendaciones basadas en el perfil
      getProfileRecommendations: () => {
        const { userProfile } = get();
        
        if (!userProfile) {
          return [];
        }

        const recommendations = [];

        // Recomendación basada en IMC
        const bmi = get().calculateBMI();
        if (bmi) {
          if (bmi.category === 'Sobrepeso' && userProfile.objetivo === 'ganar_musculo') {
            recommendations.push({
              type: 'warning',
              message: 'Considera perder grasa antes de ganar músculo para mejores resultados'
            });
          }
        }

        // Recomendación basada en experiencia y tiempo
        if (userProfile.experiencia === 'principiante' && userProfile.tiempo_entrenamiento === '2_horas') {
          recommendations.push({
            type: 'info',
            message: 'Como principiante, considera empezar con sesiones más cortas'
          });
        }

        // Recomendación basada en días de entrenamiento
        if (userProfile.dias_semana === '6_dias' && userProfile.experiencia === 'principiante') {
          recommendations.push({
            type: 'warning',
            message: '6 días por semana puede ser intenso para principiantes. Considera 3-4 días'
          });
        }

        return recommendations;
      },

      // Resetear estado
      reset: () => {
        set({
          userProfile: null,
          loading: false,
          error: null,
          isProfileComplete: false
        });
      }
    }),
    {
      name: 'user-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Funciones auxiliares
const formatObjective = (objetivo) => {
  const objectives = {
    'ganar_musculo': 'Ganar Músculo',
    'perder_grasa': 'Perder Grasa',
    'mantener': 'Mantener'
  };
  return objectives[objetivo] || objetivo;
};

const formatExperience = (experiencia) => {
  const experiences = {
    'principiante': 'Principiante',
    'intermedio': 'Intermedio',
    'avanzado': 'Avanzado'
  };
  return experiences[experiencia] || experiencia;
};

const formatTime = (tiempo) => {
  const times = {
    '30_min': '30 minutos',
    '1_hora': '1 hora',
    '2_horas': '2 horas'
  };
  return times[tiempo] || tiempo;
};

const formatDays = (dias) => {
  if (!dias) return '';
  const numDays = dias.split('_')[0];
  return `${numDays} días por semana`;
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}; 