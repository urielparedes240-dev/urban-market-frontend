<template>
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E5E1DA] shadow-soft-lg px-2 py-1 flex items-center justify-around select-none"
    aria-label="Navegación inferior móvil"
  >
    <router-link
      v-for="item in visibleMobileItems"
      :key="item.path"
      :to="item.path"
      class="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-h-[48px] min-w-[50px] relative"
      :class="isActive(item.path) ? 'text-[#395539] font-black' : 'text-[#797368] hover:text-[#322F29]'"
    >
      <component
        :is="item.icon"
        class="w-5 h-5 transition-transform"
        :class="isActive(item.path) ? 'scale-110 text-[#5E875D]' : ''"
      />
      <span class="mt-0.5 leading-none truncate max-w-[62px]">{{ item.label }}</span>

      <!-- Badge de notificación si aplica -->
      <span
        v-if="item.badge"
        class="absolute top-1 right-2 w-2 h-2 rounded-full"
        :class="item.badgeColor || 'bg-[#EA6B25]'"
        aria-hidden="true"
      />
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  ChartBarIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../../stores/auth';
import { usePosStore } from '../../stores/posStore';
import { useProductStore } from '../../stores/products';
import { useClientStore } from '../../stores/clients';
import type { UserRole } from '../../types';

const route = useRoute();
const authStore = useAuthStore();
const posStore = usePosStore();
const productStore = useProductStore();
const clientStore = useClientStore();

const mobileItems = computed(() => [
  {
    path: '/dashboard',
    label: 'Resumen',
    icon: ChartBarIcon,
    roles: ['admin'] as UserRole[]
  },
  {
    path: '/caja',
    label: 'Turno',
    icon: BanknotesIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: !posStore.isRegisterOpen,
    badgeColor: 'bg-[#D04E15]'
  },
  {
    path: '/ventas',
    label: 'Vender',
    icon: ShoppingCartIcon,
    roles: ['admin', 'trabajador'] as UserRole[]
  },
  {
    path: '/inventario',
    label: 'Stock',
    icon: ArchiveBoxIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: productStore.lowStockProducts.length > 0,
    badgeColor: 'bg-[#EA6B25]'
  },
  {
    path: '/clientes',
    label: 'Fiados',
    icon: UserGroupIcon,
    roles: ['admin', 'trabajador'] as UserRole[],
    badge: clientStore.clientsWithDebt.length > 0,
    badgeColor: 'bg-[#BFA876]'
  }
]);

const visibleMobileItems = computed(() => {
  return mobileItems.value.filter(item => authStore.canAccess(item.roles));
});

const isActive = (path: string) => {
  if (path === '/dashboard' && route.path === '/') return true;
  return route.path.startsWith(path);
};
</script>
