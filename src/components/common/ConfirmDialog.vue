<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop con desenfoque de seguridad -->
      <div
        class="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity duration-200"
        @click="cancelAction"
      />

      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div
          class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-slate-200 p-6 space-y-4"
        >
          <!-- Encabezado con Ícono y Botón Cerrar -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              <ShieldCheckIcon class="w-4 h-4 text-slate-600" />
              <span>Doble Verificación</span>
            </span>
            <button
              type="button"
              @click="cancelAction"
              class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Título y Mensaje -->
          <div class="space-y-2">
            <h3 class="text-base font-black text-slate-900 leading-snug">
              {{ titulo || '¿Está seguro de realizar esta acción?' }}
            </h3>
            <p class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150 leading-relaxed font-medium">
              {{ mensaje || '¿Está seguro de realizar esta acción?' }}
            </p>
          </div>

          <!-- Botones de Acción de Alto Contraste con Hover Definido -->
          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="cancelAction"
              class="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer text-center"
            >
              {{ cancelText || 'No, cancelar' }}
            </button>

            <button
              type="button"
              @click="confirmAction"
              class="w-full sm:w-auto px-5 py-2 rounded-lg text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer text-center"
              :class="confirmBtnClass"
            >
              <span>{{ confirmText || 'Sí, estoy seguro' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    titulo?: string;
    mensaje?: string;
    tipo?: 'primary' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    titulo: '¿Está seguro?',
    mensaje: '¿Está seguro de realizar esta acción?',
    tipo: 'primary',
    confirmText: 'Sí, estoy seguro',
    cancelText: 'No, cancelar'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const confirmBtnClass = computed(() => {
  switch (props.tipo) {
    case 'danger':
      return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 active:bg-rose-800 border border-rose-700';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 active:bg-amber-800 border border-amber-700';
    default:
      return 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-700 active:bg-black border border-slate-950';
  }
});

function confirmAction() {
  emit('confirm');
  emit('update:modelValue', false);
}

function cancelAction() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
