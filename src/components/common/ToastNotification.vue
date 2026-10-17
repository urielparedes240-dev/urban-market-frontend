<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto w-full bg-white rounded-lg border shadow-lg p-3.5 flex items-start gap-3 relative overflow-hidden"
        :class="{
          'border-emerald-200 bg-emerald-50/30 text-emerald-950': toast.type === 'success',
          'border-amber-200 bg-amber-50/30 text-amber-950': toast.type === 'warning',
          'border-rose-200 bg-rose-50/30 text-rose-950': toast.type === 'error',
          'border-blue-200 bg-blue-50/30 text-blue-950': toast.type === 'info',
        }"
      >
        <!-- Icono según tipo -->
        <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <ExclamationTriangleIcon v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <XCircleIcon v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <InformationCircleIcon v-else class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-semibold leading-tight">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-xs text-slate-600 mt-0.5 leading-snug">{{ toast.message }}</p>
        </div>

        <button
          @click="toastStore.remove(toast.id)"
          class="text-slate-400 hover:text-slate-600 p-0.5 rounded transition shrink-0"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '../../stores/toastStore';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const toastStore = useToastStore();
</script>
