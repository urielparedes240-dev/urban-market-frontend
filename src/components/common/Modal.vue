<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      :aria-label="title"
      aria-modal="true"
    >
      <!-- Backdrop cálido con desenfoque suave -->
      <div
        class="fixed inset-0 bg-[#322F29]/40 backdrop-blur-xs transition-opacity"
        @click="closeOnBackdrop ? emit('update:modelValue', false) : null"
      />

      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-left shadow-soft-lg transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[#E5E1DA]"
          :class="customMaxWidth || 'sm:max-w-lg'"
        >
          <!-- Header del Modal -->
          <div class="bg-[#FAF7EE] px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-[#322F29]">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-xs text-[#797368] mt-0.5">
                {{ subtitle }}
              </p>
            </div>
            <button
              @click="emit('update:modelValue', false)"
              type="button"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-[#797368] hover:text-[#322F29] hover:bg-[#E5E1DA]/50 transition-colors"
              aria-label="Cerrar ventana"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del Modal -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- Footer opcional -->
          <div v-if="$slots.footer" class="bg-[#FAF7EE] px-6 py-3.5 border-t border-[#E5E1DA] flex flex-wrap justify-end gap-2.5">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    subtitle?: string;
    closeOnBackdrop?: boolean;
    customMaxWidth?: string;
  }>(),
  {
    closeOnBackdrop: true,
    subtitle: '',
    customMaxWidth: 'sm:max-w-lg'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>
