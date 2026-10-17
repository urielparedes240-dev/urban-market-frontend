<template>
  <div class="space-y-6">
    <!-- Header y Acciones Globales -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-inner">
          <ArchiveBoxIcon class="w-6 h-6 text-retail-400" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Inventario Multi-Sede Centralizado</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Gestión Integral & Catálogo
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Control de stock por tienda, altas de productos, bajas auditadas, ajustes multi-sede y traslados.
          </p>
        </div>
      </div>

      <!-- Selector de Sucursal y Botones de Acción -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Selector de Sede -->
        <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <BuildingStorefrontIcon class="w-4 h-4 text-slate-500" />
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

        <!-- Botón Traslado entre Sedes -->
        <button
          @click="abrirModalTraslado"
          class="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-lg text-xs shadow-sm transition cursor-pointer"
        >
          <ArrowsRightLeftIcon class="w-4 h-4 text-retail-400" />
          <span>Traslados</span>
        </button>

        <!-- Botón Agregar Nuevo Producto -->
        <button
          @click="abrirNuevoProducto"
          class="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition cursor-pointer"
        >
          <PlusCircleIcon class="w-4 h-4" />
          <span>+ Nuevo Producto</span>
        </button>
      </div>
    </div>

    <!-- TARJETAS DE KPI DE INVENTARIO -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Catálogo SKU</span>
          <p class="text-2xl font-bold text-slate-900 font-mono mt-1">{{ totalActiveCount }} activos</p>
          <span class="text-[11px] text-slate-400">{{ totalDeBajaCount }} dados de baja</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <TagIcon class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Valorización Inventario</span>
          <p class="text-2xl font-bold text-emerald-700 font-mono mt-1">S/ {{ totalValuation.toFixed(2) }}</p>
          <span class="text-[11px] text-emerald-600 font-medium">Costo reposición total</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <BanknotesIcon class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Stock Crítico (Mínimo)</span>
          <p class="text-2xl font-bold text-amber-600 font-mono mt-1">{{ criticalCount }} ítems</p>
          <span class="text-[11px] text-amber-600">Requiere reposición</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <ExclamationTriangleIcon class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-rose-700 uppercase tracking-wide">Ítems Agotados</span>
          <p class="text-2xl font-bold text-rose-600 font-mono mt-1">{{ outOfStockCount }} ítems</p>
          <span class="text-[11px] text-rose-600">Quiebre de stock</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <XCircleIcon class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- TABLA DE ALTA DENSIDAD DE DATOS (DATA-HEAVY) -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-3">
        <!-- Buscador, categoría y estado -->
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <!-- Buscador -->
          <div class="relative min-w-[240px] flex-1 max-w-md">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por SKU, código de barras, nombre o marca..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-retail-500"
            />
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <!-- Filtro de Categoría -->
          <select
            v-model="categoryFilter"
            class="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-retail-500"
          >
            <option value="all">Todas las Categorías</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>

          <!-- Filtro de Estado (Activos / Dados de Baja) -->
          <select
            v-model="statusFilter"
            class="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-retail-500 font-semibold"
          >
            <option value="all">Estado: Todos</option>
            <option value="activo">Solo Activos (En Venta)</option>
            <option value="de_baja">Solo Dados de Baja</option>
          </select>
        </div>

        <div class="text-xs text-slate-500 shrink-0">
          Mostrando <strong>{{ tableFilteredProducts.length }}</strong> de <strong>{{ inventoryStore.products.length }}</strong> productos
        </div>
      </div>

      <!-- Tabla Tipada de Inventario -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">SKU / Barras</th>
              <th class="py-2.5 px-3">Producto & Marca</th>
              <th class="py-2.5 px-3">Categoría</th>
              <th class="py-2.5 px-3 text-right">Precio Venta</th>
              <th class="py-2.5 px-3 text-right">Costo Unit.</th>
              <th class="py-2.5 px-3 text-right">Margen</th>
              <!-- Si es todas las sedes, muestra columnas por sucursal -->
              <template v-if="selectedBranch === 'all'">
                <th class="py-2.5 px-3 text-center text-slate-700">Miraflores</th>
                <th class="py-2.5 px-3 text-center text-slate-700">San Isidro</th>
                <th class="py-2.5 px-3 text-center text-slate-700">Surco</th>
                <th class="py-2.5 px-3 text-center text-slate-700">Los Olivos</th>
                <th class="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-100">Stock Total</th>
              </template>
              <template v-else>
                <th class="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-100">Stock en Sede</th>
                <th class="py-2.5 px-3 text-center">Stock Mínimo</th>
              </template>
              <th class="py-2.5 px-3 text-center">Estado Catálogo</th>
              <th class="py-2.5 px-3 text-center">Nivel Stock</th>
              <th class="py-2.5 px-3 text-center min-w-[130px]">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr 
              v-for="prod in tableFilteredProducts" 
              :key="prod.id" 
              class="hover:bg-slate-50/80 transition"
              :class="prod.status === 'de_baja' ? 'bg-slate-50/60 opacity-75' : ''"
            >
              <!-- SKU y Código de Barras -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="font-mono font-bold text-slate-900">{{ prod.sku }}</span>
                <p class="font-mono text-[10px] text-slate-400">{{ prod.barcode }}</p>
              </td>

              <!-- Nombre e Imagen -->
              <td class="py-2.5 px-3">
                <div class="flex items-center gap-2.5">
                  <img :src="prod.image" :alt="prod.name" class="w-8 h-8 rounded object-cover border border-slate-200 shrink-0" />
                  <div>
                    <div class="flex items-center gap-1.5">
                      <p class="font-bold text-slate-900 line-clamp-1">{{ prod.name }}</p>
                      <span v-if="prod.isFastSale" class="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded" title="Acceso rápido en POS">
                        POS
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500">{{ prod.brand }} • {{ prod.unit }}</span>
                  </div>
                </div>
              </td>

              <!-- Categoría -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {{ prod.category }}
                </span>
              </td>

              <!-- Precio Venta -->
              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                S/ {{ prod.price.toFixed(2) }}
              </td>

              <!-- Costo Unitario -->
              <td class="py-2.5 px-3 text-right font-mono text-slate-500">
                S/ {{ prod.cost.toFixed(2) }}
              </td>

              <!-- Margen Bruto % -->
              <td class="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                {{ (((prod.price - prod.cost) / prod.price) * 100).toFixed(0) }}%
              </td>

              <!-- Desglose por sede si está en modo consolidado -->
              <template v-if="selectedBranch === 'all'">
                <td class="py-2.5 px-3 text-center font-mono" :class="getStockCellClass(prod.stockByBranch['sede-miraflores'], prod.minStock)">
                  {{ prod.stockByBranch['sede-miraflores'] ?? 0 }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono" :class="getStockCellClass(prod.stockByBranch['sede-san-isidro'], prod.minStock)">
                  {{ prod.stockByBranch['sede-san-isidro'] ?? 0 }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono" :class="getStockCellClass(prod.stockByBranch['sede-surco'], prod.minStock)">
                  {{ prod.stockByBranch['sede-surco'] ?? 0 }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono" :class="getStockCellClass(prod.stockByBranch['sede-los-olivos'], prod.minStock)">
                  {{ prod.stockByBranch['sede-los-olivos'] ?? 0 }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50">
                  {{ inventoryStore.getTotalStock(prod) }}
                </td>
              </template>
              <template v-else>
                <td class="py-2.5 px-3 text-center font-mono font-bold bg-slate-50" :class="getStockCellClass(prod.stockByBranch[selectedBranch], prod.minStock)">
                  {{ prod.stockByBranch[selectedBranch] ?? 0 }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono text-slate-400">
                  {{ prod.minStock }}
                </td>
              </template>

              <!-- Estado Catálogo (Activo / Dado de Baja) -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <span 
                  v-if="prod.status === 'de_baja'"
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300"
                  :title="prod.deactivationReason || 'Dado de baja'"
                >
                  DADO DE BAJA
                </span>
                <span 
                  v-else
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  ACTIVO
                </span>
              </td>

              <!-- Nivel Semántico de Stock -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                  :class="getStatusBadgeClass(inventoryStore.getStockStatus(prod, selectedBranch))"
                >
                  {{ inventoryStore.getStockStatus(prod, selectedBranch) }}
                </span>
              </td>

              <!-- ACCIONES EXPANDIDAS REQUERIDAS CON ALTA VISIBILIDAD Y HOVER DEFINIDO -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- 1. Ajuste de Stock Multi-Sede -->
                  <button
                    @click="abrirAjusteMulti(prod)"
                    class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-2 border-emerald-300 hover:border-emerald-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center"
                    title="Ajuste de Stock Físico Multi-Sede"
                  >
                    <AdjustmentsHorizontalIcon class="w-4 h-4" />
                  </button>

                  <!-- 2. Modificar Producto -->
                  <button
                    @click="abrirModificarProducto(prod)"
                    class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white border-2 border-blue-300 hover:border-blue-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center"
                    title="Modificar datos del producto"
                  >
                    <PencilSquareIcon class="w-4 h-4" />
                  </button>

                  <!-- 3. Dar de Baja / Reactivar Producto (NO eliminar) -->
                  <button
                    v-if="prod.status !== 'de_baja'"
                    @click="abrirConfirmarBaja(prod)"
                    class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border-2 border-rose-300 hover:border-rose-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center"
                    title="Dar de baja producto (desactiva en POS sin borrar)"
                  >
                    <NoSymbolIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-else
                    @click="reactivarProducto(prod)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border-2 border-slate-300 hover:border-slate-900 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center"
                    title="Reactivar producto en catálogo"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: AJUSTE DE STOCK FÍSICO MULTI-SEDE (SELECCIONAR 1 O MÁS SEDES Y ACCIONES RÁPIDAS) -->
    <div v-if="showAdjustMultiModal && selectedProductForAdjust" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <AdjustmentsHorizontalIcon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900">Ajuste de Stock Físico Multi-Sede</h3>
              <p class="text-[11px] text-slate-500">{{ selectedProductForAdjust.name }} ({{ selectedProductForAdjust.sku }})</p>
            </div>
          </div>
          <button @click="showAdjustMultiModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="ejecutarAjusteMulti" class="space-y-4">
          <!-- Paso 1: Selección de 1 o más Sedes -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                1. Selecciona las Sedes a Modificar:
              </label>
              <div class="flex gap-2 text-[11px]">
                <button 
                  type="button" 
                  @click="seleccionarTodasSedes" 
                  class="text-retail-700 font-semibold hover:underline"
                >
                  Todas las sedes
                </button>
                <span class="text-slate-300">|</span>
                <button 
                  type="button" 
                  @click="selectedBranchesForAdjust = []" 
                  class="text-slate-500 hover:underline"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="b in branchStore.branches"
                :key="b.id"
                class="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition"
                :class="selectedBranchesForAdjust.includes(b.id) ? 'bg-emerald-50/70 border-retail-500 text-emerald-950 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="b.id"
                    v-model="selectedBranchesForAdjust"
                    class="rounded text-retail-600 focus:ring-retail-500"
                  />
                  <span>{{ b.name }}</span>
                </div>
                <span class="text-[11px] font-mono text-slate-500">
                  Actual: {{ selectedProductForAdjust.stockByBranch[b.id] ?? 0 }}
                </span>
              </label>
            </div>
            <p v-if="selectedBranchesForAdjust.length === 0" class="text-rose-600 text-[11px] mt-1 font-semibold">
              * Debes seleccionar al menos una sede.
            </p>
          </div>

          <!-- Paso 2: Acción Rápida (Ingresar, Restar o Fijar) -->
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <label class="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
              2. Tipo de Acción de Stock:
            </label>

            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="adjustMode = 'add'"
                class="py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5"
                :class="adjustMode === 'add' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'"
              >
                <PlusIcon class="w-4 h-4" />
                <span>Ingresar (+X)</span>
              </button>

              <button
                type="button"
                @click="adjustMode = 'subtract'"
                class="py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5"
                :class="adjustMode === 'subtract' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'"
              >
                <MinusIcon class="w-4 h-4" />
                <span>Restar / Merma (-X)</span>
              </button>

              <button
                type="button"
                @click="adjustMode = 'set'"
                class="py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5"
                :class="adjustMode === 'set' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-300'"
              >
                <CheckIcon class="w-4 h-4" />
                <span>Fijar Exacto (=X)</span>
              </button>
            </div>

            <!-- Cantidad a aplicar -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-slate-700">
                  {{ adjustMode === 'set' ? 'Nuevo valor exacto de stock:' : 'Cantidad de unidades a ' + (adjustMode === 'add' ? 'sumar:' : 'descontar:') }}
                </span>
                <div class="flex gap-1.5">
                  <button
                    v-for="preset in [5, 10, 20, 50, 100]"
                    :key="preset"
                    type="button"
                    @click="adjustAmount = preset"
                    class="px-2 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono hover:border-retail-500"
                  >
                    +{{ preset }}
                  </button>
                </div>
              </div>

              <input
                type="number"
                min="0"
                v-model.number="adjustAmount"
                class="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-retail-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <!-- Previsualización de cómo quedará el stock por sede -->
          <div v-if="selectedBranchesForAdjust.length > 0" class="border border-slate-200 rounded-xl p-3 bg-white">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Previsualización de Stock Resultante:
            </span>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div 
                v-for="bId in selectedBranchesForAdjust" 
                :key="bId"
                class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
              >
                <span class="text-slate-700">{{ branchStore.getBranchName(bId) }}:</span>
                <div class="flex items-center gap-1 font-mono">
                  <span class="text-slate-400 line-through">{{ selectedProductForAdjust.stockByBranch[bId] ?? 0 }}</span>
                  <span class="text-slate-400">→</span>
                  <span class="font-bold text-emerald-700">{{ calculatePreviewStock(bId) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Motivo del Ajuste Obligatorio -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">
              Motivo del Ajuste (Obligatorio para Auditoría):
            </label>
            <input
              type="text"
              v-model="adjustReasonText"
              class="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              placeholder="Ej: Inventario físico mensual, merma por rotura de envase, ingreso masivo por compra mayorista"
              required
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showAdjustMultiModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="selectedBranchesForAdjust.length === 0"
              class="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-50 text-white rounded-lg shadow-sm cursor-pointer transition-colors duration-150"
            >
              Aplicar Ajuste Multi-Sede
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: CREAR NUEVO PRODUCTO -->
    <div v-if="showNewProductModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <PlusCircleIcon class="w-5 h-5 text-slate-900" />
            <h3 class="font-bold text-sm text-slate-900">Agregar Nuevo Producto al Catálogo</h3>
          </div>
          <button @click="showNewProductModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="guardarNuevoProducto" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nombre Comercial del Producto *</label>
              <input type="text" v-model="newProductForm.name" class="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ej: Cerveza Cusqueña Trigo 330 ml" required />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Marca / Fabricante *</label>
              <input type="text" v-model="newProductForm.brand" class="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ej: Backus / Gloria / Alicorp" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">SKU Interno *</label>
              <input type="text" v-model="newProductForm.sku" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="BEB-0199" required />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código de Barras *</label>
              <input type="text" v-model="newProductForm.barcode" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="7750123456789" required />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Categoría *</label>
              <select v-model="newProductForm.category" class="w-full p-2 border border-slate-300 rounded-lg" required>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Precio Venta PVP (S/) *</label>
              <input type="number" step="0.10" min="0.10" v-model.number="newProductForm.price" class="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900" placeholder="6.50" required />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Costo Unitario (S/) *</label>
              <input type="number" step="0.10" min="0" v-model.number="newProductForm.cost" class="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-600" placeholder="4.20" required />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Unidad de Medida *</label>
              <select v-model="newProductForm.unit" class="w-full p-2 border border-slate-300 rounded-lg" required>
                <option value="Und">Unidad (Und)</option>
                <option value="Botella">Botella</option>
                <option value="Lata">Lata</option>
                <option value="Bolsa">Bolsa</option>
                <option value="Kg">Kilogramo (Kg)</option>
                <option value="Pack">Pack</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Stock Mínimo de Alerta *</label>
              <input type="number" min="1" v-model.number="newProductForm.minStock" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="15" required />
            </div>

            <div class="flex items-center gap-2 pt-6">
              <input type="checkbox" id="fastSaleCheck" v-model="newProductForm.isFastSale" class="rounded text-slate-900 focus:ring-slate-800 cursor-pointer" />
              <label for="fastSaleCheck" class="font-medium text-slate-800 cursor-pointer">
                Destacar como Venta Rápida en POS
              </label>
            </div>
          </div>

          <!-- Stock Inicial en cada Sede -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Stock Inicial por Sucursal (Opcional):
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div v-for="b in branchStore.branches" :key="b.id">
                <label class="block text-[10px] text-slate-500 mb-0.5 truncate">{{ b.district }}</label>
                <input
                  type="number"
                  min="0"
                  v-model.number="newProductForm.stockByBranch[b.id]"
                  class="w-full p-1.5 bg-white border border-slate-300 rounded text-center font-mono text-xs font-bold"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">URL de Imagen (Opcional)</label>
            <input type="text" v-model="newProductForm.image" class="w-full p-2 border border-slate-300 rounded-lg text-xs" placeholder="https://images.unsplash.com/..." />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showNewProductModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-lg shadow-sm cursor-pointer transition-colors duration-150"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: MODIFICAR PRODUCTO EXISTENTE -->
    <div v-if="showEditProductModal && editingProduct" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            <h3 class="font-bold text-sm text-slate-900">Modificar Producto: {{ editingProduct.name }}</h3>
          </div>
          <button @click="showEditProductModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="guardarModificacionProducto" class="space-y-3.5">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
              <input type="text" v-model="editProductForm.name" class="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Marca</label>
              <input type="text" v-model="editProductForm.brand" class="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">SKU</label>
              <input type="text" v-model="editProductForm.sku" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código de Barras</label>
              <input type="text" v-model="editProductForm.barcode" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Categoría</label>
              <select v-model="editProductForm.category" class="w-full p-2 border border-slate-300 rounded-lg" required>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Precio Venta (S/)</label>
              <input type="number" step="0.10" v-model.number="editProductForm.price" class="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Costo Unitario (S/)</label>
              <input type="number" step="0.10" v-model.number="editProductForm.cost" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Stock Mínimo</label>
              <input type="number" v-model.number="editProductForm.minStock" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">URL de Imagen</label>
            <input type="text" v-model="editProductForm.image" class="w-full p-2 border border-slate-300 rounded-lg text-xs" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="editFastSale" v-model="editProductForm.isFastSale" class="rounded text-slate-900 focus:ring-slate-800 cursor-pointer" />
            <label for="editFastSale" class="font-medium text-slate-800 cursor-pointer">
              Venta rápida destacada en POS
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showEditProductModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 4: CONFIRMAR DAR DE BAJA PRODUCTO (NO ELIMINAR) -->
    <div v-if="showDeactivateModal && productToDeactivate" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <NoSymbolIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900">Dar de Baja Producto</h3>
            <p class="text-[11px] text-slate-500">{{ productToDeactivate.name }}</p>
          </div>
        </div>

        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
          <p class="font-bold">Aviso de Cumplimiento & Auditoría:</p>
          <p class="text-[11px] leading-relaxed">
            El producto <strong>NO se eliminará</strong> de la base de datos para no alterar el historial contable ni las ventas pasadas emitidas a SUNAT.
          </p>
          <p class="text-[11px] leading-relaxed">
            Quedará marcado como <strong>"DADO DE BAJA"</strong> y será bloqueado automáticamente en los terminales POS de las tiendas para que los cajeros no lo puedan cobrar.
          </p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Motivo de la Baja (Obligatorio):</label>
          <textarea
            v-model="deactivateReasonText"
            rows="2"
            class="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            placeholder="Ej: Producto descontinuado por proveedor, cambio de presentación de envase, vencimiento"
            required
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showDeactivateModal = false"
            class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarBajaProducto"
            :disabled="!deactivateReasonText.trim()"
            class="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
          >
            Confirmar Baja de Producto
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 5: TRASLADO ENTRE SEDES -->
    <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <ArrowsRightLeftIcon class="w-5 h-5 text-slate-900" />
            <h3 class="font-bold text-sm text-slate-900">Traslado de Mercadería entre Tiendas</h3>
          </div>
          <button @click="showTransferModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="ejecutarTraslado" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Producto a Trasladar</label>
            <select v-model="transferForm.productId" class="w-full p-2 border border-slate-300 rounded-lg text-xs" required>
              <option v-for="p in activeProductsList" :key="p.id" :value="p.id">
                {{ p.sku }} - {{ p.name }} (Stock total: {{ inventoryStore.getTotalStock(p) }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sede de Origen</label>
              <select v-model="transferForm.originBranchId" class="w-full p-2 border border-slate-300 rounded-lg text-xs" required>
                <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">
                  {{ b.name }} (Disp: {{ getStockOfProductIn(transferForm.productId, b.id) }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sede de Destino</label>
              <select v-model="transferForm.destBranchId" class="w-full p-2 border border-slate-300 rounded-lg text-xs" required>
                <option 
                  v-for="b in branchStore.branches" 
                  :key="b.id" 
                  :value="b.id" 
                  :disabled="b.id === transferForm.originBranchId"
                >
                  {{ b.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Cantidad a Transferir (Unidades)</label>
              <input
                type="number"
                min="1"
                v-model.number="transferForm.quantity"
                class="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Responsable del Envío</label>
              <input
                type="text"
                v-model="transferForm.responsible"
                class="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Nombre del supervisor"
                required
              />
            </div>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
            Al confirmar, se emitirá una Guía de Remisión Interna y se descontará el stock inmediatamente de la sede origen.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showTransferModal = false"
              class="px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 hover:border-slate-400 cursor-pointer transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 font-black bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-lg shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
            >
              Confirmar Traslado
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EXTRA DE DOBLE VERIFICACIÓN (SEGURIDAD PARA PREVENIR ERRORES INVOLUNTARIOS) -->
    <ConfirmModal
      v-model="showConfirmModal"
      :title="confirmTitle"
      :subtitle="confirmSubtitle"
      :message="confirmMessage"
      :details="confirmDetails"
      :type="confirmType"
      :confirm-text="confirmButtonText"
      @confirm="handleConfirmExecution"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useInventoryStore } from '../stores/inventoryStore';
import { useBranchStore } from '../stores/branchStore';
import { useToastStore } from '../stores/toastStore';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import type { RetailProduct, ProductCategory } from '../types';
import {
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  TagIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  PlusCircleIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const inventoryStore = useInventoryStore();
const branchStore = useBranchStore();
const toastStore = useToastStore();

const selectedBranch = ref<string>('all');
const searchQuery = ref<string>('');
const categoryFilter = ref<string>('all');
const statusFilter = ref<string>('all');

// Modales operativos
const showTransferModal = ref<boolean>(false);
const showNewProductModal = ref<boolean>(false);
const showEditProductModal = ref<boolean>(false);
const showAdjustMultiModal = ref<boolean>(false);
const showDeactivateModal = ref<boolean>(false);

// Modal extra de Doble Verificación
const showConfirmModal = ref<boolean>(false);
const confirmTitle = ref<string>('');
const confirmSubtitle = ref<string>('');
const confirmMessage = ref<string>('');
const confirmDetails = ref<Record<string, string | number>>({});
const confirmType = ref<'primary' | 'warning' | 'danger'>('primary');
const confirmButtonText = ref<string>('Sí, estoy seguro');
let pendingActionCallback: (() => void) | null = null;

function requestConfirmation(options: {
  title: string;
  subtitle?: string;
  message?: string;
  details?: Record<string, string | number>;
  type?: 'primary' | 'warning' | 'danger';
  confirmText?: string;
  onConfirm: () => void;
}) {
  confirmTitle.value = options.title;
  confirmSubtitle.value = options.subtitle || 'Verificación requerida para evitar errores involuntarios';
  confirmMessage.value = options.message || 'Por favor verifica la información antes de continuar con la acción.';
  confirmDetails.value = options.details || {};
  confirmType.value = options.type || 'primary';
  confirmButtonText.value = options.confirmText || 'Sí, estoy seguro';
  pendingActionCallback = options.onConfirm;
  showConfirmModal.value = true;
}

function handleConfirmExecution() {
  if (pendingActionCallback) {
    pendingActionCallback();
    pendingActionCallback = null;
  }
}

// Estado para Ajuste Multi-Sede
const selectedProductForAdjust = ref<RetailProduct | null>(null);
const selectedBranchesForAdjust = ref<string[]>(['sede-miraflores', 'sede-san-isidro', 'sede-surco', 'sede-los-olivos']);
const adjustMode = ref<'set' | 'add' | 'subtract'>('add');
const adjustAmount = ref<number>(10);
const adjustReasonText = ref<string>('Recepción de lote / ajuste de inventario');

// Estado para Modificar Producto
const editingProduct = ref<RetailProduct | null>(null);
const editProductForm = ref<any>({});

// Estado para Dar de Baja
const productToDeactivate = ref<RetailProduct | null>(null);
const deactivateReasonText = ref<string>('');

// Estado para Nuevo Producto
const newProductForm = ref<{
  name: string;
  brand: string;
  sku: string;
  barcode: string;
  category: ProductCategory;
  unit: string;
  price: number;
  cost: number;
  minStock: number;
  isFastSale: boolean;
  image: string;
  stockByBranch: Record<string, number>;
}>({
  name: '',
  brand: '',
  sku: '',
  barcode: '',
  category: 'Bebidas',
  unit: 'Und',
  price: 5.00,
  cost: 3.50,
  minStock: 20,
  isFastSale: false,
  image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
  stockByBranch: {
    'sede-miraflores': 20,
    'sede-san-isidro': 15,
    'sede-surco': 15,
    'sede-los-olivos': 20
  }
});

const transferForm = ref({
  productId: 'prod-001',
  originBranchId: 'sede-miraflores',
  destBranchId: 'sede-san-isidro',
  quantity: 10,
  responsible: 'Ing. Carlos Mendoza'
});

const categories: ProductCategory[] = [
  'Bebidas',
  'Abarrotes',
  'Snacks',
  'Lácteos',
  'Panadería',
  'Frutas y Verduras',
  'Limpieza',
  'Golosinas'
];

// Listas computadas
const activeProductsList = computed(() => {
  return inventoryStore.products.filter(p => p.status !== 'de_baja');
});

const totalActiveCount = computed(() => {
  return inventoryStore.products.filter(p => p.status !== 'de_baja').length;
});

const totalDeBajaCount = computed(() => {
  return inventoryStore.products.filter(p => p.status === 'de_baja').length;
});

const totalValuation = computed(() => {
  return inventoryStore.products
    .filter(p => p.status !== 'de_baja')
    .reduce((acc, p) => {
      const stock = selectedBranch.value === 'all' 
        ? inventoryStore.getTotalStock(p) 
        : (p.stockByBranch[selectedBranch.value] || 0);
      return acc + (stock * p.cost);
    }, 0);
});

const criticalCount = computed(() => {
  return inventoryStore.products.filter(p => {
    if (p.status === 'de_baja') return false;
    return inventoryStore.getStockStatus(p, selectedBranch.value) === 'critico';
  }).length;
});

const outOfStockCount = computed(() => {
  return inventoryStore.products.filter(p => {
    if (p.status === 'de_baja') return false;
    return inventoryStore.getStockStatus(p, selectedBranch.value) === 'agotado';
  }).length;
});

// Filtrado de tabla
const tableFilteredProducts = computed(() => {
  return inventoryStore.products.filter(p => {
    const matchCat = categoryFilter.value === 'all' || p.category === categoryFilter.value;
    const matchStatus = 
      statusFilter.value === 'all' ||
      (statusFilter.value === 'activo' && p.status !== 'de_baja') ||
      (statusFilter.value === 'de_baja' && p.status === 'de_baja');

    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return matchCat && matchStatus;

    const matchQuery =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.brand.toLowerCase().includes(query);

    return matchCat && matchStatus && matchQuery;
  });
});

function getStockCellClass(stock: number = 0, minStock: number) {
  if (stock <= 0) return 'text-rose-600 font-bold';
  if (stock <= minStock) return 'text-amber-600 font-semibold';
  return 'text-slate-800';
}

function getStatusBadgeClass(status: 'optimo' | 'critico' | 'agotado') {
  if (status === 'optimo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'critico') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function getStockOfProductIn(prodId: string, branchId: string): number {
  const prod = inventoryStore.products.find(p => p.id === prodId);
  return prod ? (prod.stockByBranch[branchId] ?? 0) : 0;
}

// 1. LÓGICA DE AJUSTE MULTI-SEDE
function abrirAjusteMulti(prod: RetailProduct) {
  selectedProductForAdjust.value = prod;
  // Si está filtrado por una sede específica, seleccionamos esa sede por defecto; sino, todas
  if (selectedBranch.value !== 'all') {
    selectedBranchesForAdjust.value = [selectedBranch.value];
  } else {
    selectedBranchesForAdjust.value = branchStore.branches.map(b => b.id);
  }
  adjustMode.value = 'add';
  adjustAmount.value = 10;
  adjustReasonText.value = 'Ajuste de inventario físico mensual';
  showAdjustMultiModal.value = true;
}

function seleccionarTodasSedes() {
  selectedBranchesForAdjust.value = branchStore.branches.map(b => b.id);
}

function calculatePreviewStock(branchId: string): number {
  if (!selectedProductForAdjust.value) return 0;
  const current = selectedProductForAdjust.value.stockByBranch[branchId] || 0;
  const amt = Math.max(0, adjustAmount.value || 0);

  if (adjustMode.value === 'set') return amt;
  if (adjustMode.value === 'add') return current + amt;
  if (adjustMode.value === 'subtract') return Math.max(0, current - amt);
  return current;
}

function ejecutarAjusteMulti() {
  if (!selectedProductForAdjust.value) return;
  if (selectedBranchesForAdjust.value.length === 0) {
    toastStore.warning('Selección requerida', 'Debes marcar al menos una sede.');
    return;
  }
  if (!adjustReasonText.value.trim()) {
    toastStore.warning('Motivo requerido', 'Debes justificar el motivo del ajuste.');
    return;
  }

  const prod = selectedProductForAdjust.value;
  const branchesCount = selectedBranchesForAdjust.value.length;
  const modeLabel = adjustMode.value === 'add' ? `Ingresar (+${adjustAmount.value})` : (adjustMode.value === 'subtract' ? `Restar (-${adjustAmount.value})` : `Fijar (= ${adjustAmount.value})`);

  requestConfirmation({
    title: '¿Está seguro de aplicar este ajuste de stock físico?',
    subtitle: 'Verificación obligatoria de inventario físico',
    message: `Se aplicará la acción "${modeLabel}" sobre ${branchesCount} sedes de la cadena Urba Market E.I.R.L.`,
    details: {
      'Producto': prod.name,
      'SKU': prod.sku,
      'Sedes afectadas': `${branchesCount} tiendas`,
      'Operación': modeLabel,
      'Motivo': adjustReasonText.value
    },
    type: 'warning',
    confirmText: 'Sí, aplicar ajuste físico',
    onConfirm: () => {
      inventoryStore.adjustStockMulti(
        prod.id,
        selectedBranchesForAdjust.value,
        adjustMode.value,
        adjustAmount.value,
        adjustReasonText.value
      );

      toastStore.success(
        'Ajuste Multi-Sede Aplicado',
        `Se modificó el stock de "${prod.name}" en ${branchesCount} sedes (${adjustMode.value.toUpperCase()} ${adjustAmount.value}).`
      );

      showAdjustMultiModal.value = false;
    }
  });
}

// 2. LÓGICA DE NUEVO PRODUCTO
function abrirNuevoProducto() {
  newProductForm.value = {
    name: '',
    brand: '',
    sku: `RET-${String(inventoryStore.products.length + 1).padStart(4, '0')}`,
    barcode: `775${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
    category: 'Bebidas',
    unit: 'Und',
    price: 6.00,
    cost: 4.20,
    minStock: 20,
    isFastSale: false,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
    stockByBranch: {
      'sede-miraflores': 25,
      'sede-san-isidro': 20,
      'sede-surco': 20,
      'sede-los-olivos': 25
    }
  };
  showNewProductModal.value = true;
}

function guardarNuevoProducto() {
  if (!newProductForm.value.name.trim()) {
    toastStore.warning('Nombre requerido', 'Ingresa la descripción del producto.');
    return;
  }

  requestConfirmation({
    title: '¿Está seguro de registrar este nuevo producto?',
    subtitle: 'Verificación para evitar duplicados en el catálogo corporativo',
    message: 'El producto quedará registrado en el inventario con el precio, costo y stocks asignados a las sucursales.',
    details: {
      'Producto': newProductForm.value.name,
      'Marca': newProductForm.value.brand || 'Genérica',
      'SKU / Código': newProductForm.value.sku,
      'Precio Venta PVP': `S/ ${Number(newProductForm.value.price).toFixed(2)}`,
      'Categoría': newProductForm.value.category
    },
    type: 'primary',
    confirmText: 'Sí, registrar producto',
    onConfirm: () => {
      const prod = inventoryStore.addProduct({
        name: newProductForm.value.name,
        brand: newProductForm.value.brand,
        sku: newProductForm.value.sku,
        barcode: newProductForm.value.barcode,
        category: newProductForm.value.category,
        unit: newProductForm.value.unit,
        price: Number(newProductForm.value.price),
        cost: Number(newProductForm.value.cost),
        minStock: Number(newProductForm.value.minStock),
        isFastSale: Boolean(newProductForm.value.isFastSale),
        image: newProductForm.value.image || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
        stockByBranch: { ...newProductForm.value.stockByBranch }
      });

      toastStore.success('Producto Creado', `"${prod.name}" se agregó exitosamente al catálogo.`);
      showNewProductModal.value = false;
    }
  });
}

// 3. LÓGICA DE MODIFICAR PRODUCTO
function abrirModificarProducto(prod: RetailProduct) {
  editingProduct.value = prod;
  editProductForm.value = { ...prod };
  showEditProductModal.value = true;
}

function guardarModificacionProducto() {
  if (!editingProduct.value) return;

  const prodName = editProductForm.value.name;
  const newPrice = Number(editProductForm.value.price);

  requestConfirmation({
    title: '¿Está seguro de guardar los cambios del producto?',
    subtitle: 'Se actualizarán los datos de venta y catálogo en todas las tiendas',
    message: `Confirma que los nuevos valores para "${prodName}" son correctos.`,
    details: {
      'Producto': prodName,
      'SKU': editProductForm.value.sku,
      'Precio de Venta': `S/ ${newPrice.toFixed(2)}`,
      'Costo': `S/ ${Number(editProductForm.value.cost).toFixed(2)}`,
      'Categoría': editProductForm.value.category
    },
    type: 'primary',
    confirmText: 'Sí, guardar cambios',
    onConfirm: () => {
      inventoryStore.updateProduct(editingProduct.value!.id, {
        name: editProductForm.value.name,
        brand: editProductForm.value.brand,
        sku: editProductForm.value.sku,
        barcode: editProductForm.value.barcode,
        category: editProductForm.value.category,
        price: newPrice,
        cost: Number(editProductForm.value.cost),
        minStock: Number(editProductForm.value.minStock),
        image: editProductForm.value.image,
        isFastSale: Boolean(editProductForm.value.isFastSale)
      });

      toastStore.info('Producto Actualizado', `Se guardaron los cambios de "${prodName}".`);
      showEditProductModal.value = false;
    }
  });
}

// 4. LÓGICA DE DAR DE BAJA Y REACTIVAR
function abrirConfirmarBaja(prod: RetailProduct) {
  productToDeactivate.value = prod;
  deactivateReasonText.value = 'Producto descontinuado por proveedor / cambio de empaque';
  showDeactivateModal.value = true;
}

function confirmarBajaProducto() {
  if (!productToDeactivate.value) return;

  const targetProd = productToDeactivate.value;
  const reason = deactivateReasonText.value;

  requestConfirmation({
    title: `¿Está seguro de dar de baja a "${targetProd.name}"?`,
    subtitle: 'El producto dejará de estar disponible para la venta en POS en todas las tiendas',
    message: 'Esta acción NO elimina el producto del historial ni de los reportes contables, únicamente lo desactiva operativamente.',
    details: {
      'Producto': targetProd.name,
      'SKU': targetProd.sku,
      'Motivo de baja': reason || 'Sin especificar'
    },
    type: 'danger',
    confirmText: 'Sí, dar de baja definitiva',
    onConfirm: () => {
      inventoryStore.toggleProductStatus(targetProd.id, reason);
      toastStore.warning(
        'Producto Dado de Baja',
        `"${targetProd.name}" ha sido dado de baja. Ya no aparecerá en terminales POS para venta.`
      );
      showDeactivateModal.value = false;
    }
  });
}

function reactivarProducto(prod: RetailProduct) {
  requestConfirmation({
    title: `¿Está seguro de reactivar a "${prod.name}"?`,
    subtitle: 'El producto volverá a habilitarse para la venta en terminales POS',
    message: 'El producto volverá a estar disponible con sus existencias registradas.',
    details: {
      'Producto': prod.name,
      'SKU': prod.sku,
      'Precio Venta': `S/ ${prod.price.toFixed(2)}`
    },
    type: 'primary',
    confirmText: 'Sí, reactivar producto',
    onConfirm: () => {
      inventoryStore.toggleProductStatus(prod.id);
      toastStore.success('Producto Reactivado', `"${prod.name}" vuelve a estar activo y disponible en el POS.`);
    }
  });
}

// 5. LÓGICA DE TRASLADO
function abrirModalTraslado() {
  if (activeProductsList.value.length > 0) {
    transferForm.value.productId = activeProductsList.value[0].id;
  }
  showTransferModal.value = true;
}

function ejecutarTraslado() {
  const prod = inventoryStore.products.find(p => p.id === transferForm.value.productId);
  const originName = branchStore.getBranchName(transferForm.value.originBranchId);
  const destName = branchStore.getBranchName(transferForm.value.destBranchId);
  const qty = transferForm.value.quantity;

  requestConfirmation({
    title: '¿Está seguro de realizar este traslado de mercadería?',
    subtitle: 'Se emitirá una Guía de Remisión Interna entre sucursales',
    message: `Se transferirán ${qty} unidades de "${prod?.name || 'Producto'}" desde ${originName} hacia ${destName}.`,
    details: {
      'Producto': prod?.name || 'Ítem',
      'Sede de Origen': originName,
      'Sede de Destino': destName,
      'Cantidad': `${qty} unidades`,
      'Responsable': transferForm.value.responsible
    },
    type: 'primary',
    confirmText: 'Sí, confirmar traslado',
    onConfirm: () => {
      const success = inventoryStore.transferStock(
        transferForm.value.originBranchId,
        transferForm.value.destBranchId,
        transferForm.value.productId,
        transferForm.value.quantity,
        transferForm.value.responsible
      );

      if (success) {
        toastStore.success(
          'Traslado Exitoso',
          `Se transfirieron ${transferForm.value.quantity} unidades correctamente. Guía de remisión emitida.`
        );
        showTransferModal.value = false;
      } else {
        toastStore.error('Stock Insuficiente', 'La sede origen no cuenta con la cantidad requerida.');
      }
    }
  });
}
</script>
