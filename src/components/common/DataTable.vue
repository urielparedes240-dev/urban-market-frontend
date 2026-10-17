<template>
  <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <!-- Header / Toolbar -->
    <div 
      v-if="title || subtitle || searchable || $slots.toolbar" 
      class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50"
    >
      <div>
        <h3 v-if="title" class="text-base font-semibold text-slate-900 tracking-tight">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Buscador integrado -->
        <div v-if="searchable" class="relative min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 text-slate-800 transition"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            title="Limpiar búsqueda"
          >
            ×
          </button>
        </div>

        <!-- Slot de acciones del Toolbar -->
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Table Container con scroll horizontal responsivo -->
    <div class="overflow-x-auto relative flex-1 min-h-[160px]">
      <!-- Loading Overlay -->
      <div 
        v-if="loading" 
        class="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-10"
      >
        <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-md border border-slate-200 text-xs font-medium text-slate-700">
          <svg class="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando registros...
        </div>
      </div>

      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            <th 
              v-for="col in columns" 
              :key="col.key"
              :style="{ width: col.width }"
              :class="[
                'py-3 px-3.5 select-none transition-colors',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.sortable ? 'cursor-pointer hover:bg-slate-200/70' : ''
              ]"
              @click="col.sortable && handleSort(col.key)"
            >
              <div 
                class="inline-flex items-center gap-1.5"
                :class="{
                  'justify-end': col.align === 'right',
                  'justify-center': col.align === 'center',
                  'justify-start': !col.align || col.align === 'left'
                }"
              >
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="text-slate-400">
                  <span v-if="sortKey === col.key && sortOrder === 'asc'" class="text-blue-600 font-bold">▲</span>
                  <span v-else-if="sortKey === col.key && sortOrder === 'desc'" class="text-blue-600 font-bold">▼</span>
                  <span v-else class="opacity-40">⇅</span>
                </span>
              </div>
            </th>
            <!-- Columna de acciones opcional -->
            <th v-if="$slots.actions" class="py-3 px-3.5 text-right w-24">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="(row, index) in paginatedData" 
            :key="getRowKey(row, index)"
            class="hover:bg-slate-50/80 transition-colors group"
          >
            <td 
              v-for="col in columns" 
              :key="col.key"
              :class="[
                'py-3 px-3.5 text-slate-700 font-normal',
                col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'
              ]"
            >
              <!-- Slot dinámico de celda específica: #cell-nombreColumna -->
              <slot 
                :name="`cell-${col.key}`" 
                :row="row" 
                :value="getNestedValue(row, col.key)"
                :index="index"
              >
                {{ formatCellValue(row, col) }}
              </slot>
            </td>

            <!-- Slot de Acciones -->
            <td v-if="$slots.actions" class="py-3 px-3.5 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <slot name="actions" :row="row" :index="index" />
              </div>
            </td>
          </tr>

          <!-- Estado Vacío -->
          <tr v-if="paginatedData.length === 0 && !loading">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="py-12 text-center text-slate-400">
              <slot name="empty">
                <div class="flex flex-col items-center justify-center gap-2">
                  <InboxIcon class="w-8 h-8 text-slate-300" />
                  <p class="text-sm font-medium text-slate-500">{{ emptyText }}</p>
                  <p v-if="searchQuery" class="text-xs text-slate-400">Prueba ajustando los términos de búsqueda</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación y Resumen -->
    <div 
      v-if="pagination && totalFilteredRows > 0" 
      class="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600"
    >
      <div class="flex items-center gap-2">
        <span>Mostrando {{ startRecord }} a {{ endRecord }} de {{ totalFilteredRows }} registros</span>
        <span v-if="searchQuery" class="text-blue-600 font-medium">(filtrado de {{ data.length }})</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Selector de tamaño de página -->
        <div class="flex items-center gap-1.5">
          <label class="text-slate-500">Filas:</label>
          <select 
            v-model="internalPageSize"
            class="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Controles de navegación -->
        <div class="flex items-center gap-1">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="px-2 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="Primera página"
          >
            «
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-2 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="Anterior"
          >
            ‹
          </button>
          
          <span class="px-2 py-1 font-medium text-slate-800">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="px-2 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="Siguiente"
          >
            ›
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage >= totalPages"
            class="px-2 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="Última página"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MagnifyingGlassIcon, InboxIcon } from '@heroicons/vue/24/outline';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  format?: (value: any, row: T) => string;
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    data: any[];
    title?: string;
    subtitle?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    loading?: boolean;
    emptyText?: string;
    rowKey?: string;
  }>(),
  {
    searchable: true,
    searchPlaceholder: 'Buscar en tabla...',
    pagination: true,
    pageSize: 10,
    pageSizeOptions: () => [5, 10, 25, 50],
    loading: false,
    emptyText: 'No se encontraron registros',
    rowKey: 'id'
  }
);

const searchQuery = ref('');
const currentPage = ref(1);
const internalPageSize = ref(props.pageSize);
const sortKey = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Reiniciar a la página 1 cuando cambia la búsqueda
watch([searchQuery, internalPageSize], () => {
  currentPage.value = 1;
});

function getRowKey(row: any, index: number) {
  return row[props.rowKey] || index;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function formatCellValue(row: any, col: DataTableColumn): string {
  const value = getNestedValue(row, col.key);
  if (col.format) {
    return col.format(value, row);
  }
  if (value === null || value === undefined) return '-';
  return String(value);
}

function handleSort(key: string) {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc';
    } else {
      sortKey.value = '';
      sortOrder.value = 'asc';
    }
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

// Filtrado
const filteredData = computed(() => {
  let result = [...props.data];

  if (props.searchable && searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(item => {
      return props.columns.some(col => {
        const val = getNestedValue(item, col.key);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }

  // Ordenamiento
  if (sortKey.value) {
    result.sort((a, b) => {
      const valA = getNestedValue(a, sortKey.value);
      const valB = getNestedValue(b, sortKey.value);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const compare = valA > valB ? 1 : -1;
      return sortOrder.value === 'asc' ? compare : -compare;
    });
  }

  return result;
});

const totalFilteredRows = computed(() => filteredData.value.length);
const totalPages = computed(() => Math.ceil(totalFilteredRows.value / internalPageSize.value) || 1);

const startRecord = computed(() => {
  if (totalFilteredRows.value === 0) return 0;
  return (currentPage.value - 1) * internalPageSize.value + 1;
});

const endRecord = computed(() => {
  return Math.min(currentPage.value * internalPageSize.value, totalFilteredRows.value);
});

const paginatedData = computed(() => {
  if (!props.pagination) return filteredData.value;
  const start = (currentPage.value - 1) * internalPageSize.value;
  return filteredData.value.slice(start, start + internalPageSize.value);
});
</script>
