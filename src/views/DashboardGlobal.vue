<template>
  <div class="space-y-6">
    <!-- Header Admin Dashboard con Filtros de Período y Sede -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-inner">
          <ChartBarIcon class="w-6 h-6 text-retail-400" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Dashboard Global de Cadena</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Gerencia General
            </span>
            <span 
              v-if="selectedBranch !== 'all'"
              class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
            >
              Filtrado por: {{ currentBranchName }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Métricas de ventas consolidadas en tiempo real, rendimiento por tienda física y top de rotación.
          </p>
        </div>
      </div>

      <!-- Filtros: Período y Sede -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filtro por Sede -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <BuildingStorefrontIcon class="w-4 h-4 text-slate-500 shrink-0" />
          <span class="text-xs font-semibold text-slate-600">Sede:</span>
          <select 
            v-model="selectedBranch" 
            class="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">Todas las Sedes (Consolidado)</option>
            <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <!-- Filtro por Período -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <CalendarIcon class="w-4 h-4 text-slate-500 shrink-0" />
          <span class="text-xs font-semibold text-slate-600">Período:</span>
          <select 
            v-model="selectedPeriod" 
            class="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            <option value="today">Hoy (Tiempo Real)</option>
            <option value="week">Esta Semana</option>
            <option value="month">Mes de Septiembre 2026</option>
          </select>
        </div>

        <!-- Botón Reset filtros si hay filtro activo -->
        <button
          v-if="selectedBranch !== 'all' || selectedPeriod !== 'today'"
          @click="resetFilters"
          class="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>

    <!-- TARJETAS DE KPIS CONSOLIDADOS (ADAPTATIVOS A LA SEDE SELECCIONADA) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
          <span>{{ selectedBranch === 'all' ? 'Ventas Cadena' : 'Ventas en ' + currentBranchName }}</span>
          <BanknotesIcon class="w-5 h-5 text-retail-600" />
        </div>
        <p class="text-2xl font-bold text-slate-900 font-mono mt-2">S/ {{ displayTotalVentas.toFixed(2) }}</p>
        <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
          <span>+14.8% vs período anterior</span>
          <span class="text-slate-400">• {{ selectedBranch === 'all' ? '4 sedes activas' : '1 sede' }}</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
          <span>Tickets Emitidos</span>
          <ReceiptPercentIcon class="w-5 h-5 text-blue-600" />
        </div>
        <p class="text-2xl font-bold text-slate-900 font-mono mt-2">{{ displayTotalTickets }} transacciones</p>
        <div class="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
          <span>Ticket promedio: <strong>S/ {{ displayTicketPromedio.toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
          <span>Margen Bruto Estimado</span>
          <ArrowTrendingUpIcon class="w-5 h-5 text-purple-600" />
        </div>
        <p class="text-2xl font-bold text-slate-900 font-mono mt-2">29.4%</p>
        <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
          <span>Rentabilidad sobre costo</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
          <span>Cajas en Operación</span>
          <BuildingStorefrontIcon class="w-5 h-5 text-amber-600" />
        </div>
        <p class="text-2xl font-bold text-slate-900 font-mono mt-2">
          {{ selectedBranch === 'all' ? '5 Cajas Operativas' : getActiveTillsInBranch }}
        </p>
        <div class="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
          <span>{{ posStore.isShiftOpen ? '1 Turno activo en terminal' : 'Turnos regulares en tienda' }}</span>
        </div>
      </div>
    </div>

    <!-- COMPARATIVO POR SEDE Y TOP PRODUCTOS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tabla / Barras de Ventas por Sede -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900">
              {{ selectedBranch === 'all' ? 'Ventas Consolidadas por Sucursal' : 'Rendimiento de ' + currentBranchName }}
            </h2>
            <p class="text-xs text-slate-500">
              {{ selectedBranch === 'all' ? 'Comparativo de ingresos y volumen de tickets por tienda.' : 'Detalle de rendimiento de la sucursal seleccionada.' }}
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Total Mostrado: S/ {{ displayTotalVentas.toFixed(2) }}
          </span>
        </div>

        <div class="space-y-4 pt-1">
          <div 
            v-for="sede in filteredVentasPorSede" 
            :key="sede.id" 
            class="p-3 rounded-xl border transition"
            :class="selectedBranch === sede.id ? 'border-retail-500 bg-retail-50/40 ring-1 ring-retail-500' : 'border-slate-100 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">{{ sede.name }}</span>
                <span class="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{{ sede.district }}</span>
                <span v-if="selectedBranch === sede.id" class="text-[10px] font-bold text-retail-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Seleccionada
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-slate-500">{{ sede.tickets }} tickets</span>
                <span class="font-mono font-bold text-slate-900 text-sm">S/ {{ sede.total.toFixed(2) }}</span>
              </div>
            </div>
            <!-- Barra visual de porcentaje respecto al total cadena -->
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div 
                class="bg-retail-600 h-full rounded-full transition-all duration-500"
                :style="{ width: `${(sede.total / totalCadenaVentas) * 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{{ ((sede.total / totalCadenaVentas) * 100).toFixed(1) }}% de la cadena</span>
              <span>Ticket prom: S/ {{ (sede.total / sede.tickets).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top de Productos más Vendidos -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Top Productos (Rotación)</h2>
            <p class="text-[11px] text-slate-500">{{ selectedBranch === 'all' ? 'Cadena completa' : currentBranchName }}</p>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">{{ selectedPeriod.toUpperCase() }}</span>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="(p, idx) in topProductos" :key="p.id" class="py-2.5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[10px]">
                {{ idx + 1 }}
              </span>
              <div>
                <p class="font-bold text-slate-800">{{ p.name }}</p>
                <span class="text-[10px] text-slate-400">{{ p.category }} • {{ p.unit }}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="font-mono font-bold text-slate-900">S/ {{ p.salesAmount.toFixed(2) }}</span>
              <p class="text-[10px] text-slate-500">{{ p.unitsSold }} unds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useBranchStore } from '../stores/branchStore';
import {
  ChartBarIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

const posStore = usePosStore();
const branchStore = useBranchStore();

const selectedBranch = ref<string>('all');
const selectedPeriod = ref<string>('today');

const currentBranchName = computed(() => {
  if (selectedBranch.value === 'all') return 'Todas las Sedes';
  const b = branchStore.getBranchById(selectedBranch.value);
  return b ? b.name : 'Sede';
});

const getActiveTillsInBranch = computed(() => {
  if (selectedBranch.value === 'all') return '5 Cajas Operativas';
  const b = branchStore.getBranchById(selectedBranch.value);
  return b ? `${b.activeCashiersCount} Cajas Operativas (${b.posTerminals} terminales)` : '1 Caja Operativa';
});

const ventasPorSede = computed(() => {
  const currentPosSales = posStore.activeShift?.totalSales || 0;
  // Multiplicador simulado si se selecciona semana o mes
  const multiplier = selectedPeriod.value === 'week' ? 6.5 : (selectedPeriod.value === 'month' ? 28 : 1);
  return [
    { id: 'sede-miraflores', name: 'Sede Miraflores (Principal)', district: 'Miraflores', total: (6450.00 + currentPosSales) * multiplier, tickets: Math.round(142 * multiplier) },
    { id: 'sede-san-isidro', name: 'Sede San Isidro', district: 'San Isidro', total: 4890.50 * multiplier, tickets: Math.round(98 * multiplier) },
    { id: 'sede-surco', name: 'Sede Surco', district: 'Surco', total: 5120.00 * multiplier, tickets: Math.round(110 * multiplier) },
    { id: 'sede-los-olivos', name: 'Sede Los Olivos', district: 'Los Olivos', total: 4210.00 * multiplier, tickets: Math.round(105 * multiplier) }
  ];
});

const totalCadenaVentas = computed(() => {
  return ventasPorSede.value.reduce((acc, s) => acc + s.total, 0);
});

const filteredVentasPorSede = computed(() => {
  if (selectedBranch.value === 'all') return ventasPorSede.value;
  return ventasPorSede.value.filter(s => s.id === selectedBranch.value);
});

const displayTotalVentas = computed(() => {
  if (selectedBranch.value === 'all') return totalCadenaVentas.value;
  const match = ventasPorSede.value.find(s => s.id === selectedBranch.value);
  return match ? match.total : 0;
});

const displayTotalTickets = computed(() => {
  if (selectedBranch.value === 'all') {
    return ventasPorSede.value.reduce((acc, s) => acc + s.tickets, 0);
  }
  const match = ventasPorSede.value.find(s => s.id === selectedBranch.value);
  return match ? match.tickets : 0;
});

const displayTicketPromedio = computed(() => {
  if (displayTotalTickets.value === 0) return 0;
  return displayTotalVentas.value / displayTotalTickets.value;
});

const topProductos = computed(() => {
  const factor = selectedPeriod.value === 'week' ? 6.5 : (selectedPeriod.value === 'month' ? 28 : 1);
  return [
    { id: '1', name: 'Coca Cola Sin Azúcar 1.5 L', category: 'Bebidas', unit: 'Botella', salesAmount: 1480.00 * factor, unitsSold: Math.round(174 * factor) },
    { id: '2', name: 'Leche Evaporada Gloria Azul', category: 'Lácteos', unit: 'Lata', salesAmount: 1120.00 * factor, unitsSold: Math.round(243 * factor) },
    { id: '3', name: 'Inca Kola Regular 1.5 L', category: 'Bebidas', unit: 'Botella', salesAmount: 980.00 * factor, unitsSold: Math.round(115 * factor) },
    { id: '4', name: 'Pan de Molde Bimbo Blanco', category: 'Panadería', unit: 'Bolsa', salesAmount: 845.50 * factor, unitsSold: Math.round(95 * factor) },
    { id: '5', name: 'Arroz Extra Costeño 1 kg', category: 'Abarrotes', unit: 'Bolsa', salesAmount: 760.00 * factor, unitsSold: Math.round(140 * factor) }
  ];
});

function resetFilters() {
  selectedBranch.value = 'all';
  selectedPeriod.value = 'today';
}
</script>
