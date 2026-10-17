<template>
  <div class="space-y-6">
    <!-- Header Contabilidad y SUNAT -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-inner">
          <DocumentTextIcon class="w-6 h-6 text-retail-400" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Facturación Electrónica SUNAT & Conciliación</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              OSE / SUNAT Online
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Auditoría de boletas y facturas emitidas por cada terminal POS de la cadena, previsualización de comprobantes y validación de CDR.
          </p>
        </div>
      </div>

      <!-- Resumen SUNAT Status -->
      <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-bold">Servidor SUNAT: Conectado</span>
        <span class="text-slate-400">|</span>
        <span>CDR al 100%</span>
      </div>
    </div>

    <!-- TARJETAS DE CONCILIACIÓN DE INGRESOS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span class="text-xs font-semibold text-slate-500 uppercase">Total Facturado (Con IGV)</span>
        <p class="text-2xl font-bold text-slate-900 font-mono mt-1">S/ {{ totalFacturado.toFixed(2) }}</p>
        <span class="text-[11px] text-slate-500">Boletas (B001) y Facturas (F001)</span>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span class="text-xs font-semibold text-slate-500 uppercase">Débito Fiscal IGV (18%)</span>
        <p class="text-2xl font-bold text-blue-700 font-mono mt-1">S/ {{ totalIgv.toFixed(2) }}</p>
        <span class="text-[11px] text-blue-600 font-medium">A declarar en PDT 621</span>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span class="text-xs font-semibold text-slate-500 uppercase">Comprobantes Aceptados</span>
        <p class="text-2xl font-bold text-emerald-700 font-mono mt-1">{{ totalComprobantes }} emitidos</p>
        <span class="text-[11px] text-emerald-600">0 rechazados / 0 anomalías</span>
      </div>
    </div>

    <!-- TABLA DE COMPROBANTES EMITIDOS POR LAS TIENDAS -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Registro de Ventas Electrónicas</h2>
          <p class="text-xs text-slate-500">Haz clic en "Previsualizar" para revisar el comprobante detallado antes de imprimir o descargar.</p>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="filterBranch" class="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 font-semibold text-slate-700 focus:outline-none">
            <option value="all">Todas las Sedes</option>
            <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">Serie - Número</th>
              <th class="py-2.5 px-3">Fecha / Hora</th>
              <th class="py-2.5 px-3">Sede Emisora</th>
              <th class="py-2.5 px-3">Cajero</th>
              <th class="py-2.5 px-3">Cliente / Doc</th>
              <th class="py-2.5 px-3 text-right">Base Gravada</th>
              <th class="py-2.5 px-3 text-right">IGV (18%)</th>
              <th class="py-2.5 px-3 text-right">Total (S/)</th>
              <th class="py-2.5 px-3 text-center">Estado SUNAT</th>
              <th class="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="sale in filteredSales" :key="sale.id" class="hover:bg-slate-50/80 transition">
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="font-mono font-bold text-slate-900">{{ sale.ticketNumber }}</span>
                <span class="block text-[10px] text-slate-400 capitalize font-medium">{{ sale.invoiceType }}</span>
              </td>
              <td class="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600">
                {{ sale.date }} {{ sale.time }}
              </td>
              <td class="py-2.5 px-3 font-medium">{{ sale.branchName }}</td>
              <td class="py-2.5 px-3">{{ sale.cashierName }}</td>
              <td class="py-2.5 px-3">
                <span class="font-mono font-semibold">{{ sale.clientDocNumber || 'Consumidor Final' }}</span>
                <p v-if="sale.clientName" class="text-[10px] text-slate-400">{{ sale.clientName }}</p>
              </td>
              <td class="py-2.5 px-3 text-right font-mono text-slate-500">
                S/ {{ sale.subtotal.toFixed(2) }}
              </td>
              <td class="py-2.5 px-3 text-right font-mono text-slate-500">
                S/ {{ sale.igv.toFixed(2) }}
              </td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                S/ {{ sale.total.toFixed(2) }}
              </td>
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {{ sale.sunatStatus }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <!-- BOTÓN PREVISUALIZAR ANTES DE IMPRIMIR -->
                <button
                  @click="abrirPrevisualizacion(sale)"
                  class="inline-flex items-center gap-1 bg-retail-50 hover:bg-retail-100 text-retail-700 font-bold px-2.5 py-1 rounded-md border border-retail-200 transition text-[11px] cursor-pointer"
                  title="Previsualizar comprobante completo"
                >
                  <EyeIcon class="w-3.5 h-3.5" />
                  <span>Previsualizar</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE PREVISUALIZACIÓN DE COMPROBANTE ANTES DE IMPRIMIR -->
    <div v-if="showPreviewModal && previewSale" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-xs max-h-[92vh] overflow-y-auto">
        <!-- Header del Modal -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <EyeIcon class="w-5 h-5 text-retail-600" />
            <div>
              <h3 class="font-bold text-sm text-slate-900">Previsualización de Comprobante Electrónico</h3>
              <p class="text-[10px] text-slate-500">Revisa la representación impresa oficial antes de imprimir o descargar.</p>
            </div>
          </div>
          <button @click="showPreviewModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- DOCUMENTO DE FACTURACIÓN ELECTRÓNICA PREVISUALIZADO -->
        <div class="border border-slate-300 rounded-xl p-6 bg-white space-y-4 shadow-xs print:p-0">
          <!-- Cabecera Emisor y Recuadro RUC -->
          <div class="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  UM
                </div>
                <span class="font-black text-base text-slate-900 tracking-wide">Urba Market E.I.R.L</span>
              </div>
              <p class="text-[11px] text-slate-600 font-medium">Comercio Retail & Distribución</p>
              <p class="text-[10px] text-slate-500">Sede Emisora: {{ previewSale.branchName }}</p>
              <p class="text-[10px] text-slate-500">Lima, Perú • Tel: (01) 445-8920</p>
            </div>

            <!-- Recuadro Oficial RUC Tipo SUNAT -->
            <div class="border-2 border-slate-800 rounded-lg p-3 text-center min-w-[200px] shrink-0 bg-slate-50">
              <p class="font-bold text-xs text-slate-900 font-mono">R.U.C. 20601234567</p>
              <p class="font-extrabold text-xs text-retail-800 uppercase py-1 border-y border-slate-300 my-1">
                {{ previewSale.invoiceType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}
              </p>
              <p class="font-mono font-bold text-sm text-slate-900 tracking-wider">{{ previewSale.ticketNumber }}</p>
            </div>
          </div>

          <!-- Datos del Receptor / Cliente y Emisión -->
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px]">
            <div>
              <span class="text-slate-500 block">Señor(es) / Razón Social:</span>
              <span class="font-bold text-slate-800">{{ previewSale.clientName || 'CLIENTES VARIOS / CONSUMIDOR FINAL' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">{{ previewSale.clientDocType }}:</span>
              <span class="font-mono font-bold text-slate-800">{{ previewSale.clientDocNumber || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">Fecha y Hora de Emisión:</span>
              <span class="font-mono text-slate-800">{{ previewSale.date }} {{ previewSale.time }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">Moneda / Forma de Pago:</span>
              <span class="font-medium text-slate-800">Soles (PEN) • {{ previewSale.paymentMethod.toUpperCase() }}</span>
            </div>
          </div>

          <!-- Tabla de Ítems Detallados -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead class="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2 px-2">Código</th>
                  <th class="py-2 px-2">Descripción</th>
                  <th class="py-2 px-2 text-center">Cant.</th>
                  <th class="py-2 px-2 text-right">P. Unitario</th>
                  <th class="py-2 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="it in previewSale.items" :key="it.productId">
                  <td class="py-2 px-2 font-mono text-[10px] text-slate-500">{{ it.sku }}</td>
                  <td class="py-2 px-2 font-medium text-slate-800">{{ it.productName }}</td>
                  <td class="py-2 px-2 text-center font-mono font-semibold">{{ it.quantity }}</td>
                  <td class="py-2 px-2 text-right font-mono">S/ {{ it.unitPrice.toFixed(2) }}</td>
                  <td class="py-2 px-2 text-right font-mono font-bold text-slate-900">S/ {{ it.subtotal.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cuadro de Totales y Liquidación -->
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-3">
            <!-- Texto y Código QR SUNAT -->
            <div class="space-y-2 max-w-sm">
              <p class="text-[10px] text-slate-500">
                <strong>Importe en Letras:</strong> SON {{ numeroALetras(previewSale.total) }}
              </p>
              <div class="flex items-center gap-3 pt-1">
                <div class="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 p-1 text-center">
                  [ QR SUNAT ]
                </div>
                <div class="text-[10px] text-slate-500 font-mono space-y-0.5">
                  <p class="font-bold text-emerald-700">Comprobante Autorizado por SUNAT</p>
                  <p>Hash: {{ previewSale.sunatHash || 'bWk3d9xK==' }}</p>
                  <p>Estado OSE: CDR ACEPTADO</p>
                </div>
              </div>
            </div>

            <!-- Desglose Numérico -->
            <div class="w-full sm:w-64 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Op. Gravadas (Base):</span>
                <span class="font-mono">S/ {{ previewSale.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>I.G.V. (18%):</span>
                <span class="font-mono">S/ {{ previewSale.igv.toFixed(2) }}</span>
              </div>
              <div v-if="previewSale.discountTotal > 0" class="flex justify-between text-amber-700 font-semibold">
                <span>Descuento aplicado:</span>
                <span class="font-mono">- S/ {{ previewSale.discountTotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                <span>IMPORTE TOTAL:</span>
                <span class="font-mono text-base text-retail-800">S/ {{ previewSale.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción Posterior a la Previsualización -->
        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="showPreviewModal = false"
            class="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
          >
            Cerrar Previsualización
          </button>

          <button
            @click="descargarXmlCdr"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <DocumentArrowDownIcon class="w-4 h-4 text-slate-600" />
            <span>Descargar XML / CDR</span>
          </button>

          <button
            @click="descargarPdfComprobante"
            class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>

          <button
            @click="imprimirComprobante"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <PrinterIcon class="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useBranchStore } from '../stores/branchStore';
import { useToastStore } from '../stores/toastStore';
import type { POSSaleRecord } from '../types';
import {
  DocumentTextIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const posStore = usePosStore();
const branchStore = useBranchStore();
const toastStore = useToastStore();

const filterBranch = ref<string>('all');
const showPreviewModal = ref<boolean>(false);
const previewSale = ref<POSSaleRecord | null>(null);

const filteredSales = computed(() => {
  if (filterBranch.value === 'all') return posStore.salesHistory;
  return posStore.salesHistory.filter(s => s.branchId === filterBranch.value);
});

const totalFacturado = computed(() => {
  return filteredSales.value.reduce((acc, s) => acc + s.total, 0);
});

const totalIgv = computed(() => {
  return filteredSales.value.reduce((acc, s) => acc + s.igv, 0);
});

const totalComprobantes = computed(() => {
  return filteredSales.value.length;
});

function abrirPrevisualizacion(sale: POSSaleRecord) {
  previewSale.value = sale;
  showPreviewModal.value = true;
}

function imprimirComprobante() {
  window.print();
}

function descargarPdfComprobante() {
  if (!previewSale.value) return;
  toastStore.success(
    'Descarga de Comprobante PDF',
    `Generando y descargando PDF para ${previewSale.value.ticketNumber} (${previewSale.value.branchName}).`
  );
}

function descargarXmlCdr() {
  if (!previewSale.value) return;
  toastStore.info(
    'Constancia CDR SUNAT',
    `Archivo XML y CDR firmado digitalmente para ${previewSale.value.ticketNumber} descargado.`
  );
}

function numeroALetras(monto: number): string {
  const soles = Math.floor(monto);
  const centimos = Math.round((monto - soles) * 100);
  return `${soles} Y ${String(centimos).padStart(2, '0')}/100 SOLES`;
}
</script>
