<template>
  <div
    class="bg-white rounded-2xl border border-[#E5E1DA] p-5 shadow-soft transition-all duration-200 hover:shadow-soft-md"
    :class="accentBorder ? 'border-l-4 ' + accentBorderClass : ''"
  >
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-[#797368]">
          {{ title }}
        </p>
        <p class="text-2xl sm:text-3xl font-extrabold text-[#322F29] tabular-nums tracking-tight">
          {{ value }}
        </p>
      </div>
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        :class="iconBgClass"
      >
        <slot name="icon">
          <span class="text-xl">{{ emoji || '📊' }}</span>
        </slot>
      </div>
    </div>

    <div v-if="subtext || $slots.footer" class="mt-3.5 pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs">
      <span class="text-[#5D584F] flex items-center gap-1 font-medium">
        <slot name="subtext">
          <span v-if="trend === 'up'" class="text-[#3A5639] font-bold">▲</span>
          <span v-else-if="trend === 'down'" class="text-[#D04E15] font-bold">▼</span>
          <span :class="trendClass">{{ subtext }}</span>
        </slot>
      </span>
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'salvia' | 'crema' | 'naranja' | 'calido';
    emoji?: string;
    accentBorder?: boolean;
  }>(),
  {
    trend: 'neutral',
    color: 'salvia',
    accentBorder: false
  }
);

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'salvia':
      return 'bg-[#E6ECE5] text-[#3A5639]';
    case 'naranja':
      return 'bg-[#FFEAD9] text-[#D04E15]';
    case 'crema':
      return 'bg-[#FAF7EE] text-[#BFA876]';
    case 'calido':
    default:
      return 'bg-[#F2EFEB] text-[#5D584F]';
  }
});

const accentBorderClass = computed(() => {
  switch (props.color) {
    case 'salvia':
      return 'border-l-[#5E875D]';
    case 'naranja':
      return 'border-l-[#EA6B25]';
    case 'crema':
      return 'border-l-[#D5C79E]';
    default:
      return 'border-l-[#797368]';
  }
});

const trendClass = computed(() => {
  if (props.trend === 'up') return 'text-[#3A5639] font-semibold';
  if (props.trend === 'down') return 'text-[#D04E15] font-semibold';
  return 'text-[#797368]';
});
</script>
