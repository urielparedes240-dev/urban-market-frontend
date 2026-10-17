<template>
  <div class="space-y-6">
    <!-- Header de Caja y Turno (Diferenciado para Admin vs Trabajador) -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner transition-colors"
          :class="
            authStore.isAdmin
              ? 'bg-slate-900'
              : posStore.isShiftOpen
                ? 'bg-retail-600'
                : 'bg-rose-600'
          "
        >
          <ClipboardDocumentCheckIcon
            v-if="authStore.isAdmin"
            class="w-6 h-6 text-retail-400"
          />
          <BanknotesIcon v-else class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">
              {{
                authStore.isAdmin
                  ? "Auditoría y Supervisión de Cajas"
                  : "Control de Turnos y Caja Chica"
              }}
            </h1>
            <!-- Badge para Admin -->
            <span
              v-if="authStore.isAdmin"
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5"
            >
              <ShieldCheckIcon class="w-3.5 h-3.5" />
              Modo Auditoría Centralizada (Admin no abre cajas)
            </span>
            <!-- Badge para Trabajador -->
            <span
              v-else
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border"
              :class="
                posStore.isShiftOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              "
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="
                  posStore.isShiftOpen
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-rose-500'
                "
              ></span>
              {{
                posStore.isShiftOpen
                  ? "Caja Abierta (Operativa)"
                  : "Caja Cerrada (POS Bloqueado)"
              }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{
              authStore.isAdmin
                ? "Supervisión en tiempo real de gavetas de dinero, turnos activos por sucursal y previsualización de arqueos Z."
                : "Gestión de apertura de caja, arqueo de turno y conciliación de efectivo de tu tienda asignada."
            }}
          </p>
        </div>
      </div>

      <!-- Acciones de Cabecera -->
      <div class="flex items-center gap-2.5">
        <!-- Si es Trabajador y tiene caja abierta: Botón para ir al POS -->
        <button
          v-if="authStore.isTrabajador && posStore.isShiftOpen"
          @click="irAlPos"
          class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-950 cursor-pointer"
        >
          <ShoppingCartIcon class="w-4 h-4 text-emerald-400" />
          <span>Ir a Cobrar (POS)</span>
        </button>

        <!-- Si es Trabajador y caja cerrada: Calculadora de Billetes -->
        <button
          v-if="authStore.isTrabajador && !posStore.isShiftOpen"
          @click="showBreakdownModal = true"
          class="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2 rounded-lg text-xs border border-slate-300 transition cursor-pointer"
        >
          <CalculatorIcon class="w-4 h-4 text-slate-500" />
          <span>Calculadora de Billetes</span>
        </button>

        <!-- Si es Admin: Filtro rápido de sede para auditoría -->
        <div
          v-if="authStore.isAdmin"
          class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
        >
          <BuildingStorefrontIcon class="w-4 h-4 text-slate-500" />
          <span class="font-semibold text-slate-600">Sede:</span>
          <select
            v-model="adminBranchFilter"
            class="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Sedes</option>
            <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VISTA EXCLUSIVA PARA ADMINISTRADOR: PANEL DE AUDITORÍA Y MONITOREO DE CAJAS -->
    <!-- ========================================================================= -->
    <div v-if="authStore.isAdmin" class="space-y-6">
      <!-- Banner Informativo Institucional -->
      <div
        class="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-3">
          <ShieldCheckIcon class="w-6 h-6 text-retail-400 shrink-0 mt-0.5" />
          <div>
            <h3 class="font-bold text-sm text-white">
              Segregación de Funciones: Auditoría Externa
            </h3>
            <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Como Gerente General / Administrador, tu rol es supervisar la
              integridad de los fondos y auditar los cierres de turno de cada
              tienda.
              <strong
                >Las aperturas de turno y las ventas son operadas exclusivamente
                por los cajeros asignados en sus respectivas sedes.</strong
              >
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span
            class="text-xs bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700 font-mono font-bold"
          >
            {{ activeBoxesList.length }} Cajas Activas en Red
          </span>
        </div>
      </div>

      <!-- Tarjetas de Monitoreo de Cajas Activas por Sede -->
      <div>
        <h2
          class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"
        >
          <BuildingStorefrontIcon class="w-4 h-4 text-retail-600" />
          Estado en Vivo de las Cajas por Sucursal
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="caja in filteredBoxesList"
            :key="caja.id"
            class="bg-white rounded-xl border p-4 shadow-sm space-y-3 transition hover:shadow-md"
            :class="
              caja.status === 'open'
                ? 'border-emerald-200 ring-1 ring-emerald-500/20'
                : 'border-slate-200'
            "
          >
            <div class="flex items-center justify-between">
              <div>
                <span
                  class="text-[10px] font-bold uppercase text-slate-400 font-mono"
                  >{{ caja.terminalCode }}</span
                >
                <h3 class="font-bold text-slate-900 text-xs line-clamp-1">
                  {{ caja.branchName }}
                </h3>
              </div>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                :class="
                  caja.status === 'open'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    caja.status === 'open'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-400'
                  "
                ></span>
                {{ caja.status === "open" ? "Abierta" : "Cerrada" }}
              </span>
            </div>

            <!-- Detalles del Cajero en Turno -->
            <div
              class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1"
            >
              <div class="flex justify-between text-slate-600 text-[11px]">
                <span>Cajero(a):</span>
                <span class="font-semibold text-slate-900">{{
                  caja.cashierName
                }}</span>
              </div>
              <div class="flex justify-between text-slate-600 text-[11px]">
                <span>Turno / Inicio:</span>
                <span class="capitalize"
                  >{{ caja.turn }} • {{ caja.openingTime }}</span
                >
              </div>
            </div>

            <!-- Métricas Financieras de la Caja -->
            <div class="space-y-1 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Fondo Inicial:</span>
                <span class="font-mono font-medium"
                  >S/ {{ caja.initialCash.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between text-slate-700">
                <span>Ventas Efectivo:</span>
                <span class="font-mono font-bold text-emerald-700"
                  >+ S/ {{ caja.cashSales.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Tarjeta / Yape:</span>
                <span class="font-mono"
                  >+ S/
                  {{ (caja.cardSales + caja.yapePlinSales).toFixed(2) }}</span
                >
              </div>
              <div
                class="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1"
              >
                <span>Esperado en Gaveta:</span>
                <span class="font-mono text-emerald-800"
                  >S/ {{ caja.expectedCash.toFixed(2) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VISTA PARA TRABAJADOR (CAJERO): APERTURA O CIERRE DE TURNO -->
    <!-- ========================================================================= -->
    <div v-else>
      <!-- CASO 1: CAJA CERRADA -> FORMULARIO DE APERTURA DE TURNO -->
      <div
        v-if="!posStore.isShiftOpen"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Columna Principal: Formulario de Inicio -->
        <div
          class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6"
        >
          <div class="border-b border-slate-100 pb-4">
            <h2
              class="text-base font-semibold text-slate-900 flex items-center gap-2"
            >
              <LockClosedIcon class="w-5 h-5 text-amber-500" />
              Formulario de Apertura de Turno (Inicio de Caja)
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Para habilitar el Punto de Venta (POS) y emitir comprobantes,
              debes registrar el fondo inicial asignado a tu gaveta.
            </p>
          </div>

          <form @submit.prevent="handleAbrirCaja" class="space-y-5">
            <!-- Datos fijos del usuario y sucursal -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1"
                  >Cajero Responsable</label
                >
                <div
                  class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800"
                >
                  <UserCircleIcon class="w-5 h-5 text-slate-400" />
                  <span class="font-medium">{{
                    authStore.currentUser?.name
                  }}</span>
                  <span class="text-[11px] text-slate-500"
                    >({{ authStore.currentUser?.dni }})</span
                  >
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1"
                  >Sede / Sucursal Asignada</label
                >
                <div
                  class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800"
                >
                  <BuildingStorefrontIcon class="w-5 h-5 text-retail-600" />
                  <span class="font-medium">{{
                    authStore.userBranchName
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Selector de Turno -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2"
                >Turno Laboral</label
              >
              <div class="grid grid-cols-3 gap-3">
                <label
                  v-for="t in turnosDisponibles"
                  :key="t.id"
                  class="flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition text-center"
                  :class="
                    selectedTurn === t.id
                      ? 'border-retail-500 bg-retail-50/60 ring-1 ring-retail-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  "
                >
                  <input
                    type="radio"
                    v-model="selectedTurn"
                    :value="t.id"
                    class="sr-only"
                  />
                  <component
                    :is="t.icon"
                    class="w-5 h-5 mb-1"
                    :class="
                      selectedTurn === t.id
                        ? 'text-retail-600'
                        : 'text-slate-400'
                    "
                  />
                  <span class="text-xs font-semibold text-slate-800">{{
                    t.label
                  }}</span>
                  <span class="text-[10px] text-slate-500">{{
                    t.horario
                  }}</span>
                </label>
              </div>
            </div>

            <!-- Monto Inicial en Efectivo -->
            <div
              class="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <label
                    class="block text-xs font-bold text-amber-900 uppercase tracking-wide"
                  >
                    Monto Inicial en Efectivo (Sencillo de Apertura)
                  </label>
                  <p class="text-[11px] text-amber-700">
                    Total de dinero físico en monedas y billetes entregado al
                    cajero.
                  </p>
                </div>
                <button
                  type="button"
                  @click="showBreakdownModal = true"
                  class="text-xs text-amber-800 font-semibold underline hover:text-amber-950 cursor-pointer"
                >
                  Desglosar monedas/billetes
                </button>
              </div>

              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500 text-lg"
                >
                  S/
                </span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  v-model.number="initialCashAmount"
                  class="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 text-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  placeholder="250.00"
                  required
                />
              </div>

              <!-- Accesos rápidos de monto -->
              <div class="flex items-center gap-2 pt-1">
                <span class="text-[11px] text-slate-500">Montos rápidos:</span>
                <button
                  v-for="preset in [150, 200, 250, 300]"
                  :key="preset"
                  type="button"
                  @click="initialCashAmount = preset"
                  class="px-2.5 py-0.5 rounded bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-retail-500 hover:text-retail-700 transition cursor-pointer"
                >
                  S/ {{ preset }}.00
                </button>
              </div>
            </div>

            <!-- Observaciones opcionales -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1"
                >Observaciones / Notas (Opcional)</label
              >
              <textarea
                v-model="openingNotes"
                rows="2"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-retail-500 focus:outline-none"
                placeholder="Ej: Gaveta N° 2 asignada. Sin billetes de S/ 100 en fondo inicial."
              ></textarea>
            </div>

            <!-- Botón de Acción Principal -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 focus:ring-slate-950 cursor-pointer"
              >
                <CheckCircleIcon class="w-5 h-5 text-emerald-400" />
                <span>Abrir Caja / Iniciar Turno</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Columna Lateral: Estado e Información de Seguridad -->
        <div class="space-y-4">
          <div
            class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
          >
            <h3
              class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
            >
              <ShieldCheckIcon class="w-4 h-4 text-retail-600" />
              Políticas de Control de Caja
            </h3>
            <ul class="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li class="flex items-start gap-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-retail-500 mt-1.5 shrink-0"
                ></span>
                <span
                  ><strong>Módulo POS Bloqueado:</strong> No se pueden realizar
                  cobros ni generar tickets hasta que la apertura quede
                  registrada con fecha y hora.</span
                >
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-retail-500 mt-1.5 shrink-0"
                ></span>
                <span
                  ><strong>Custodia Individual:</strong> Cada cajero es
                  responsable único de las diferencias o faltantes detectados al
                  cierre de turno.</span
                >
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-retail-500 mt-1.5 shrink-0"
                ></span>
                <span
                  ><strong>Auditoría Centralizada:</strong> Toda venta en
                  efectivo, tarjeta o billeteras móviles queda registrada para
                  el reporte Z gerencial.</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- CASO 2: CAJA ABIERTA -> PANEL EN VIVO Y ARQUEO / CIERRE DE TURNO -->
      <div v-else class="space-y-6">
        <!-- Tarjetas de Resumen en Vivo del Turno -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <span class="text-[10px] font-semibold text-slate-400 uppercase"
              >Fondo Inicial</span
            >
            <p class="text-lg font-bold text-slate-900 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.initialCash.toFixed(2) }}
            </p>
            <span class="text-[10px] text-slate-500">Apertura</span>
          </div>

          <div
            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <span class="text-[10px] font-semibold text-emerald-600 uppercase"
              >Ventas Efectivo</span
            >
            <p class="text-lg font-bold text-emerald-700 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.cashSales.toFixed(2) }}
            </p>
            <span class="text-[10px] text-slate-500">En gaveta</span>
          </div>

          <div
            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <span class="text-[10px] font-semibold text-blue-600 uppercase"
              >Ventas Tarjeta</span
            >
            <p class="text-lg font-bold text-blue-700 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.cardSales.toFixed(2) }}
            </p>
            <span class="text-[10px] text-slate-500">Voucher POS</span>
          </div>

          <div
            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <span class="text-[10px] font-semibold text-purple-600 uppercase"
              >Yape / Plin</span
            >
            <p class="text-lg font-bold text-purple-700 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.yapePlinSales.toFixed(2) }}
            </p>
            <span class="text-[10px] text-slate-500">Billeteras</span>
          </div>

          <div
            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <span class="text-[10px] font-semibold text-slate-400 uppercase"
              >Total Ventas</span
            >
            <p class="text-lg font-bold text-slate-900 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.totalSales.toFixed(2) }}
            </p>
            <span class="text-[10px] text-slate-500"
              >{{ posStore.activeShift?.transactionsCount }} transacciones</span
            >
          </div>

          <div
            class="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm"
          >
            <span class="text-[10px] font-bold text-emerald-800 uppercase"
              >Esperado en Caja</span
            >
            <p class="text-lg font-bold text-emerald-900 font-mono mt-0.5">
              S/ {{ posStore.activeShift?.expectedCash.toFixed(2) }}
            </p>
            <span class="text-[10px] text-emerald-700">Fondo + Efectivo</span>
          </div>
        </div>

        <!-- Sección de Arqueo y Cierre de Turno -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-4"
            >
              <div>
                <h2
                  class="text-base font-bold text-slate-900 flex items-center gap-2"
                >
                  <CalculatorIcon class="w-5 h-5 text-retail-600" />
                  Arqueo de Turno y Cuadre de Caja
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  Ingresa el conteo físico del dinero en gaveta para verificar
                  que coincida con el total esperado.
                </p>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-400">Inicio de Turno:</span>
                <p class="text-xs font-mono font-semibold text-slate-700">
                  {{ posStore.activeShift?.openingTime }}
                </p>
              </div>
            </div>

            <form @submit.prevent="handleCerrarCaja" class="space-y-5">
              <!-- Ingreso del efectivo físico contado -->
              <div
                class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
              >
                <label
                  class="block text-xs font-bold text-slate-800 uppercase tracking-wide"
                >
                  Efectivo Físico Contado en Gaveta (Soles)
                </label>
                <div class="relative">
                  <span
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500 text-lg"
                  >
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    v-model.number="actualCashInput"
                    class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xl focus:ring-2 focus:ring-retail-500 focus:outline-none font-mono"
                    :placeholder="
                      (posStore.activeShift?.expectedCash || 0).toFixed(2)
                    "
                    required
                  />
                </div>

                <!-- Cálculo de Diferencia en Vivo -->
                <div
                  v-if="actualCashInput !== null"
                  class="p-3 rounded-lg border flex items-center justify-between text-xs"
                  :class="cuadreStyle"
                >
                  <div class="flex items-center gap-2">
                    <component :is="cuadreIcon" class="w-5 h-5" />
                    <div>
                      <span class="font-bold">{{ cuadreTitle }}</span>
                      <p class="text-[11px] opacity-80">{{ cuadreDesc }}</p>
                    </div>
                  </div>
                  <div class="text-right font-mono font-bold text-sm">
                    <span
                      >{{ computedDifference >= 0 ? "+" : "" }}S/
                      {{ computedDifference.toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Notas de cierre -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1"
                  >Notas de Cierre / Justificación de Descuadre (Si
                  aplica)</label
                >
                <textarea
                  v-model="closingNotes"
                  rows="2"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-retail-500 focus:outline-none"
                  placeholder="Ej: Conforme con el total. Se entrega sobre sellado a administración."
                ></textarea>
              </div>

              <!-- Botones de Acción -->
              <div class="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm focus:ring-4 focus:ring-rose-500/20 cursor-pointer"
                >
                  <LockClosedIcon class="w-4 h-4" />
                  <span>Cerrar Caja y Generar Reporte de Turno</span>
                </button>

                <button
                  type="button"
                  @click="irAlPos"
                  class="bg-retail-50 hover:bg-retail-100 text-retail-700 font-semibold py-3 px-5 rounded-xl border border-retail-200 transition text-sm flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCartIcon class="w-4 h-4" />
                  <span>Continuar Vendiendo</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Movimientos de Caja del Turno Actual -->
          <div
            class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <h3
                class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between"
              >
                <span class="flex items-center gap-1.5">
                  <ClockIcon class="w-4 h-4 text-slate-500" />
                  Movimientos de este Turno
                </span>
                <span
                  class="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold"
                >
                  {{ posStore.activeShift?.movements.length || 0 }} reg
                </span>
              </h3>

              <div
                class="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1"
              >
                <div
                  v-for="mov in posStore.activeShift?.movements"
                  :key="mov.id"
                  class="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p class="font-medium text-slate-800">
                      {{ mov.description }}
                    </p>
                    <span class="text-[10px] text-slate-400 font-mono">{{
                      mov.time
                    }}</span>
                  </div>
                  <div class="text-right">
                    <span
                      class="font-mono font-bold"
                      :class="
                        mov.type === 'retiro'
                          ? 'text-rose-600'
                          : 'text-slate-900'
                      "
                    >
                      {{ mov.type === "retiro" ? "-" : "+" }}S/
                      {{ mov.amount.toFixed(2) }}
                    </span>
                    <p class="text-[10px] text-slate-400 capitalize">
                      {{ mov.method }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TABLA DE HISTORIAL DE TURNOS CERRADOS (CON PREVISUALIZACIÓN ANTES DE DESCARGAR) -->
    <!-- ========================================================================= -->
    <div
      class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 pb-3"
      >
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardDocumentListIcon class="w-4 h-4 text-slate-500" />
            Historial de Cierres de Turno (Reportes Z)
          </h2>
          <p class="text-xs text-slate-500">
            Auditoría completa de turnos anteriores con previsualización de
            arqueo.
          </p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead
            class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200"
          >
            <tr>
              <th class="py-2.5 px-3">Turno / Fecha</th>
              <th class="py-2.5 px-3">Cajero</th>
              <th class="py-2.5 px-3">Sede</th>
              <th class="py-2.5 px-3 text-right">Fondo Apertura</th>
              <th class="py-2.5 px-3 text-right">Ventas Efectivo</th>
              <th class="py-2.5 px-3 text-right">Ventas Tarjeta</th>
              <th class="py-2.5 px-3 text-right">Total Turno</th>
              <th class="py-2.5 px-3 text-right">Diferencia</th>
              <th class="py-2.5 px-3 text-center">Estado</th>
              <th class="py-2.5 px-3 text-center">Auditoría / Previsualizar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="sh in posStore.shiftHistory"
              :key="sh.id"
              class="hover:bg-slate-50/80 transition"
            >
              <td class="py-3 px-3">
                <span class="font-bold text-slate-900 capitalize">{{
                  sh.turn
                }}</span>
                <p class="text-[10px] text-slate-400 font-mono">
                  {{ sh.openingTime }}
                </p>
              </td>
              <td class="py-3 px-3 font-medium">{{ sh.cashierName }}</td>
              <td class="py-3 px-3">{{ sh.branchName }}</td>
              <td class="py-3 px-3 text-right font-mono">
                S/ {{ sh.initialCash.toFixed(2) }}
              </td>
              <td class="py-3 px-3 text-right font-mono text-emerald-700">
                S/ {{ sh.cashSales.toFixed(2) }}
              </td>
              <td class="py-3 px-3 text-right font-mono text-blue-700">
                S/ {{ sh.cardSales.toFixed(2) }}
              </td>
              <td
                class="py-3 px-3 text-right font-mono font-bold text-slate-900"
              >
                S/ {{ sh.totalSales.toFixed(2) }}
              </td>
              <td
                class="py-3 px-3 text-right font-mono font-semibold"
                :class="getDiffClass(sh.difference)"
              >
                {{ (sh.difference || 0) >= 0 ? "+" : "" }}S/
                {{ (sh.difference || 0).toFixed(2) }}
              </td>
              <td class="py-3 px-3 text-center">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  CERRADO
                </span>
              </td>
              <td class="py-3 px-3 text-center">
                <button
                  @click="previsualizarReporteZ(sh)"
                  class="inline-flex items-center gap-1 text-retail-600 hover:text-retail-800 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition cursor-pointer"
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

    <!-- MODAL DE PREVISUALIZACIÓN DE REPORTE Z ANTES DE DESCARGAR O IMPRIMIR -->
    <div
      v-if="selectedReportToShow"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <!-- Header modal con badge de vista previa -->
        <div
          class="flex items-center justify-between border-b border-slate-200 pb-3"
        >
          <div class="flex items-center gap-2">
            <EyeIcon class="w-5 h-5 text-retail-600" />
            <div>
              <h3 class="font-bold text-sm text-slate-900">
                Previsualización de Reporte Z de Cierre
              </h3>
              <p class="text-[10px] text-slate-500">
                Revisa todos los datos antes de imprimir o descargar.
              </p>
            </div>
          </div>
          <button
            @click="selectedReportToShow = null"
            class="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Hoja de Estilo Ticket / Documento Previsualizado -->
        <div
          class="border border-slate-300 rounded-xl p-5 bg-slate-50 font-mono text-xs space-y-4 shadow-inner"
        >
          <div
            class="text-center border-b border-dashed border-slate-300 pb-3 space-y-1"
          >
            <p class="font-bold text-sm tracking-wider text-slate-900">
              Urba Market E.I.R.L
            </p>
            <p class="text-[10px] text-slate-500">
              RUC: 20601234567 • CADENA MULTI-SEDE
            </p>
            <p
              class="text-[10px] font-bold text-slate-700 uppercase bg-slate-200 inline-block px-2 py-0.5 rounded"
            >
              REPORTE Z - AUDITORÍA DE TURNO
            </p>
            <p class="text-[11px] font-semibold text-slate-800">
              {{ selectedReportToShow.branchName }}
            </p>
          </div>

          <div
            class="space-y-1 text-slate-700 text-[11px] border-b border-dashed border-slate-300 pb-3"
          >
            <div class="flex justify-between">
              <span>Turno:</span
              ><span class="font-bold capitalize">{{
                selectedReportToShow.turn
              }}</span>
            </div>
            <div class="flex justify-between">
              <span>Cajero(a) Titular:</span
              ><span>{{ selectedReportToShow.cashierName }}</span>
            </div>
            <div class="flex justify-between">
              <span>Hora Apertura:</span
              ><span>{{ selectedReportToShow.openingTime }}</span>
            </div>
            <div class="flex justify-between">
              <span>Hora Cierre:</span
              ><span>{{
                selectedReportToShow.closingTime || "2026-09-24 15:05"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span>Transacciones Emitidas:</span
              ><span
                >{{ selectedReportToShow.transactionsCount }} comprobantes</span
              >
            </div>
          </div>

          <!-- Desglose de ingresos -->
          <div
            class="space-y-1.5 text-slate-800 text-[11px] border-b border-dashed border-slate-300 pb-3"
          >
            <div class="flex justify-between">
              <span>(+) Fondo Inicial de Gaveta:</span
              ><span>S/ {{ selectedReportToShow.initialCash.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-semibold text-emerald-800">
              <span>(+) Cobros en Efectivo:</span
              ><span>S/ {{ selectedReportToShow.cashSales.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>(+) Cobros con Tarjeta (POS):</span
              ><span>S/ {{ selectedReportToShow.cardSales.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>(+) Cobros Yape / Plin:</span
              ><span
                >S/ {{ selectedReportToShow.yapePlinSales.toFixed(2) }}</span
              >
            </div>
            <div
              class="flex justify-between text-xs font-bold border-t border-slate-300 pt-1 text-slate-900"
            >
              <span>TOTAL VENTAS DEL TURNO:</span>
              <span>S/ {{ selectedReportToShow.totalSales.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Arqueo físico y Cuadre -->
          <div
            class="space-y-1 text-slate-800 text-[11px] border-b border-dashed border-slate-300 pb-3 bg-white p-2.5 rounded-lg border border-slate-200"
          >
            <div class="flex justify-between">
              <span>Efectivo Esperado en Gaveta:</span
              ><span class="font-bold"
                >S/ {{ selectedReportToShow.expectedCash.toFixed(2) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>Efectivo Contado por Cajero:</span
              ><span class="font-bold"
                >S/
                {{
                  (selectedReportToShow.actualCashCount || 0).toFixed(2)
                }}</span
              >
            </div>
            <div
              class="flex justify-between font-bold text-xs"
              :class="getDiffClass(selectedReportToShow.difference)"
            >
              <span>RESULTADO DE CUADRE:</span>
              <span
                >{{ (selectedReportToShow.difference || 0) >= 0 ? "+" : "" }}S/
                {{ (selectedReportToShow.difference || 0).toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="text-[10px] text-slate-500 italic bg-white p-2 rounded">
            <strong>Observaciones de Turno:</strong>
            {{
              selectedReportToShow.notes ||
              "Turno cerrado sin novedades. Cuadre exacto verificado por supervisor."
            }}
          </div>
        </div>

        <!-- Botones de Acción posteriores a la previsualización -->
        <div
          class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100"
        >
          <button
            @click="selectedReportToShow = null"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
          >
            Cerrar Vista Previa
          </button>

          <button
            @click="descargarPdfReporte"
            class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>

          <button
            @click="imprimirReporte"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <PrinterIcon class="w-4 h-4" />
            <span>Imprimir Ticket Z</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE DESGLOSE DE MONEDAS Y BILLETES -->
    <div
      v-if="showBreakdownModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-3"
        >
          <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CalculatorIcon class="w-5 h-5 text-retail-600" />
            Calculadora de Billetes y Monedas
          </h3>
          <button
            @click="showBreakdownModal = false"
            class="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div
          class="grid grid-cols-2 gap-3 text-xs max-h-72 overflow-y-auto pr-1"
        >
          <div
            v-for="denom in denominaciones"
            :key="denom.valor"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
          >
            <span class="font-semibold text-slate-700">{{ denom.label }}</span>
            <div class="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                v-model.number="denom.cantidad"
                class="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono font-bold text-xs"
              />
              <span class="text-[10px] text-slate-400">cant</span>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl"
        >
          <span class="text-xs font-bold text-emerald-900">Total Sumado:</span>
          <span class="text-lg font-bold text-emerald-800 font-mono"
            >S/ {{ sumaDesglose.toFixed(2) }}</span
          >
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showBreakdownModal = false"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="aplicarDesglose"
            class="px-4 py-2 text-xs font-bold bg-retail-600 hover:bg-retail-700 text-white rounded-lg shadow-sm cursor-pointer"
          >
            Aplicar S/ {{ sumaDesglose.toFixed(2) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { usePosStore } from "../stores/posStore";
import { useBranchStore } from "../stores/branchStore";
import { useToastStore } from "../stores/toastStore";
import type { ShiftTurn, ShiftTurnReport } from "../types";
import {
  BanknotesIcon,
  ShoppingCartIcon,
  CalculatorIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  SunIcon,
  CloudIcon,
  MoonIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();
const posStore = usePosStore();
const branchStore = useBranchStore();
const toastStore = useToastStore();

// Filtro de sede para Admin
const adminBranchFilter = ref<string>("all");

// Formulario de apertura para Cajero
const selectedTurn = ref<ShiftTurn>("mañana");
const initialCashAmount = ref<number>(250.0);
const openingNotes = ref<string>("");

// Formulario de cierre para Cajero
const actualCashInput = ref<number | null>(null);
const closingNotes = ref<string>("");
const selectedReportToShow = ref<ShiftTurnReport | null>(null);
const showBreakdownModal = ref<boolean>(false);

const turnosDisponibles = [
  {
    id: "mañana" as ShiftTurn,
    label: "Mañana",
    horario: "07:00 - 15:00",
    icon: SunIcon,
  },
  {
    id: "tarde" as ShiftTurn,
    label: "Tarde",
    horario: "15:00 - 23:00",
    icon: CloudIcon,
  },
  {
    id: "noche" as ShiftTurn,
    label: "Noche",
    horario: "23:00 - 07:00",
    icon: MoonIcon,
  },
];

// Cajas activas en la red de minimarkets para vista del Admin
const activeBoxesList = computed(() => {
  const currentPosSales = posStore.activeShift?.totalSales || 0;
  return [
    {
      id: "box-01",
      branchId: "sede-miraflores",
      branchName: "Sede Miraflores (Principal)",
      terminalCode: "TERM-MIRA-01",
      cashierName: "Jorge Quispe Cárdenas",
      turn: "mañana",
      openingTime: "07:02",
      initialCash: 250.0,
      cashSales:
        1845.5 + (posStore.isShiftOpen ? posStore.activeShift!.cashSales : 0),
      cardSales:
        2120.0 + (posStore.isShiftOpen ? posStore.activeShift!.cardSales : 0),
      yapePlinSales:
        940.0 +
        (posStore.isShiftOpen ? posStore.activeShift!.yapePlinSales : 0),
      expectedCash:
        2095.5 + (posStore.isShiftOpen ? posStore.activeShift!.cashSales : 0),
      status: "open",
    },
    {
      id: "box-02",
      branchId: "sede-san-isidro",
      branchName: "Sede San Isidro",
      terminalCode: "TERM-SANI-01",
      cashierName: "Ana Lucía Morales",
      turn: "tarde",
      openingTime: "15:00",
      initialCash: 200.0,
      cashSales: 1420.0,
      cardSales: 1890.0,
      yapePlinSales: 650.0,
      expectedCash: 1620.0,
      status: "open",
    },
    {
      id: "box-03",
      branchId: "sede-surco",
      branchName: "Sede Surco",
      terminalCode: "TERM-SURC-01",
      cashierName: "David Huamán Ramos",
      turn: "mañana",
      openingTime: "07:05",
      initialCash: 200.0,
      cashSales: 1650.0,
      cardSales: 1540.0,
      yapePlinSales: 780.0,
      expectedCash: 1850.0,
      status: "open",
    },
    {
      id: "box-04",
      branchId: "sede-los-olivos",
      branchName: "Sede Los Olivos",
      terminalCode: "TERM-LOSO-01",
      cashierName: "Carla Zambrano Solís",
      turn: "tarde",
      openingTime: "15:10",
      initialCash: 200.0,
      cashSales: 1280.0,
      cardSales: 1390.0,
      yapePlinSales: 540.0,
      expectedCash: 1480.0,
      status: "open",
    },
  ];
});

const filteredBoxesList = computed(() => {
  if (adminBranchFilter.value === "all") return activeBoxesList.value;
  return activeBoxesList.value.filter(
    (b) => b.branchId === adminBranchFilter.value,
  );
});

// Calculadora de desglose
const denominaciones = ref([
  { label: "Billete S/ 100", valor: 100, cantidad: 1 },
  { label: "Billete S/ 50", valor: 50, cantidad: 2 },
  { label: "Billete S/ 20", valor: 20, cantidad: 2 },
  { label: "Billete S/ 10", valor: 10, cantidad: 1 },
  { label: "Moneda S/ 5", valor: 5, cantidad: 0 },
  { label: "Moneda S/ 2", valor: 2, cantidad: 0 },
  { label: "Moneda S/ 1", valor: 1, cantidad: 0 },
  { label: "Moneda S/ 0.50", valor: 0.5, cantidad: 0 },
]);

const sumaDesglose = computed(() => {
  return denominaciones.value.reduce(
    (acc, item) => acc + item.valor * (item.cantidad || 0),
    0,
  );
});

function aplicarDesglose() {
  initialCashAmount.value = Number(sumaDesglose.value.toFixed(2));
  showBreakdownModal.value = false;
  toastStore.info(
    "Desglose Calculado",
    `Fondo inicial fijado en S/ ${initialCashAmount.value.toFixed(2)}.`,
  );
}

// Cálculo de Diferencia en Cierre
const computedDifference = computed(() => {
  if (actualCashInput.value === null || !posStore.activeShift) return 0;
  return Number(
    (actualCashInput.value - posStore.activeShift.expectedCash).toFixed(2),
  );
});

const cuadreTitle = computed(() => {
  if (computedDifference.value === 0) return "Cuadre Conforme (Exacto)";
  if (computedDifference.value < 0) return "Faltante en Caja";
  return "Sobrante en Caja";
});

const cuadreDesc = computed(() => {
  if (computedDifference.value === 0)
    return "El efectivo físico contado coincide exactamente con el sistema.";
  if (computedDifference.value < 0)
    return "Hay menos dinero del esperado según ventas y fondo inicial.";
  return "Hay más dinero en gaveta que el esperado en el registro.";
});

const cuadreStyle = computed(() => {
  if (computedDifference.value === 0)
    return "bg-emerald-50 border-emerald-200 text-emerald-800";
  if (computedDifference.value < 0)
    return "bg-rose-50 border-rose-200 text-rose-800";
  return "bg-blue-50 border-blue-200 text-blue-800";
});

const cuadreIcon = computed(() => {
  if (computedDifference.value === 0) return CheckCircleIcon;
  return ExclamationCircleIcon;
});

function getDiffClass(diff?: number) {
  if (!diff || diff === 0) return "text-emerald-700";
  if (diff < 0) return "text-rose-600";
  return "text-blue-700";
}

function handleAbrirCaja() {
  if (initialCashAmount.value < 0) {
    toastStore.warning(
      "Monto Inválido",
      "El monto inicial no puede ser negativo.",
    );
    return;
  }

  posStore.abrirCaja({
    initialCash: initialCashAmount.value,
    turn: selectedTurn.value,
    notes: openingNotes.value,
  });

  toastStore.success(
    "Caja Aperturada con Éxito",
    `Turno ${selectedTurn.value.toUpperCase()} iniciado en ${authStore.userBranchName} con fondo de S/ ${initialCashAmount.value.toFixed(2)}. Módulo POS desbloqueado.`,
  );

  actualCashInput.value = posStore.activeShift?.expectedCash ?? 0;
}

function handleCerrarCaja() {
  if (actualCashInput.value === null) {
    toastStore.warning(
      "Requerido",
      "Debes ingresar el conteo físico de la gaveta.",
    );
    return;
  }

  const report = posStore.cerrarCaja({
    actualCashCount: actualCashInput.value,
    notes: closingNotes.value,
  });

  if (report) {
    selectedReportToShow.value = report;
    toastStore.info(
      "Turno Cerrado",
      `Se ha generado el Reporte Z de la caja. El punto de venta ha quedado bloqueado.`,
    );
  }
}

function irAlPos() {
  router.push("/pos");
}

function previsualizarReporteZ(report: ShiftTurnReport) {
  selectedReportToShow.value = report;
}

function imprimirReporte() {
  window.print();
}

function descargarPdfReporte() {
  toastStore.success(
    "Descarga de Reporte Z",
    `Generando y descargando PDF para el turno ${selectedReportToShow.value?.turn} (${selectedReportToShow.value?.branchName}).`,
  );
}
</script>
