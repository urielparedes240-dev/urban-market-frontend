<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Fondo decorativo sutil -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-md w-full bg-slate-850 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
      <!-- Logo y Título Corporativo -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
          UM
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight">Urba Market E.I.R.L</h1>
        <p class="text-xs text-slate-400">
          ERP Distribuidora & Multi-Sede POS Retail
        </p>
      </div>

      <!-- Conmutador Rápido de Perfiles (Demo & Testing) -->
      <div class="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Acceso Rápido por Rol (Simulación):
        </span>
        <div class="grid grid-cols-1 gap-2.5 text-xs">
          <button
            type="button"
            @click="selectDemoUser(DEMO_RETAIL_USERS[1])"
            class="flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all cursor-pointer shadow-xs"
            :class="selectedUser.id === DEMO_RETAIL_USERS[1].id ? 'bg-retail-950/80 border-retail-500 text-white ring-2 ring-retail-500/40' : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800 hover:text-white'"
          >
            <div>
              <span class="font-extrabold block text-white text-xs">{{ DEMO_RETAIL_USERS[1].name }}</span>
              <span class="text-[10px] text-emerald-400 font-mono">DNI: {{ DEMO_RETAIL_USERS[1].dni }}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">Sede Miraflores • Requiere Apertura de Turno</span>
            </div>
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black bg-retail-600 text-white shadow-xs">Trabajador</span>
          </button>

          <button
            type="button"
            @click="selectDemoUser(DEMO_RETAIL_USERS[0])"
            class="flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all cursor-pointer shadow-xs"
            :class="selectedUser.id === DEMO_RETAIL_USERS[0].id ? 'bg-blue-950/80 border-blue-500 text-white ring-2 ring-blue-500/40' : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800 hover:text-white'"
          >
            <div>
              <span class="font-extrabold block text-white text-xs">{{ DEMO_RETAIL_USERS[0].name }}</span>
              <span class="text-[10px] text-blue-400 font-mono">DNI: {{ DEMO_RETAIL_USERS[0].dni }}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">Gerencia General • Auditoría Global Multisede</span>
            </div>
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black bg-blue-600 text-white shadow-xs">Admin</span>
          </button>
        </div>
      </div>

      <!-- Formulario de Acceso -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Correo Corporativo</label>
          <input
            type="email"
            v-model="email"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-xs focus:ring-2 focus:ring-retail-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Contraseña de Acceso</label>
          <input
            type="password"
            v-model="password"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-xs focus:ring-2 focus:ring-retail-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-retail-600 hover:bg-retail-700 text-white font-bold py-3 rounded-xl shadow-lg transition text-sm cursor-pointer"
        >
          Ingresar al Sistema
        </button>
      </form>

      <div class="text-center text-[11px] text-slate-500">
        RUC: 20601234567 • Versión 2.4.0 Retail Cloud
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, DEMO_RETAIL_USERS } from '../stores/authStore';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import type { User } from '../types';

const router = useRouter();
const authStore = useAuthStore();
const posStore = usePosStore();
const toastStore = useToastStore();

const selectedUser = ref<User>({ ...DEMO_RETAIL_USERS[1] });
const email = ref<string>(selectedUser.value.email);
const password = ref<string>('••••••••');

function selectDemoUser(user: User) {
  selectedUser.value = { ...user };
  email.value = user.email;
}

function handleLogin() {
  authStore.login(selectedUser.value);
  toastStore.success('Sesión Iniciada', `Bienvenido(a) ${selectedUser.value.name} (${selectedUser.value.roleTitle})`);

  if (selectedUser.value.role === 'admin') {
    router.push('/dashboard');
  } else {
    // Si la caja ya está abierta va a POS, sino a Apertura
    if (posStore.isShiftOpen) {
      router.push('/pos');
    } else {
      router.push('/caja/apertura');
    }
  }
}
</script>
