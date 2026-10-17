import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../services/api'; // Importamos tu cliente Axios configurado
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  // Ahora iniciamos vacíos, sin datos demo
  const currentUser = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('retail_token'));
  const isAuthenticated = ref<boolean>(!!token.value);

  const isAdmin = computed(() => currentUser.value?.role === 'admin');
  const isTrabajador = computed(() => currentUser.value?.role === 'trabajador');
  const userBranchId = computed(() => currentUser.value?.branchId);
  const userBranchName = computed(() => currentUser.value?.branchName);

  // Nueva función Login conectada al Backend Real
  async function login(email: string, password_hash: string) {
    try {
      // Hacemos el POST a la API de Node (usamos la misma clave password_hash de tu backend)
      const response = await apiClient.post('auth/login', { email, password: password_hash });

      const apiUser = response.data.user;
      const jwt = response.data.token;

      // Mapeamos lo que devuelve el backend a lo que pide tu frontend
      currentUser.value = {
        id: String(apiUser.id),
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        roleTitle: apiUser.role === 'admin' ? 'Gerencia General' : 'Cajero Operativo', // <-- Propiedad agregada
        branchId: String(apiUser.branch_id),
        branchName: apiUser.branch_id === 1 ? 'Sede Central Miraflores' : 'Sede Secundaria',
        dni: apiUser.dni,
        phone: apiUser.phone || ''
      };

      // Guardamos el token real y actualizamos estados
      isAuthenticated.value = true;
      token.value = jwt;
      localStorage.setItem('retail_token', jwt);

      return true;
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      throw new Error(error.response?.data?.error || 'Credenciales incorrectas');
    }
  }

  function logout() {
    isAuthenticated.value = false;
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem('retail_token');
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    isAdmin,
    isTrabajador,
    userBranchId,
    userBranchName,
    login,
    logout
  };
});