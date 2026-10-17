<template>
  <aside
    class="w-full md:w-64 bg-white border-r border-[#E5E1DA] flex flex-col shrink-0 h-full md:h-screen sticky top-0 transition-transform z-30 select-none overflow-hidden"
    aria-label="Barra lateral de navegación"
  >
    <!-- Brand / Encabezado del Local (Fijo en la parte superior) -->
    <div class="p-5 border-b border-[#F0EFEB] flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-[#E6ECE5] flex items-center justify-center text-[#3A5639] shadow-xs">
          <BuildingStorefrontIcon class="w-6 h-6" />
        </div>
        <div>
          <span class="block text-base font-extrabold text-[#322F29] tracking-tight leading-tight">
            Urba Market E.I.R.L
          </span>
          <span class="text-xs text-[#797368] font-medium">
            Comercio & Retail
          </span>
        </div>
      </div>

      <button
        v-if="isMobile"
        @click="emit('close-mobile')"
        class="p-2 text-[#797368] hover:text-[#322F29] md:hidden rounded-lg hover:bg-[#F2EFEB]"
        aria-label="Cerrar menú"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Zona Central con Scroll Independiente (Selector de Rol, Botón Caja y Menú) -->
    <div class="flex-1 overflow-y-auto min-h-0 space-y-2 py-2 pr-0.5">
      <!-- Selector de Rol Rápido (Admin / Trabajador) -->
      <div class="px-3.5 pt-1">
        <div class="bg-[#FAF7EE] p-2 rounded-2xl border border-[#E5E1DA]">
          <div class="flex items-center justify-between mb-1.5 px-1">
            <span class="text-[11px] font-bold text-[#797368] uppercase tracking-wider">Modo de Acceso:</span>
            <span
              class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
              :class="authStore.isAdmin ? 'bg-[#E6ECE5] text-[#395539]' : 'bg-[#FFEAD9] text-[#D04E15]'"
            >
              {{ authStore.user.roleTitle }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1 p-0.5 bg-white rounded-xl border border-[#E5E1DA]">
            <button
              type="button"
              @click="handleRoleChange('admin')"
              class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[34px]"
              :class="authStore.isAdmin ? 'bg-[#5E875D] text-white shadow-xs' : 'text-[#5D584F] hover:bg-[#FAF7EE]'"
            >
              <ShieldCheckIcon class="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              @click="handleRoleChange('trabajador')"
              class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[34px]"
              :class="authStore.isTrabajador ? 'bg-[#EA6B25] text-white shadow-xs' : 'text-[#5D584F] hover:bg-[#FAF7EE]'"
            >
              <UserIcon class="w-3.5 h-3.5" />
              <span>Cajero</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Botón de Acción Principal: Punto de Venta / Caja -->
      <div class="px-3.5">
        <router-link
          to="/ventas"
          class="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-white font-bold text-sm rounded-xl shadow-soft transition-all transform active:scale-98 min-h-[44px]"
          :class="posStore.isRegisterOpen ? 'bg-[#5E875D] hover:bg-[#4A6D49]' : 'bg-[#EA6B25] hover:bg-[#D04E15]'"
          @click="isMobile ? emit('close-mobile') : null"
        >
          <ShoppingCartIcon class="w-5 h-5" />
          <span>{{ posStore.isRegisterOpen ? 'Punto de Venta / Caja' : 'Caja Cerrada (Abrir)' }}</span>
        </router-link>
      </div>

      <!-- Lista de Navegación reactiva según Rol -->
      <nav class="px-2.5 space-y-1" aria-label="Menú principal">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[42px]"
          :class="isActive(item.path) ? 'bg-[#F4F7F4] text-[#395539] font-bold' : 'text-[#5D584F] hover:bg-[#FAF7EE] hover:text-[#322F29]'"
          @click="isMobile ? emit('close-mobile') : null"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5 shrink-0" :class="isActive(item.path) ? 'text-[#395539]' : 'text-[#797368]'" />
            <span>{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge"
            class="text-[11px] font-bold px-2 py-0.5 rounded-full"
            :class="item.badgeColor || 'bg-[#FFEAD9] text-[#D04E15]'"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>
    </div>

    <!-- Pie de la barra lateral: Fijo y siempre accesible con botón Cerrar Sesión -->
    <div class="p-3.5 border-t border-[#F0EFEB] bg-[#FAF7EE] space-y-2.5 shrink-0">
      <!-- Resumen de Caja actual -->
      <router-link
        to="/caja"
        class="block bg-white rounded-xl p-2.5 border border-[#E5E1DA] hover:border-[#5E875D] transition-colors text-xs shadow-2xs"
      >
        <div class="flex items-center justify-between text-[#797368] mb-1">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="posStore.isRegisterOpen ? 'bg-[#5E875D]' : 'bg-[#EA6B25]'"></span>
            <span class="font-bold text-[#322F29]">{{ posStore.isRegisterOpen ? 'Gaveta Activa:' : 'Caja Cerrada' }}</span>
          </span>
          <span class="font-extrabold text-[#3A5639] tabular-nums">
            S/ {{ posStore.currentDrawerCash.toFixed(2) }}
          </span>
        </div>
        <div class="text-[11px] text-[#797368] flex items-center justify-between">
          <span>{{ posStore.isRegisterOpen ? 'Arqueo de turno' : 'Abrir para vender' }}</span>
          <span class="font-bold text-[#5E875D]">→</span>
        </div>
      </router-link>

      <!-- Perfil y Botón Destacado de Cerrar Sesión -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0"
            :class="authStore.isAdmin ? 'bg-[#E6ECE5] border-[#ABC2AA] text-[#395539]' : 'bg-[#FFEAD9] border-[#FED9BE] text-[#D04E15]'"
          >
            {{ authStore.isAdmin ? 'DP' : 'MR' }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-[#322F29] truncate leading-tight">
              {{ authStore.user.name }}
            </p>
            <p class="text-[11px] text-[#797368] truncate leading-tight">
              {{ authStore.user.roleTitle }}
            </p>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="p-2 text-[#797368] hover:text-[#D04E15] hover:bg-[#FFEAD9] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-transparent hover:border-[#FED9BE]"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  UsersIcon,
  TruckIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../../stores/auth';
import { usePosStore } from '../../stores/posStore';
import { useProductStore } from '../../stores/products';
import { useClientStore } from '../../stores/clients';
import { useNotificationStore } from '../../stores/notifications';
import type { UserRole } from '../../types';

defineProps<{
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close-mobile'): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const posStore = usePosStore();
const productStore = useProductStore();
const clientStore = useClientStore();
const notificationStore = useNotificationStore();

const lowStockCount = computed(() => productStore.lowStockProducts.length);
const debtClientsCount = computed(() => clientStore.clientsWithDebt.length);

// Lista maestra de navegación con roles asociados
const allNavItems = computed(() => [
  {
    path: '/dashboard',
    label: 'Resumen Diario',
    icon: ChartBarIcon,
    roles: ['admin'] as UserRole[]
  },
  {
    path: '/caja',
    label: 'Control de Caja',
    icon: BanknotesIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: posStore.isRegisterOpen ? 'Abierta' : 'Cerrada',
    badgeColor: posStore.isRegisterOpen ? 'bg-[#E6ECE5] text-[#395539]' : 'bg-[#FFEAD9] text-[#D04E15]'
  },
  {
    path: '/ventas',
    label: 'Caja y Ventas',
    icon: ShoppingCartIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: !posStore.isRegisterOpen ? 'Bloqueada' : undefined,
    badgeColor: 'bg-[#F2EFEB] text-[#797368]'
  },
  {
    path: '/inventario',
    label: 'Inventario',
    icon: ArchiveBoxIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: lowStockCount.value > 0 ? `${lowStockCount.value}` : undefined,
    badgeColor: 'bg-[#FFEAD9] text-[#D04E15]'
  },
  {
    path: '/clientes',
    label: 'Clientes y Fiados',
    icon: UserGroupIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: debtClientsCount.value > 0 ? `${debtClientsCount.value}` : undefined,
    badgeColor: 'bg-[#FAF7EE] text-[#797368]'
  },
  {
    path: '/trabajadores',
    label: 'Personal / Turnos',
    icon: UsersIcon,
    roles: ['admin'] as UserRole[],
    badge: `${authStore.activeWorkers.length} activos`,
    badgeColor: 'bg-[#E6ECE5] text-[#395539]'
  },
  {
    path: '/proveedores',
    label: 'Proveedores',
    icon: TruckIcon,
    roles: ['admin'] as UserRole[]
  },
  {
    path: '/reportes',
    label: 'Reportes y Márgenes',
    icon: ChartPieIcon,
    roles: ['admin'] as UserRole[]
  }
]);

// Filtrado reactivo de ítems de menú según el rol activo
const visibleNavItems = computed(() => {
  return allNavItems.value.filter(item => authStore.canAccess(item.roles));
});

const isActive = (path: string) => {
  if (path === '/dashboard' && route.path === '/') return true;
  return route.path.startsWith(path);
};

const handleRoleChange = (newRole: UserRole) => {
  authStore.switchRole(newRole);
  notificationStore.success(
    `Cambiado a rol: ${authStore.user.roleTitle}`,
    newRole === 'trabajador'
      ? 'Vista operario: Acceso a Caja, Ventas, Inventario en góndola y Fiados.'
      : 'Vista admin: Acceso completo a Dashboard, Personal, Costos y Reportes.'
  );

  // Si el trabajador estaba en una ruta exclusiva de admin, redirigir a ventas o caja
  if (newRole === 'trabajador' && (route.path === '/dashboard' || route.path === '/reportes' || route.path === '/proveedores' || route.path === '/trabajadores')) {
    router.push(posStore.isRegisterOpen ? '/ventas' : '/caja');
  }
};

const handleLogout = () => {
  authStore.logout();
  notificationStore.info('Sesión cerrada', 'Hasta pronto, que tengas una excelente jornada.');
  router.push('/login');
};
</script>
