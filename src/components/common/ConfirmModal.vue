<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="confirmId"
    >
      <!-- Backdrop con desenfoque de seguridad -->
      <div
        class="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity"
        @click="cancelAction"
      />

      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div
          class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border-2 border-slate-300 p-6 space-y-5"
        >
          <!-- Badge Superior de Doble Verificación -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider" :class="badgeClass">
              <ShieldExclamationIcon class="w-4 h-4" />
              <span>Doble Verificación de Seguridad</span>
            </span>
            <button
              type="button"
              @click="cancelAction"
              class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Ícono de Seguridad y Título Central -->
          <div class="flex items-start gap-3.5">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              :class="iconBgClass"
            >
              <ExclamationTriangleIcon v-if="type === 'warning'" class="w-7 h-7 text-amber-600" />
              <ShieldExclamationIcon v-else-if="type === 'danger'" class="w-7 h-7 text-rose-600" />
              <ShieldCheckIcon v-else class="w-7 h-7 text-emerald-600" />
            </div>

            <div class="flex-1">
              <h3 :id="confirmId" class="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {{ title || '¿Está seguro de confirmar esta acción?' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ subtitle || 'Esta confirmación previene errores o pérdidas accidentales de información' }}
              </p>
            </div>
          </div>

          <!-- Mensaje principal -->
          <div class="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
            <slot>
              <p>{{ message }}</p>
            </slot>
          </div>

          <!-- Caja de detalles auditables -->
          <div
            v-if="details && Object.keys(details).length > 0"
            class="p-3.5 bg-slate-100/80 rounded-xl border border-slate-300 text-xs space-y-1.5 font-medium text-slate-800"
          >
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Detalles de la operación a ejecutar:
            </div>
            <div v-for="(val, key) in details" :key="key" class="flex justify-between items-center py-0.5 border-b border-slate-200 last:border-0">
              <span class="text-slate-600 font-semibold">{{ key }}:</span>
              <strong class="tabular-nums text-slate-900 font-bold text-right ml-2">{{ val }}</strong>
            </div>
          </div>

          <!-- Botones de Acción de Alto Contraste con Hover Definido -->
          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              @click="cancelAction"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-slate-900 min-h-[44px] transition-all shadow-xs active:scale-95 cursor-pointer text-center"
            >
              {{ cancelText || 'No, cancelar y revisar' }}
            </button>

            <button
              type="button"
              @click="confirmAction"
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md min-h-[44px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-center ring-2 ring-transparent"
              :class="confirmBtnClass"
            >
              <span>✓</span>
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
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    message?: string;
    details?: Record<string, string | number>;
    type?: 'primary' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    title: '¿Está seguro de realizar esta acción?',
    subtitle: 'Verificación de seguridad para evitar errores involuntarios',
    message: 'Por favor confirma que los datos son correctos antes de continuar con la operación.',
    type: 'primary',
    confirmText: 'Sí, estoy seguro',
    cancelText: 'No, cancelar'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
}>();

const confirmId = 'confirm-modal-' + Math.random().toString(36).substring(2, 9);

const badgeClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-rose-100 text-rose-800 border border-rose-300';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border border-amber-300';
    default:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
  }
});

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-rose-50 border-rose-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    default:
      return 'bg-emerald-50 border-emerald-200';
  }
});

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-700 shadow-rose-600/30 hover:ring-rose-400';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-700 shadow-amber-600/30 hover:ring-amber-400';
    default:
      return 'bg-retail-600 hover:bg-retail-700 active:bg-retail-800 border border-retail-700 shadow-retail-600/30 hover:ring-retail-400';
  }
});

function confirmAction() {
  emit('confirm');
  emit('update:modelValue', false);
}

function cancelAction() {
  emit('cancel');
  emit('close');
  emit('update:modelValue', false);
}
</script>
