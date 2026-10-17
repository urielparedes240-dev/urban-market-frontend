<template>
  <header
    class="bg-white border-b border-[#E5E1DA] h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs"
    role="banner"
  >
    <!-- Zona 1: Menú móvil + Saludo del día -->
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggle-mobile-menu')"
        class="md:hidden p-2.5 rounded-xl text-[#797368] hover:text-[#322F29] hover:bg-[#FAF7EE] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
        aria-label="Abrir menú de navegación"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>

      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-[#322F29] tracking-tight flex items-center gap-2">
          <span>{{ pageTitle }}</span>
          <span class="hidden sm:inline text-xs font-normal text-[#797368]">·</span>
          <span class="hidden sm:inline text-xs font-medium text-[#5D584F]">
            {{ currentDateFormatted }}
          </span>
        </h1>
        <div class="flex items-center gap-2 text-[11px] text-[#797368] hidden md:flex">
          <span>{{ authStore.currentShift }}</span>
          <span>·</span>
          <span
            class="font-bold px-1.5 py-0.2 rounded"
            :class="authStore.isAdmin ? 'bg-[#E6ECE5] text-[#395539]' : 'bg-[#FFEAD9] text-[#D04E15]'"
          >
            {{ authStore.user.roleTitle }}
          </span>
        </div>
      </div>
    </div>

    <!-- Zona 2: Acciones rápidas (Cambio de rol rápido + Venta Rápida) -->
    <div class="flex items-center gap-2 sm:gap-2.5">
      <!-- Botón Switch Rápido de Rol en Header -->
      <button
        type="button"
        @click="toggleRole"
        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all min-h-[36px]"
        :class="authStore.isAdmin ? 'bg-[#F4F7F4] border-[#ABC2AA] text-[#395539] hover:bg-[#E6ECE5]' : 'bg-[#FFF7F2] border-[#FED9BE] text-[#D04E15] hover:bg-[#FFEAD9]'"
        title="Cambiar entre Dueño (Admin) y Cajero (Trabajador) para probar permisos"
      >
        <component :is="authStore.isAdmin ? ShieldCheckIcon : UserIcon" class="w-4 h-4" />
        <span>Rol: {{ authStore.isAdmin ? 'Admin' : 'Trabajador' }}</span>
        <span class="text-[10px] opacity-60">⇄</span>
      </button>

      <!-- Indicador de estado de caja (Abierta / Cerrada) -->
      <router-link
        to="/caja"
        class="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
        :class="posStore.isRegisterOpen ? 'text-[#395539] bg-[#F4F7F4] border-[#D0DDD0] hover:bg-[#E6ECE5]' : 'text-[#D04E15] bg-[#FFF7F2] border-[#FED9BE] hover:bg-[#FFEAD9]'"
        title="Ver estado de caja y turnos"
      >
        <span class="w-2 h-2 rounded-full" :class="posStore.isRegisterOpen ? 'bg-[#5E875D] animate-pulse' : 'bg-[#EA6B25]'"></span>
        <span>{{ posStore.isRegisterOpen ? 'Caja Abierta' : 'Caja Cerrada' }}</span>
        <span v-if="posStore.isRegisterOpen" class="text-[11px] text-[#5D584F] font-mono tabular-nums">(S/ {{ posStore.currentDrawerCash.toFixed(2) }})</span>
      </router-link>

      <!-- Acceso directo a Venta Rápida -->
      <router-link
        v-if="$route.path !== '/ventas'"
        :to="posStore.isRegisterOpen ? '/ventas' : '/caja'"
        class="inline-flex items-center gap-2 px-3.5 py-2 text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft transition-all min-h-[40px]"
        :class="posStore.isRegisterOpen ? 'bg-[#5E875D] hover:bg-[#4A6D49]' : 'bg-[#EA6B25] hover:bg-[#D04E15]'"
        :aria-label="posStore.isRegisterOpen ? 'Ir a caja para cobrar' : 'Abrir caja para vender'"
      >
        <ShoppingCartIcon class="w-4 h-4" />
        <span class="hidden sm:inline">{{ posStore.isRegisterOpen ? 'Nueva Venta' : 'Abrir Turno' }}</span>
        <span class="sm:hidden">{{ posStore.isRegisterOpen ? 'Caja' : 'Abrir' }}</span>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Bars3Icon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../../stores/auth';
import { usePosStore } from '../../stores/posStore';
import { useNotificationStore } from '../../stores/notifications';

const emit = defineEmits<{
  (e: 'toggle-mobile-menu'): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const posStore = usePosStore();
const notificationStore = useNotificationStore();

const toggleRole = () => {
  const nextRole = authStore.isAdmin ? 'trabajador' : 'admin';
  authStore.switchRole(nextRole);
  notificationStore.success(
    `Cambiado a ${authStore.user.roleTitle}`,
    nextRole === 'trabajador'
      ? 'Modo operario: Ventas activas, inventario con ajuste rápido y acceso a fiados.'
      : 'Modo administrador: Acceso completo a métricas, costos, compras y proveedores.'
  );

  if (nextRole === 'trabajador' && (route.path === '/dashboard' || route.path === '/reportes' || route.path === '/proveedores')) {
    router.push('/ventas');
  }
};

const pageTitle = computed(() => {
  switch (route.path) {
    case '/dashboard':
    case '/':
      return 'Resumen del Día';
    case '/caja':
      return 'Control de Caja y Turnos';
    case '/inventario':
      return 'Control de Inventario';
    case '/ventas':
      return 'Punto de Venta y Caja';
    case '/clientes':
      return 'Clientes y Libreta de Fiados';
    case '/trabajadores':
      return 'Gestión de Trabajadores';
    case '/proveedores':
      return 'Directorio de Proveedores';
    case '/reportes':
      return 'Reportes y Métricas';
    default:
      return 'Comercio & Retail Urba Market E.I.R.L';
  }
});

const currentDateFormatted = computed(() => {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
});
</script>
