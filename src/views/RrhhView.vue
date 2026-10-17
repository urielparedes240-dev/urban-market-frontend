<template>
  <div class="space-y-6">
    <!-- Header RRHH y Planillas -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-inner">
          <UserGroupIcon class="w-6 h-6 text-retail-400" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Recursos Humanos, Planillas & Boletas</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Gestión Laboral & AFP/EsSalud
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Padrón de colaboradores, emisión de boletas electrónicas de pago, retenciones previsionales y control de sedes.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="showNewWorkerModal = true"
          class="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-950 cursor-pointer"
        >
          <UserPlusIcon class="w-4 h-4" />
          <span>+ Nuevo Colaborador</span>
        </button>
      </div>
    </div>

    <!-- Pestañas Principales: Padrón vs Boletas y Planilla -->
    <div class="flex border-b border-slate-200 gap-2">
      <button
        @click="activeTab = 'workers'"
        class="pb-3 px-4 text-xs font-bold transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
        :class="activeTab === 'workers' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
      >
        <UserGroupIcon class="w-4 h-4" />
        <span>Padrón de Colaboradores ({{ workers.length }})</span>
      </button>

      <button
        @click="activeTab = 'payslips'"
        class="pb-3 px-4 text-xs font-bold transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
        :class="activeTab === 'payslips' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
      >
        <DocumentCheckIcon class="w-4 h-4" />
        <span>Planilla & Boletas Electrónicas ({{ payslips.length }})</span>
      </button>
    </div>

    <!-- TAB 1: PADRÓN DE COLABORADORES CON INTEGRACIÓN AFP / ESSALUD -->
    <div v-if="activeTab === 'workers'" class="space-y-4">
      <!-- Tarjetas de Resumen RRHH -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 uppercase">Trabajadores Activos</span>
          <p class="text-2xl font-bold text-slate-900 font-mono mt-1">{{ activeWorkersCount }} colaboradores</p>
          <span class="text-[11px] text-slate-400">{{ inactiveWorkersCount }} cesados / dados de baja</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 uppercase">Planilla Bruta Mensual</span>
          <p class="text-2xl font-bold text-emerald-700 font-mono mt-1">S/ {{ totalGrossPayroll.toFixed(2) }}</p>
          <span class="text-[11px] text-emerald-600">Sueldos básicos + Asig. familiar</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-purple-700 uppercase">Aporte Empleador EsSalud (9%)</span>
          <p class="text-2xl font-bold text-purple-700 font-mono mt-1">S/ {{ totalEssaludAporte.toFixed(2) }}</p>
          <span class="text-[11px] text-purple-600 font-medium">Prestaciones de salud Ley 26790</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-blue-700 uppercase">Retención AFP / ONP</span>
          <p class="text-2xl font-bold text-blue-700 font-mono mt-1">S/ {{ totalRetencionesAfp.toFixed(2) }}</p>
          <span class="text-[11px] text-blue-600 font-medium">Aportes a fondo de jubilación</span>
        </div>
      </div>

      <!-- Tabla de Trabajadores -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="relative min-w-[240px]">
              <input
                v-model="workerSearchQuery"
                type="text"
                placeholder="Buscar por DNI, nombre o cargo..."
                class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150"
              />
              <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              v-model="workerBranchFilter"
              class="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150 cursor-pointer font-medium"
            >
              <option value="all">Todas las Sedes</option>
              <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>

          <div class="text-xs text-slate-500">
            Mostrando <strong>{{ filteredWorkers.length }}</strong> de <strong>{{ workers.length }}</strong> colaboradores
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Colaborador / DNI</th>
                <th class="py-2.5 px-3">Cargo & Turno</th>
                <th class="py-2.5 px-3">Sede Asignada</th>
                <th class="py-2.5 px-3">Previsión (AFP/ONP)</th>
                <th class="py-2.5 px-3 text-right">Sueldo Básico</th>
                <th class="py-2.5 px-3 text-right">Asig. Fam.</th>
                <th class="py-2.5 px-3 text-right">EsSalud 9%</th>
                <th class="py-2.5 px-3 text-center">Estado</th>
                <th class="py-2.5 px-3 text-center min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr 
                v-for="w in filteredWorkers" 
                :key="w.id" 
                class="hover:bg-slate-50/80 transition"
                :class="w.status === 'Cesado' ? 'bg-slate-50/70 opacity-70' : ''"
              >
                <!-- Nombre y DNI -->
                <td class="py-3 px-3">
                  <span class="font-bold text-slate-900">{{ w.fullName }}</span>
                  <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>DNI: {{ w.dni }}</span>
                    <span>•</span>
                    <span>{{ w.phone }}</span>
                  </div>
                </td>

                <!-- Cargo y Turno -->
                <td class="py-3 px-3">
                  <span class="font-medium text-slate-800">{{ w.jobTitle }}</span>
                  <span class="block text-[10px] text-slate-500 capitalize">Turno: {{ w.shift }}</span>
                </td>

                <!-- Sede Asignada -->
                <td class="py-3 px-3">
                  <span class="font-semibold text-slate-800">{{ branchStore.getBranchName(w.branchId) }}</span>
                </td>

                <!-- Sistema de Pensiones -->
                <td class="py-3 px-3">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="w.pensionSystem === 'ONP' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'"
                  >
                    {{ w.pensionSystem }}
                  </span>
                  <p v-if="w.cuspp" class="text-[9px] text-slate-400 font-mono mt-0.5">CUSPP: {{ w.cuspp }}</p>
                </td>

                <!-- Sueldo Básico -->
                <td class="py-3 px-3 text-right font-mono font-bold text-slate-900">
                  S/ {{ w.salary.toFixed(2) }}
                </td>

                <!-- Asignación Familiar -->
                <td class="py-3 px-3 text-right font-mono">
                  <span v-if="w.hasFamilyAllowance" class="text-emerald-700 font-semibold">+S/ 102.50</span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- EsSalud 9% (Aporte Empleador) -->
                <td class="py-3 px-3 text-right font-mono text-purple-700 font-medium">
                  S/ {{ ((w.salary + (w.hasFamilyAllowance ? 102.50 : 0)) * 0.09).toFixed(2) }}
                </td>

                <!-- Estado -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    :class="w.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700 border border-slate-300'"
                  >
                    {{ w.status }}
                  </span>
                </td>

                <!-- ACCIONES REQUERIDAS CON COHERENCIA VISUAL Y TRANSPARENCIAS SOBRIAS -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- 1. Reasignar Sede (Modal Específico) -->
                    <button
                      @click="abrirModalReasignar(w)"
                      class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-2 border-emerald-300 hover:border-emerald-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center justify-center"
                      title="Reasignar Sede"
                    >
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                    </button>

                    <!-- 2. Editar Datos del Colaborador -->
                    <button
                      @click="abrirModalEditar(w)"
                      class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white border-2 border-blue-300 hover:border-blue-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center justify-center"
                      title="Editar Colaborador"
                    >
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>

                    <!-- 3. Dar de Baja (NO eliminar) o Reactivar -->
                    <button
                      v-if="w.status !== 'Cesado'"
                      @click="abrirModalBaja(w)"
                      class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border-2 border-rose-300 hover:border-rose-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center justify-center"
                      title="Dar de Baja"
                    >
                      <NoSymbolIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-else
                      @click="reactivarTrabajador(w)"
                      class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border-2 border-slate-300 hover:border-slate-900 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center justify-center"
                      title="Reactivar Colaborador"
                    >
                      <CheckBadgeIcon class="w-4 h-4" />
                    </button>

                    <!-- 4. Generar Boleta de Pago -->
                    <button
                      @click="generarBoletaTrabajador(w)"
                      class="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white border-2 border-purple-300 hover:border-purple-600 shadow-xs transition-all active:scale-95 cursor-pointer font-bold flex items-center justify-center"
                      title="Generar Boleta"
                    >
                      <DocumentCheckIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: PLANILLA MENSUAL Y EMISIÓN DE BOLETAS ELECTRÓNICAS (AFP / ESSALUD) -->
    <div v-else class="space-y-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Boletas Electrónicas de Pago Emitidas</h2>
            <p class="text-xs text-slate-500">Período de Planilla: <strong>Septiembre 2026</strong> • Régimen Laboral D.L. 728</p>
          </div>

          <button
            @click="emitirTodasLasBoletas"
            class="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition-all duration-200 cursor-pointer"
          >
            <CheckBadgeIcon class="w-4 h-4" />
            <span>Emitir Planilla Completa de Septiembre</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Código Boleta</th>
                <th class="py-2.5 px-3">Colaborador / DNI</th>
                <th class="py-2.5 px-3">Sede</th>
                <th class="py-2.5 px-3">Régimen Pensión</th>
                <th class="py-2.5 px-3 text-right">Básico + Asig</th>
                <th class="py-2.5 px-3 text-right text-rose-700">Desc. AFP/ONP</th>
                <th class="py-2.5 px-3 text-right text-purple-700">EsSalud 9% (Empl)</th>
                <th class="py-2.5 px-3 text-right font-bold text-slate-900">Neto a Cobrar</th>
                <th class="py-2.5 px-3 text-center">Estado</th>
                <th class="py-2.5 px-3 text-center">Boleta Oficial</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="bp in payslips" :key="bp.id" class="hover:bg-slate-50/80 transition">
                <td class="py-3 px-3 font-mono font-bold text-slate-900">{{ bp.code }}</td>
                <td class="py-3 px-3">
                  <span class="font-bold text-slate-900">{{ bp.workerName }}</span>
                  <span class="block text-[10px] text-slate-400 font-mono">DNI: {{ bp.dni }}</span>
                </td>
                <td class="py-3 px-3">{{ bp.branchName }}</td>
                <td class="py-3 px-3">
                  <span class="font-semibold">{{ bp.pensionSystem }}</span>
                  <p class="text-[10px] text-slate-400">({{ bp.pensionRate }}%)</p>
                </td>
                <td class="py-3 px-3 text-right font-mono">
                  S/ {{ bp.grossIncome.toFixed(2) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-semibold text-rose-700">
                  - S/ {{ bp.pensionDiscount.toFixed(2) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-purple-700">
                  S/ {{ bp.essaludContribution.toFixed(2) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-sm text-retail-800">
                  S/ {{ bp.netPay.toFixed(2) }}
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ bp.status.toUpperCase() }}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <!-- Botón Ver Boleta Oficial -->
                  <button
                    @click="verBoletaOficial(bp)"
                    class="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-md transition duration-200 text-[11px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
                  >
                    <EyeIcon class="w-3.5 h-3.5 text-white" />
                    <span>Ver Boleta</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL 1: REASIGNACIÓN DE SEDE (CON MOTIVO Y FECHA EFECTIVA) -->
    <div v-if="showReassignModal && workerToReassign" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <ArrowsRightLeftIcon class="w-5 h-5 text-retail-600" />
            <h3 class="font-bold text-sm text-slate-900">Reasignar Sede de Trabajo</h3>
          </div>
          <button @click="showReassignModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="confirmarReasignacionSede" class="space-y-3.5">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-500 block text-[11px]">Colaborador:</span>
            <span class="font-bold text-sm text-slate-900">{{ workerToReassign.fullName }}</span>
            <p class="text-[11px] text-slate-500 font-mono">DNI: {{ workerToReassign.dni }} • {{ workerToReassign.jobTitle }}</p>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Sede Actual</label>
            <div class="p-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
              {{ branchStore.getBranchName(workerToReassign.branchId) }}
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nueva Sede de Destino *</label>
            <select v-model="reassignForm.newBranchId" class="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800" required>
              <option 
                v-for="b in branchStore.branches" 
                :key="b.id" 
                :value="b.id"
                :disabled="b.id === workerToReassign.branchId"
              >
                {{ b.name }} ({{ b.district }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Fecha Efectiva del Traslado *</label>
            <input type="date" v-model="reassignForm.effectiveDate" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Motivo de Reasignación *</label>
            <input
              type="text"
              v-model="reassignForm.reason"
              placeholder="Ej: Cobertura por incremento de demanda, solicitud del colaborador"
              class="w-full p-2 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showReassignModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm cursor-pointer transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              Confirmar Reasignación
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: EDICIÓN DE DATOS DEL TRABAJADOR -->
    <div v-if="showEditWorkerModal && editingWorker" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            <h3 class="font-bold text-sm text-slate-900">Editar Datos de Colaborador: {{ editingWorker.fullName }}</h3>
          </div>
          <button @click="showEditWorkerModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="guardarEdicionTrabajador" class="space-y-3.5">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nombres y Apellidos *</label>
              <input type="text" v-model="editWorkerForm.fullName" class="w-full p-2 border border-slate-300 hover:border-slate-400 focus:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Cargo Laboral *</label>
              <select v-model="editWorkerForm.jobTitle" class="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800" required>
                <option value="Trabajador">Trabajador</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">DNI (8 dígitos) *</label>
              <input type="text" maxlength="8" v-model="editWorkerForm.dni" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
              <input type="text" v-model="editWorkerForm.phone" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Turno Habitual</label>
              <select v-model="editWorkerForm.shift" class="w-full p-2 border border-slate-300 rounded-lg" required>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sueldo Básico (S/.) *</label>
              <input type="number" step="50" v-model.number="editWorkerForm.salary" class="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sistema de Pensiones *</label>
              <select v-model="editWorkerForm.pensionSystem" class="w-full p-2 border border-slate-300 rounded-lg font-semibold" required>
                <option value="AFP Integra">AFP Integra (~12.85%)</option>
                <option value="AFP Prima">AFP Prima (~12.85%)</option>
                <option value="AFP Habitat">AFP Habitat (~12.85%)</option>
                <option value="AFP Profuturo">AFP Profuturo (~12.90%)</option>
                <option value="ONP">ONP (13.00%)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código CUSPP (Si es AFP)</label>
              <input type="text" v-model="editWorkerForm.cuspp" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="Ej: 541280JQC92" />
            </div>
            <div class="flex items-center gap-2 pt-6">
              <input type="checkbox" id="editFamilyCheck" v-model="editWorkerForm.hasFamilyAllowance" class="rounded text-retail-600 focus:ring-retail-500" />
              <label for="editFamilyCheck" class="font-medium text-slate-800 cursor-pointer">
                Tiene Asignación Familiar (+S/ 102.50)
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Banco Haberes</label>
              <input type="text" v-model="editWorkerForm.bankName" class="w-full p-2 border border-slate-300 rounded-lg" placeholder="BCP / BBVA / Interbank" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">N° Cuenta Sueldo</label>
              <input type="text" v-model="editWorkerForm.bankAccountNumber" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="193-XXXXXXXX-0-XX" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showEditWorkerModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: DAR DE BAJA COLABORADOR (NO ELIMINAR) -->
    <div v-if="showDeactivateWorkerModal && workerToDeactivate" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <NoSymbolIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900">Dar de Baja / Cese de Colaborador</h3>
            <p class="text-[11px] text-slate-500">{{ workerToDeactivate.fullName }} ({{ workerToDeactivate.dni }})</p>
          </div>
        </div>

        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
          <p class="font-bold">Política Legal y Auditoría Laboral:</p>
          <p class="text-[11px] leading-relaxed">
            El colaborador <strong>NO se borrará</strong> del sistema para mantener el historial de boletas emitidas, pagos de AFP/EsSalud y turnos de caja pasados.
          </p>
          <p class="text-[11px] leading-relaxed">
            Su estado cambiará a <strong>"CESADO"</strong> y perderá acceso para abrir cajas o vender en el terminal POS.
          </p>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Fecha de Cese Laboral *</label>
          <input type="date" v-model="deactivateWorkerForm.date" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Motivo del Cese *</label>
          <select v-model="deactivateWorkerForm.reason" class="w-full p-2 border border-slate-300 rounded-lg" required>
            <option value="Renuncia voluntaria">Renuncia voluntaria del trabajador</option>
            <option value="Término de contrato">Vencimiento / Término de contrato de trabajo</option>
            <option value="Mutuo disenso">Acuerdo mutuo de desvinculación</option>
            <option value="Despido justificado">Despido por causal laboral justificada</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="showDeactivateWorkerModal = false"
            class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarBajaTrabajador"
            class="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            Confirmar Baja de Trabajador
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: NUEVO COLABORADOR -->
    <div v-if="showNewWorkerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <UserPlusIcon class="w-5 h-5 text-retail-600" />
            <h3 class="font-bold text-sm text-slate-900">Registrar Alta de Colaborador (Planilla)</h3>
          </div>
          <button @click="showNewWorkerModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="guardarNuevoColaborador" class="space-y-3.5">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nombres y Apellidos *</label>
              <input type="text" v-model="newWorkerForm.fullName" class="w-full p-2 border border-slate-300 hover:border-slate-400 focus:border-slate-500 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none transition" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Cargo *</label>
              <select v-model="newWorkerForm.jobTitle" class="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800" required>
                <option value="Trabajador">Trabajador</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">DNI (8 dígitos) *</label>
              <input type="text" maxlength="8" v-model="newWorkerForm.dni" class="w-full p-2 border border-slate-300 rounded-lg font-mono" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teléfono</label>
              <input type="text" v-model="newWorkerForm.phone" class="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Turno</label>
              <select v-model="newWorkerForm.shift" class="w-full p-2 border border-slate-300 rounded-lg" required>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sede de Asignación *</label>
              <select v-model="newWorkerForm.branchId" class="w-full p-2 border border-slate-300 rounded-lg font-semibold" required>
                <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">
                  {{ b.name }} ({{ b.district }})
                </option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sueldo Básico (S/.) *</label>
              <input type="number" step="50" v-model.number="newWorkerForm.salary" class="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Régimen Pensionario *</label>
              <select v-model="newWorkerForm.pensionSystem" class="w-full p-2 border border-slate-300 rounded-lg font-semibold" required>
                <option value="AFP Integra">AFP Integra (~12.85%)</option>
                <option value="AFP Prima">AFP Prima (~12.85%)</option>
                <option value="AFP Habitat">AFP Habitat (~12.85%)</option>
                <option value="AFP Profuturo">AFP Profuturo (~12.90%)</option>
                <option value="ONP">ONP (13.00%)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">CUSPP (Si es AFP)</label>
              <input type="text" v-model="newWorkerForm.cuspp" class="w-full p-2 border border-slate-300 rounded-lg font-mono" placeholder="541280ABC99" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="newFamCheck" v-model="newWorkerForm.hasFamilyAllowance" class="rounded text-retail-600 focus:ring-retail-500" />
            <label for="newFamCheck" class="font-medium text-slate-800 cursor-pointer">
              Corresponde Asignación Familiar (+S/ 102.50)
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showNewWorkerModal = false"
              class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              Registrar en Planilla
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 5: VISOR OFICIAL DE BOLETA ELECTRÓNICA DE PAGO (PERÚ) -->
    <div v-if="showPayslipModal && selectedPayslip" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <DocumentCheckIcon class="w-5 h-5 text-purple-700" />
            <div>
              <h3 class="font-bold text-sm text-slate-900">Boleta Electrónica de Pago Oficial</h3>
              <p class="text-[10px] text-slate-500">Período: {{ selectedPayslip.period }} • {{ selectedPayslip.code }}</p>
            </div>
          </div>
          <button @click="showPayslipModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- FORMATO OFICIAL BOLETA DE PAGO (D.S. 001-98-TR) -->
        <div class="border border-slate-300 rounded-xl p-6 bg-white space-y-4 font-mono text-[11px] shadow-inner">
          <!-- Cabecera Empleador -->
          <div class="flex justify-between border-b border-slate-300 pb-3">
            <div>
              <p class="font-bold text-sm text-slate-900">Urba Market E.I.R.L</p>
              <p class="text-[10px] text-slate-500">RUC: 20601234567 • DOMICILIO FISCAL: AV. LARCO 450, MIRAFLORES</p>
              <p class="text-[10px] text-slate-500">SUCURSAL: {{ selectedPayslip.branchName.toUpperCase() }}</p>
            </div>
            <div class="text-right">
              <span class="font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                BOLETA DE PAGO
              </span>
              <p class="text-[10px] text-slate-500 mt-1">MES: {{ selectedPayslip.period.toUpperCase() }}</p>
            </div>
          </div>

          <!-- Datos del Trabajador -->
          <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px]">
            <div><span>TRABAJADOR: </span><strong class="text-slate-900">{{ selectedPayslip.workerName }}</strong></div>
            <div><span>DOCUMENTO: </span><strong>DNI {{ selectedPayslip.dni }}</strong></div>
            <div><span>CARGO: </span><strong>{{ selectedPayslip.jobTitle }}</strong></div>
            <div><span>FECHA INGRESO: </span><strong>{{ selectedPayslip.hireDate }}</strong></div>
            <div><span>SISTEMA PREVISIONAL: </span><strong class="text-purple-800">{{ selectedPayslip.pensionSystem }}</strong></div>
            <div><span>CUSPP / AFILIACIÓN: </span><strong>{{ selectedPayslip.cuspp || 'N/A' }}</strong></div>
            <div><span>DÍAS EFECTIVAMENTE LABORADOS: </span><strong>{{ selectedPayslip.daysWorked }} DÍAS</strong></div>
            <div><span>CONDICIÓN: </span><strong class="text-emerald-700">PLANILLA CONTINUA</strong></div>
          </div>

          <!-- Tabla de 3 Columnas: Ingresos | Descuentos Trabajador | Aportes Empleador -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-200 rounded-lg overflow-hidden">
            <!-- Columna 1: Conceptos Remunerativos (Ingresos) -->
            <div class="p-3 bg-white space-y-2 border-r border-slate-200">
              <span class="font-bold text-slate-900 text-xs block border-b pb-1 text-center bg-slate-50">
                1. INGRESOS
              </span>
              <div class="space-y-1 text-[10px]">
                <div class="flex justify-between">
                  <span>Sueldo Básico:</span>
                  <span class="font-bold">S/ {{ selectedPayslip.basicSalary.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between" v-if="selectedPayslip.familyAllowance > 0">
                  <span>Asig. Familiar (Ley):</span>
                  <span class="font-bold text-emerald-700">+ S/ {{ selectedPayslip.familyAllowance.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between" v-if="selectedPayslip.overtimeAmount > 0">
                  <span>Horas Extras (25%):</span>
                  <span class="font-bold">+ S/ {{ selectedPayslip.overtimeAmount.toFixed(2) }}</span>
                </div>
              </div>
              <div class="border-t border-slate-200 pt-1 flex justify-between font-bold text-xs text-slate-900">
                <span>TOTAL BRUTO:</span>
                <span>S/ {{ selectedPayslip.grossIncome.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Columna 2: Descuentos al Trabajador -->
            <div class="p-3 bg-white space-y-2 border-r border-slate-200">
              <span class="font-bold text-slate-900 text-xs block border-b pb-1 text-center bg-rose-50 text-rose-800">
                2. DESCUENTOS AL TRABAJADOR
              </span>
              <div class="space-y-1 text-[10px]">
                <div class="flex justify-between text-rose-800">
                  <span>Fondo {{ selectedPayslip.pensionSystem }} ({{ selectedPayslip.pensionRate }}%):</span>
                  <span class="font-bold">- S/ {{ selectedPayslip.pensionDiscount.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>Impuesto 5ta Cat.:</span>
                  <span>S/ {{ selectedPayslip.incomeTax5ta.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>Tardanzas / Faltas:</span>
                  <span>S/ {{ selectedPayslip.otherDiscounts.toFixed(2) }}</span>
                </div>
              </div>
              <div class="border-t border-slate-200 pt-1 flex justify-between font-bold text-xs text-rose-800">
                <span>TOTAL DESCUENTOS:</span>
                <span>- S/ {{ selectedPayslip.totalDiscounts.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Columna 3: Aportaciones del Empleador (Don Vecino) -->
            <div class="p-3 bg-white space-y-2">
              <span class="font-bold text-slate-900 text-xs block border-b pb-1 text-center bg-purple-50 text-purple-800">
                3. APORTES EMPLEADOR
              </span>
              <div class="space-y-1 text-[10px]">
                <div class="flex justify-between text-purple-900">
                  <span>EsSalud (Ley 26790 - 9%):</span>
                  <span class="font-bold">S/ {{ selectedPayslip.essaludContribution.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>SCTR Salud / Pensión:</span>
                  <span>S/ 0.00</span>
                </div>
              </div>
              <div class="border-t border-slate-200 pt-1 flex justify-between font-bold text-xs text-purple-800">
                <span>TOTAL APORTE URBA MARKET E.I.R.L:</span>
                <span>S/ {{ selectedPayslip.essaludContribution.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Total Neto Liquidado a Pagar -->
          <div class="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-emerald-950 uppercase">NETO A PAGAR AL TRABAJADOR:</span>
              <p class="text-[10px] text-emerald-700">Abonado mediante cuenta sueldo en banco asignado</p>
            </div>
            <div class="text-xl font-black font-mono text-emerald-800">
              S/ {{ selectedPayslip.netPay.toFixed(2) }}
            </div>
          </div>

          <!-- Firmas Legales -->
          <div class="grid grid-cols-2 gap-8 pt-6 text-center text-[10px] border-t border-slate-200">
            <div class="space-y-1">
              <div class="w-40 border-b border-slate-400 mx-auto"></div>
              <p class="font-bold">Urba Market E.I.R.L</p>
              <p class="text-slate-400">Firma Electrónica Empleador</p>
            </div>
            <div class="space-y-1">
              <div class="w-40 border-b border-slate-400 mx-auto"></div>
              <p class="font-bold">{{ selectedPayslip.workerName }}</p>
              <p class="text-slate-400">DNI: {{ selectedPayslip.dni }} • Conformidad</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="showPayslipModal = false"
            class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
          >
            Cerrar Visor
          </button>
          <button
            @click="descargarPdfBoleta"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>Descargar Boleta PDF</span>
          </button>
          <button
            @click="imprimirBoleta"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <PrinterIcon class="w-4 h-4" />
            <span>Imprimir Boleta</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL EXTRA DE DOBLE VERIFICACIÓN RRHH CON CONFIRM_DIALOG.VUE -->
    <ConfirmDialog
      v-model="showConfirmModal"
      :titulo="confirmTitle"
      :mensaje="confirmMessage"
      :tipo="confirmType"
      :confirmText="confirmButtonText"
      @confirm="handleConfirmExecution"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBranchStore } from '../stores/branchStore';
import { useToastStore } from '../stores/toastStore';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import type { RetailWorker, WorkerPayslip, ShiftTurn, PensionSystemType } from '../types';
import {
  UserGroupIcon,
  UserPlusIcon,
  DocumentCheckIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const branchStore = useBranchStore();
const toastStore = useToastStore();

const activeTab = ref<'workers' | 'payslips'>('workers');
const workerSearchQuery = ref<string>('');
const workerBranchFilter = ref<string>('all');

// Modales operativos
const showReassignModal = ref<boolean>(false);
const showEditWorkerModal = ref<boolean>(false);
const showDeactivateWorkerModal = ref<boolean>(false);
const showNewWorkerModal = ref<boolean>(false);
const showPayslipModal = ref<boolean>(false);

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

// Selecciones para acciones
const workerToReassign = ref<RetailWorker | null>(null);
const reassignForm = ref({
  newBranchId: 'sede-san-isidro',
  effectiveDate: '2026-10-01',
  reason: ''
});

const editingWorker = ref<RetailWorker | null>(null);
const editWorkerForm = ref<any>({});

const workerToDeactivate = ref<RetailWorker | null>(null);
const deactivateWorkerForm = ref({
  date: new Date().toISOString().substring(0, 10),
  reason: 'Renuncia voluntaria'
});

const selectedPayslip = ref<WorkerPayslip | null>(null);

// Formulario de Nuevo Colaborador (Cargo unificado a Trabajador)
const newWorkerForm = ref<{
  fullName: string;
  dni: string;
  phone: string;
  jobTitle: string;
  branchId: string;
  shift: ShiftTurn;
  salary: number;
  pensionSystem: PensionSystemType;
  cuspp: string;
  hasFamilyAllowance: boolean;
}>({
  fullName: '',
  dni: '',
  phone: '',
  jobTitle: 'Trabajador',
  branchId: 'sede-miraflores',
  shift: 'mañana',
  salary: 1350.00,
  pensionSystem: 'AFP Integra',
  cuspp: '',
  hasFamilyAllowance: true
});

// Padrón Inicial de Colaboradores (Cargos unificados a Trabajador)
const workers = ref<RetailWorker[]>([
  {
    id: 'w-01',
    dni: '72391045',
    fullName: 'Jorge Quispe Cárdenas',
    email: 'jorge.quispe@urbamarket.pe',
    phone: '992 456 789',
    role: 'trabajador',
    jobTitle: 'Trabajador',
    branchId: 'sede-miraflores',
    shift: 'mañana',
    salary: 1350.00,
    hireDate: '2025-03-15',
    status: 'Activo',
    pensionSystem: 'AFP Integra',
    cuspp: '541280JQC92',
    hasFamilyAllowance: true,
    bankName: 'BCP',
    bankAccountNumber: '193-45678910-0-12'
  },
  {
    id: 'w-02',
    dni: '74125896',
    fullName: 'Ana Lucía Morales',
    email: 'ana.morales@urbamarket.pe',
    phone: '971 852 963',
    role: 'trabajador',
    jobTitle: 'Trabajador',
    branchId: 'sede-san-isidro',
    shift: 'tarde',
    salary: 1350.00,
    hireDate: '2025-06-10',
    status: 'Activo',
    pensionSystem: 'AFP Prima',
    cuspp: '559021ALM95',
    hasFamilyAllowance: false,
    bankName: 'Interbank',
    bankAccountNumber: '200-3129845-0-88'
  },
  {
    id: 'w-03',
    dni: '71904321',
    fullName: 'David Huamán Ramos',
    email: 'david.huaman@urbamarket.pe',
    phone: '984 555 112',
    role: 'trabajador',
    jobTitle: 'Trabajador',
    branchId: 'sede-surco',
    shift: 'mañana',
    salary: 1350.00,
    hireDate: '2025-08-01',
    status: 'Activo',
    pensionSystem: 'ONP',
    hasFamilyAllowance: true,
    bankName: 'BBVA',
    bankAccountNumber: '0011-0245-020087412'
  },
  {
    id: 'w-04',
    dni: '70852369',
    fullName: 'Carla Zambrano Solís',
    email: 'carla.zambrano@urbamarket.pe',
    phone: '912 345 678',
    role: 'trabajador',
    jobTitle: 'Trabajador',
    branchId: 'sede-los-olivos',
    shift: 'tarde',
    salary: 1350.00,
    hireDate: '2025-11-20',
    status: 'Activo',
    pensionSystem: 'AFP Habitat',
    cuspp: '578412CZS98',
    hasFamilyAllowance: false,
    bankName: 'BCP',
    bankAccountNumber: '191-88451203-0-45'
  }
]);

// Boletas Electrónicas Iniciales Emitidas (Cargo unificado a Trabajador)
const payslips = ref<WorkerPayslip[]>([
  {
    id: 'bol-01',
    code: 'BOL-2026-09-001',
    workerId: 'w-01',
    workerName: 'Jorge Quispe Cárdenas',
    dni: '72391045',
    jobTitle: 'Trabajador',
    branchName: 'Sede Miraflores (Principal)',
    period: 'Septiembre 2026',
    hireDate: '2025-03-15',
    pensionSystem: 'AFP Integra',
    cuspp: '541280JQC92',
    daysWorked: 30,
    basicSalary: 1350.00,
    familyAllowance: 102.50,
    overtimeHours: 0,
    overtimeAmount: 0,
    grossIncome: 1452.50,
    pensionDiscount: 186.65, // ~12.85%
    pensionRate: 12.85,
    incomeTax5ta: 0,
    otherDiscounts: 0,
    totalDiscounts: 186.65,
    netPay: 1265.85,
    essaludContribution: 130.73, // 9%
    status: 'pagada',
    issueDate: '2026-09-25',
    signedElectronic: true
  },
  {
    id: 'bol-02',
    code: 'BOL-2026-09-002',
    workerId: 'w-02',
    workerName: 'Ana Lucía Morales',
    dni: '74125896',
    jobTitle: 'Trabajador',
    branchName: 'Sede San Isidro',
    period: 'Septiembre 2026',
    hireDate: '2025-06-10',
    pensionSystem: 'AFP Prima',
    cuspp: '559021ALM95',
    daysWorked: 30,
    basicSalary: 1350.00,
    familyAllowance: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    grossIncome: 1350.00,
    pensionDiscount: 173.48, // ~12.85%
    pensionRate: 12.85,
    incomeTax5ta: 0,
    otherDiscounts: 0,
    totalDiscounts: 173.48,
    netPay: 1176.52,
    essaludContribution: 121.50, // 9%
    status: 'pagada',
    issueDate: '2026-09-25',
    signedElectronic: true
  }
]);

// Cálculos de resumen
const activeWorkersCount = computed(() => workers.value.filter(w => w.status === 'Activo').length);
const inactiveWorkersCount = computed(() => workers.value.filter(w => w.status === 'Cesado').length);

const totalGrossPayroll = computed(() => {
  return workers.value
    .filter(w => w.status === 'Activo')
    .reduce((sum, w) => sum + w.salary + (w.hasFamilyAllowance ? 102.50 : 0), 0);
});

const totalEssaludAporte = computed(() => {
  return Number((totalGrossPayroll.value * 0.09).toFixed(2));
});

const totalRetencionesAfp = computed(() => {
  return Number((totalGrossPayroll.value * 0.1285).toFixed(2));
});

const filteredWorkers = computed(() => {
  return workers.value.filter(w => {
    const matchBranch = workerBranchFilter.value === 'all' || w.branchId === workerBranchFilter.value;
    const query = workerSearchQuery.value.toLowerCase().trim();
    if (!query) return matchBranch;

    const matchQuery =
      w.fullName.toLowerCase().includes(query) ||
      w.dni.includes(query) ||
      w.jobTitle.toLowerCase().includes(query);

    return matchBranch && matchQuery;
  });
});

// 1. REASIGNACIÓN DE SEDE CON MODAL
function abrirModalReasignar(w: RetailWorker) {
  workerToReassign.value = w;
  const availableTarget = branchStore.branches.find(b => b.id !== w.branchId);
  reassignForm.value.newBranchId = availableTarget ? availableTarget.id : 'sede-san-isidro';
  reassignForm.value.effectiveDate = new Date().toISOString().substring(0, 10);
  reassignForm.value.reason = 'Requerimiento de cobertura operativa en tienda';
  showReassignModal.value = true;
}

function confirmarReasignacionSede() {
  if (!workerToReassign.value) return;
  const targetBranch = branchStore.getBranchById(reassignForm.value.newBranchId);
  const oldBranchName = branchStore.getBranchName(workerToReassign.value.branchId);
  const worker = workerToReassign.value;

  requestConfirmation({
    title: '¿Está seguro de reasignar la sede de trabajo?',
    message: `Se transferirá la adscripción laboral de "${worker.fullName}" (DNI: ${worker.dni}) de ${oldBranchName} a ${targetBranch?.name}.\n\n• Sede Destino: ${targetBranch?.name || 'Sede Destino'}\n• Fecha Efectiva: ${reassignForm.value.effectiveDate}\n• Motivo: ${reassignForm.value.reason}`,
    type: 'primary',
    confirmText: 'Sí, confirmar reasignación',
    onConfirm: () => {
      worker.branchId = reassignForm.value.newBranchId;
      showReassignModal.value = false;

      toastStore.success(
        'Reasignación Confirmada',
        `${worker.fullName} fue transferido(a) de ${oldBranchName} a ${targetBranch?.name}. Efectivo desde: ${reassignForm.value.effectiveDate}.`
      );
    }
  });
}

// 2. EDICIÓN DE DATOS DEL TRABAJADOR
function abrirModalEditar(w: RetailWorker) {
  editingWorker.value = w;
  editWorkerForm.value = { ...w };
  showEditWorkerModal.value = true;
}

function guardarEdicionTrabajador() {
  if (!editingWorker.value) return;

  const worker = editingWorker.value;
  const salary = Number(editWorkerForm.value.salary);

  requestConfirmation({
    title: '¿Está seguro de guardar las modificaciones?',
    message: `Confirma que los cambios en la ficha de "${worker.fullName}" son correctos:\n\n• DNI: ${editWorkerForm.value.dni}\n• Cargo: ${editWorkerForm.value.jobTitle}\n• Sueldo Básico: S/ ${salary.toFixed(2)}\n• Turno: ${editWorkerForm.value.shift}\n• Previsión: ${editWorkerForm.value.pensionSystem}`,
    type: 'primary',
    confirmText: 'Sí, guardar cambios',
    onConfirm: () => {
      Object.assign(worker, editWorkerForm.value);
      worker.role = editWorkerForm.value.jobTitle === 'Admin' ? 'admin' : 'trabajador';
      showEditWorkerModal.value = false;
      toastStore.info('Datos Actualizados', `Ficha laboral de ${worker.fullName} actualizada exitosamente.`);
    }
  });
}

// 3. DAR DE BAJA COLABORADOR (NO ELIMINAR)
function abrirModalBaja(w: RetailWorker) {
  workerToDeactivate.value = w;
  deactivateWorkerForm.value.date = new Date().toISOString().substring(0, 10);
  deactivateWorkerForm.value.reason = 'Renuncia voluntaria';
  showDeactivateWorkerModal.value = true;
}

function confirmarBajaTrabajador() {
  if (!workerToDeactivate.value) return;

  const worker = workerToDeactivate.value;
  const reason = deactivateWorkerForm.value.reason;
  const date = deactivateWorkerForm.value.date;
  const branchName = branchStore.getBranchName(worker.branchId);

  requestConfirmation({
    title: `¿Está seguro de dar de baja a "${worker.fullName}"?`,
    message: `El colaborador pasará a estado CESADO y no podrá operar terminales POS.\n\n• Sede: ${branchName}\n• Fecha de Cese: ${date}\n• Motivo Legal: ${reason}`,
    type: 'danger',
    confirmText: 'Sí, confirmar cese',
    onConfirm: () => {
      worker.status = 'Cesado';
      worker.deactivationDate = date;
      worker.deactivationReason = reason;
      showDeactivateWorkerModal.value = false;

      toastStore.warning(
        'Cese Registrado',
        `${worker.fullName} fue dado de baja por motivo "${reason}". Su historial se mantiene en la base de datos.`
      );
    }
  });
}

function reactivarTrabajador(w: RetailWorker) {
  requestConfirmation({
    title: `¿Está seguro de reactivar a "${w.fullName}"?`,
    message: `El colaborador volverá a figurar como ACTIVO en planilla y terminales.\n\n• DNI: ${w.dni}\n• Sede Asignada: ${branchStore.getBranchName(w.branchId)}`,
    type: 'primary',
    confirmText: 'Sí, reactivar colaborador',
    onConfirm: () => {
      w.status = 'Activo';
      w.deactivationReason = undefined;
      w.deactivationDate = undefined;
      toastStore.success('Colaborador Reactivado', `${w.fullName} está nuevamente Activo en planilla.`);
    }
  });
}

// 4. NUEVO COLABORADOR
function guardarNuevoColaborador() {
  if (!newWorkerForm.value.fullName.trim() || !newWorkerForm.value.dni.trim()) {
    toastStore.warning('Datos incompletos', 'Ingresa nombres y DNI del colaborador.');
    return;
  }

  const name = newWorkerForm.value.fullName;
  const dni = newWorkerForm.value.dni;
  const branchName = branchStore.getBranchName(newWorkerForm.value.branchId);
  const salary = Number(newWorkerForm.value.salary);

  requestConfirmation({
    title: '¿Está seguro de registrar este nuevo trabajador?',
    message: `Se dará de alta a "${name}" asignado a la sucursal ${branchName}.\n\n• Cargo: ${newWorkerForm.value.jobTitle}\n• Sueldo Básico: S/ ${salary.toFixed(2)}\n• Previsión: ${newWorkerForm.value.pensionSystem}`,
    type: 'primary',
    confirmText: 'Sí, registrar trabajador',
    onConfirm: () => {
      const newW: RetailWorker = {
        id: `w-${Date.now()}`,
        dni: dni,
        fullName: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@urbamarket.pe`,
        phone: newWorkerForm.value.phone,
        role: newWorkerForm.value.jobTitle === 'Admin' ? 'admin' : 'trabajador',
        jobTitle: newWorkerForm.value.jobTitle,
        branchId: newWorkerForm.value.branchId,
        shift: newWorkerForm.value.shift,
        salary: salary,
        hireDate: new Date().toISOString().substring(0, 10),
        status: 'Activo',
        pensionSystem: newWorkerForm.value.pensionSystem,
        cuspp: newWorkerForm.value.cuspp || undefined,
        hasFamilyAllowance: newWorkerForm.value.hasFamilyAllowance,
        bankName: 'BCP'
      };

      workers.value.unshift(newW);
      showNewWorkerModal.value = false;
      toastStore.success('Alta Registrada', `${newW.fullName} incorporado como ${newW.jobTitle} en ${branchName}.`);
    }
  });
}

// 5. GENERACIÓN Y VISUALIZACIÓN DE BOLETAS ELECTRÓNICAS
function generarBoletaTrabajador(w: RetailWorker) {
  const gross = w.salary + (w.hasFamilyAllowance ? 102.50 : 0);
  const rate = w.pensionSystem === 'ONP' ? 13.00 : 12.85;
  const pensionDesc = Number(((gross * rate) / 100).toFixed(2));
  const essalud = Number((gross * 0.09).toFixed(2));
  const net = Number((gross - pensionDesc).toFixed(2));

  const newSlip: WorkerPayslip = {
    id: `bol-${Date.now()}`,
    code: `BOL-2026-09-${String(payslips.value.length + 1).padStart(3, '0')}`,
    workerId: w.id,
    workerName: w.fullName,
    dni: w.dni,
    jobTitle: w.jobTitle,
    branchName: branchStore.getBranchName(w.branchId),
    period: 'Septiembre 2026',
    hireDate: w.hireDate,
    pensionSystem: w.pensionSystem,
    cuspp: w.cuspp || 'N/A',
    daysWorked: 30,
    basicSalary: w.salary,
    familyAllowance: w.hasFamilyAllowance ? 102.50 : 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    grossIncome: gross,
    pensionDiscount: pensionDesc,
    pensionRate: rate,
    incomeTax5ta: 0,
    otherDiscounts: 0,
    totalDiscounts: pensionDesc,
    netPay: net,
    essaludContribution: essalud,
    status: 'emitida',
    issueDate: new Date().toISOString().substring(0, 10),
    signedElectronic: true
  };

  payslips.value.unshift(newSlip);
  selectedPayslip.value = newSlip;
  showPayslipModal.value = true;
  toastStore.success('Boleta Emitida', `Boleta ${newSlip.code} calculada y emitida para ${w.fullName}.`);
}

function emitirTodasLasBoletas() {
  const activeWorkers = workers.value.filter(w => w.status === 'Activo');

  requestConfirmation({
    title: '¿Está seguro de emitir la planilla completa de Septiembre?',
    message: `Se procesará la liquidación de ${activeWorkers.length} colaboradores activos.\n\n• Período: Septiembre 2026\n• Total Planilla Bruta: S/ ${totalGrossPayroll.value.toFixed(2)}`,
    type: 'primary',
    confirmText: 'Sí, emitir planilla oficial',
    onConfirm: () => {
      let count = 0;
      activeWorkers.forEach(w => {
        const already = payslips.value.some(p => p.workerId === w.id);
        if (!already) {
          const gross = w.salary + (w.hasFamilyAllowance ? 102.50 : 0);
          const rate = w.pensionSystem === 'ONP' ? 13.00 : 12.85;
          const pensionDesc = Number(((gross * rate) / 100).toFixed(2));
          const essalud = Number((gross * 0.09).toFixed(2));
          const net = Number((gross - pensionDesc).toFixed(2));

          payslips.value.push({
            id: `bol-${Date.now()}-${w.id}`,
            code: `BOL-2026-09-${String(payslips.value.length + 1).padStart(3, '0')}`,
            workerId: w.id,
            workerName: w.fullName,
            dni: w.dni,
            jobTitle: w.jobTitle,
            branchName: branchStore.getBranchName(w.branchId),
            period: 'Septiembre 2026',
            hireDate: w.hireDate,
            pensionSystem: w.pensionSystem,
            cuspp: w.cuspp || 'N/A',
            daysWorked: 30,
            basicSalary: w.salary,
            familyAllowance: w.hasFamilyAllowance ? 102.50 : 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            grossIncome: gross,
            pensionDiscount: pensionDesc,
            pensionRate: rate,
            incomeTax5ta: 0,
            otherDiscounts: 0,
            totalDiscounts: pensionDesc,
            netPay: net,
            essaludContribution: essalud,
            status: 'emitida',
            issueDate: '2026-09-25',
            signedElectronic: true
          });
          count++;
        }
      });

      activeTab.value = 'payslips';
      toastStore.success(
        'Planilla Emitida',
        `Se generaron ${count > 0 ? count : 'todas las'} boletas electrónicas del mes con aportes AFP/ONP y EsSalud calculados.`
      );
    }
  });
}

function verBoletaOficial(slip: WorkerPayslip) {
  selectedPayslip.value = slip;
  showPayslipModal.value = true;
}

function imprimirBoleta() {
  window.print();
}

function descargarPdfBoleta() {
  if (!selectedPayslip.value) return;
  toastStore.success(
    'Descarga de Boleta PDF',
    `Descargando boleta firmada electrónicamente de ${selectedPayslip.value.workerName} (${selectedPayslip.value.code}).`
  );
}
</script>
