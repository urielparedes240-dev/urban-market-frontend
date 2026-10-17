<template>
  <div class="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
    <!-- BARRA SUPERIOR CORPORATIVA -->
    <header class="h-14 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
      <div class="flex items-center gap-3">
        <!-- Botón Toggle Sidebar -->
        <button
          @click="isSidebarCollapsed = !isSidebarCollapsed"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          title="Colapsar / Expandir Menú"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Brand Urba Market E.I.R.L -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            UM
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm text-white tracking-wide">Urba Market E.I.R.L</span>
              <span class="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
                ERP RETAIL
              </span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>RUC: 20601234567</span>
              <span>•</span>
              <span class="text-emerald-400">Distribuidora & Retail</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sede, Switcher de Roles y Perfil -->
      <div class="flex items-center gap-3">
        <!-- Indicador de Sede -->
        <div class="hidden md:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
          <BuildingStorefrontIcon class="w-4 h-4 text-emerald-400 shrink-0" />
          <span class="text-slate-400 text-[11px]">Sede Asignada:</span>
          <span class="font-bold text-white text-xs">{{ authStore.userBranchName }}</span>
        </div>

        <!-- CONMUTADOR RÁPIDO DE ROLES (DEMO EN VIVO) -->
        <div class="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700 transition">
          <ShieldCheckIcon class="w-4 h-4 text-amber-400 shrink-0" />
          <span class="text-[11px] text-slate-300 hidden sm:inline">Rol:</span>
          <select
            :value="authStore.currentUser?.role"
            @change="handleRoleSwitch(($event.target as HTMLSelectElement).value as any)"
            class="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="trabajador" class="bg-slate-900 text-white font-semibold">Trabajador</option>
            <option value="admin" class="bg-slate-900 text-white font-semibold">Administrador (Gerencia)</option>
          </select>
        </div>

        <!-- Estado de Caja en Vivo para Trabajador -->
        <div v-if="authStore.isTrabajador" class="block">
          <span
            class="px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5"
            :class="posStore.isShiftOpen ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600' : 'bg-rose-950/90 text-rose-300 border-rose-600'"
          >
            <span class="w-2 h-2 rounded-full" :class="posStore.isShiftOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            {{ posStore.isShiftOpen ? 'Caja Abierta' : 'Caja Cerrada' }}
          </span>
        </div>

        <!-- Usuario: Solo Nombre y DNI (SIN FOTO DE TRABAJADOR) y Logout -->
        <div class="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div class="text-left text-xs leading-tight">
            <p class="font-extrabold text-white text-xs truncate max-w-[140px]">{{ authStore.currentUser?.name }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                DNI: {{ authStore.currentUser?.dni }}
              </span>
              <span class="text-[10px] text-slate-300 font-semibold hidden md:inline">
                {{ authStore.currentUser?.roleTitle }}
              </span>
            </div>
          </div>

          <button
            @click="handleLogout"
            class="p-2 text-slate-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- CUERPO CON SIDEBAR DINÁMICO SEGÚN ROL -->
    <div class="flex-1 flex overflow-hidden">
      <!-- SIDEBAR LATERAL DINÁMICO -->
      <aside
        class="bg-white border-r border-slate-200 transition-all duration-200 flex flex-col justify-between shrink-0 shadow-xs z-20"
        :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
      >
        <div class="p-3 space-y-4">
          <!-- Banner de Perfil en Sidebar -->
          <div 
            v-if="!isSidebarCollapsed" 
            class="p-3 rounded-xl border font-bold"
            :class="authStore.isAdmin ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider">
                {{ authStore.isAdmin ? 'Panel de Control Admin' : 'Terminal de Tienda' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-600 mt-0.5 font-medium">
              {{ authStore.isAdmin ? 'Supervisión de todas las sedes' : `Sede: ${authStore.userBranchName}` }}
            </p>
          </div>

          <!-- PANEL DE USUARIO COMPRIMIDO EN MENÚ (VISIBLE SOLO EN MÓVIL) -->
          <div 
            v-if="!isSidebarCollapsed" 
            class="md:hidden p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-md"
          >
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Perfil de Usuario
              </span>
              <span class="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                DNI: {{ authStore.currentUser?.dni }}
              </span>
            </div>

            <div class="space-y-1">
              <p class="font-bold text-sm text-white truncate">{{ authStore.currentUser?.name }}</p>
              <p class="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Sede: {{ authStore.userBranchName }}
              </p>
            </div>

            <!-- Conmutador de Roles en Móvil -->
            <div class="space-y-1">
              <span class="text-[9px] text-slate-400 block font-bold uppercase">Cambiar Perfil:</span>
              <div class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded-lg border border-slate-700 transition">
                <ShieldCheckIcon class="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  :value="authStore.currentUser?.role"
                  @change="handleRoleSwitch(($event.target as HTMLSelectElement).value as any)"
                  class="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1 w-full"
                >
                  <option value="trabajador" class="bg-slate-900 text-white font-semibold">Trabajador</option>
                  <option value="admin" class="bg-slate-900 text-white font-semibold">Administrador (Gerencia)</option>
                </select>
              </div>
            </div>

            <!-- Botón de Cerrar Sesión en Móvil -->
            <button
              @click="handleLogout"
              class="w-full mt-1.5 flex items-center justify-center gap-2 p-2 rounded-lg bg-rose-650 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs transition duration-150 shadow-xs cursor-pointer"
            >
              <ArrowRightOnRectangleIcon class="w-4 h-4 text-white" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <!-- NAVEGACIÓN DINÁMICA: RUTA SEGÚN ROL -->
          <nav class="space-y-1">
            <!-- CASO A: MENÚ EXCLUSIVO PARA TRABAJADOR -->
            <template v-if="authStore.isTrabajador">
              <div v-if="!isSidebarCollapsed" class="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Operaciones del Trabajador
              </div>

              <!-- 1. Apertura / Cierre de Caja -->
              <router-link
                to="/caja/apertura"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/caja/apertura') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Apertura / Cierre de Caja' : ''"
              >
                <BanknotesIcon class="w-5 h-5 shrink-0" :class="isActive('/caja/apertura') ? 'text-white' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Apertura / Cierre de Caja</span>
                <span 
                  v-if="!isSidebarCollapsed && !posStore.isShiftOpen" 
                  class="ml-auto w-2 h-2 rounded-full bg-rose-500" 
                  title="Caja cerrada"
                ></span>
              </router-link>

              <!-- 2. Punto de Venta (POS) -->
              <router-link
                to="/pos"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border relative"
                :class="[
                  isActive('/pos') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900',
                  !posStore.isShiftOpen ? 'opacity-85' : ''
                ]"
                :title="isSidebarCollapsed ? 'Punto de Venta (POS)' : ''"
              >
                <ShoppingCartIcon class="w-5 h-5 shrink-0" :class="isActive('/pos') ? 'text-white' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Punto de Venta (POS)</span>
                
                <span 
                  v-if="!isSidebarCollapsed && !posStore.isShiftOpen"
                  class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1"
                >
                  <LockClosedIcon class="w-3 h-3" /> Bloqueado
                </span>
                <span 
                  v-else-if="!isSidebarCollapsed && posStore.isShiftOpen"
                  class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300"
                >
                  Activo
                </span>
              </router-link>

              <!-- 3. Inventario Local de Consulta Rápida -->
              <div v-if="!isSidebarCollapsed" class="px-2 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Consultas
              </div>

              <router-link
                to="/inventario"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/inventario') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Catálogo & Precios' : ''"
              >
                <TagIcon class="w-5 h-5 shrink-0" :class="isActive('/inventario') ? 'text-white' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Precios y Stock de Sede</span>
              </router-link>
            </template>

            <!-- CASO B: MENÚ EXCLUSIVO PARA ADMINISTRADOR (GERENCIA GENERAL) -->
            <template v-else>
              <div v-if="!isSidebarCollapsed" class="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Módulos de Gestión Admin
              </div>

              <!-- 1. Dashboard Global -->
              <router-link
                to="/dashboard"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/dashboard') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Dashboard Global' : ''"
              >
                <ChartBarIcon class="w-5 h-5 shrink-0" :class="isActive('/dashboard') ? 'text-slate-400' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Dashboard Global</span>
              </router-link>

              <!-- 2. Inventario Multi-Sede -->
              <router-link
                to="/inventario"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/inventario') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Inventario Multi-Sede' : ''"
              >
                <ArchiveBoxIcon class="w-5 h-5 shrink-0" :class="isActive('/inventario') ? 'text-slate-400' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Inventario Multi-Sede</span>
              </router-link>

              <!-- 3. RRHH y Planillas -->
              <router-link
                to="/rrhh"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/rrhh') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'RRHH y Planillas' : ''"
              >
                <UserGroupIcon class="w-5 h-5 shrink-0" :class="isActive('/rrhh') ? 'text-slate-400' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">RRHH y Planillas</span>
              </router-link>

              <!-- 4. Contabilidad y SUNAT -->
              <router-link
                to="/contabilidad"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/contabilidad') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Contabilidad y SUNAT' : ''"
              >
                <DocumentTextIcon class="w-5 h-5 shrink-0" :class="isActive('/contabilidad') ? 'text-slate-400' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Contabilidad y SUNAT</span>
              </router-link>

              <!-- 5. Auditoría de Cajas de Tienda -->
              <router-link
                to="/caja/apertura"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="isActive('/caja/apertura') ? 'bg-slate-900 border-slate-950 text-white shadow-sm' : 'text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900'"
                :title="isSidebarCollapsed ? 'Auditoría de Cajas' : ''"
              >
                <ClipboardDocumentCheckIcon class="w-5 h-5 shrink-0" :class="isActive('/caja/apertura') ? 'text-slate-400' : 'text-slate-500'" />
                <span v-if="!isSidebarCollapsed" class="truncate">Auditoría de Cajas</span>
              </router-link>
            </template>
          </nav>
        </div>

        <!-- Footer del Sidebar -->
        <div class="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
          <div v-if="!isSidebarCollapsed" class="text-[11px] text-slate-500 space-y-1">
            <div class="flex items-center justify-between">
              <span>Terminal:</span>
              <span class="font-mono font-bold text-slate-700">POS-01</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Servidor:</span>
              <span class="text-emerald-600 font-bold">Online</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- CONTENEDOR DE VISTAS PRINCIPALES -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import type { UserRole } from '../types';
import {
  Bars3Icon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  LockClosedIcon,
  TagIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const posStore = usePosStore();
const toastStore = useToastStore();

const isSidebarCollapsed = ref<boolean>(false);

function isActive(path: string): boolean {
  return route.path.startsWith(path);
}

function handleRoleSwitch(newRole: UserRole) {
  authStore.switchRole(newRole);
  toastStore.info(
    'Cambio de Perfil',
    `Ahora operando como ${authStore.currentUser?.name} (${authStore.currentUser?.roleTitle})`
  );

  if (newRole === 'admin') {
    router.push('/dashboard');
  } else {
    // Si la caja está abierta va a POS, sino a Apertura
    if (posStore.isShiftOpen) {
      router.push('/pos');
    } else {
      router.push('/caja/apertura');
    }
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
