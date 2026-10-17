<template>
  <div class="h-[calc(100vh-4.25rem)] flex flex-col -m-6 bg-slate-100 overflow-hidden select-none">
    <!-- BARRA SUPERIOR POS RÁPIDA -->
    <header class="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-retail-600 flex items-center justify-center font-black text-white text-base shadow-sm">
          POS
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-white tracking-wide">Terminal Punto de Venta #01</span>
            <span 
              v-if="posStore.isShiftOpen" 
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              TURNO ACTIVO ({{ posStore.activeShift?.turn.toUpperCase() }})
            </span>
            <span 
              v-else 
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              CAJA BLOQUEADA
            </span>
          </div>
          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>{{ authStore.userBranchName }}</span>
            <span>•</span>
            <span class="text-slate-300">Cajero: {{ authStore.currentUser?.name }}</span>
          </div>
        </div>
      </div>

      <!-- Buscador por código de barras / Escáner -->
      <div class="flex-1 max-w-md mx-4">
        <div class="relative">
          <input
            ref="barcodeInput"
            v-model="searchQuery"
            @keydown.enter.prevent="handleBarcodeEnter"
            type="text"
            placeholder="Escanear código de barras o buscar producto [Enter]..."
            class="w-full bg-slate-800 text-white placeholder-slate-400 text-xs pl-9 pr-8 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-retail-500 focus:border-retail-500 font-mono"
            :disabled="!posStore.isShiftOpen"
          />
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Acciones de control -->
      <div class="flex items-center gap-2">
        <router-link
          to="/caja/apertura"
          class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <LockClosedIcon class="w-3.5 h-3.5 text-amber-400" />
          <span>Arqueo / Cierre</span>
        </router-link>
      </div>
    </header>

    <!-- OVERLAY SI LA CAJA ESTÁ CERRADA -->
    <div 
      v-if="!posStore.isShiftOpen" 
      class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-100/90 z-20 space-y-4"
    >
      <div class="w-20 h-20 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shadow-lg">
        <LockClosedIcon class="w-10 h-10" />
      </div>
      <div class="max-w-md space-y-2">
        <h2 class="text-xl font-bold text-slate-900">Punto de Venta Bloqueado</h2>
        <p class="text-sm text-slate-600">
          No puedes registrar ventas ni escanear productos porque tu caja se encuentra cerrada. Debes ingresar el monto inicial de tu fondo de apertura para comenzar el turno.
        </p>
      </div>
      <router-link
        to="/caja/apertura"
        class="bg-retail-600 hover:bg-retail-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
      >
        <BanknotesIcon class="w-5 h-5" />
        <span>Ir a Aperturar Caja Ahora</span>
      </router-link>
    </div>

    <!-- CUERPO PRINCIPAL DEL POS -->
    <div v-else class="flex-1 flex overflow-hidden">
      <!-- PANEL IZQUIERDO -->
      <div class="flex-1 flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200">
        <div class="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
          <button
            @click="selectedCategory = 'all'"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0"
            :class="selectedCategory === 'all' ? 'bg-retail-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            Todos los Productos ({{ inventoryStore.products.length }})
          </button>
          <button
            v-for="cat in categoriasDisponibles"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0"
            :class="selectedCategory === cat ? 'bg-retail-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            {{ cat }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div 
            v-if="filteredProducts.length === 0" 
            class="h-full flex flex-col items-center justify-center text-slate-400 space-y-2"
          >
            <MagnifyingGlassIcon class="w-10 h-10" />
            <p class="text-sm">No se encontraron productos con el filtro "{{ searchQuery || selectedCategory }}"</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            <button
              v-for="prod in filteredProducts"
              :key="prod.id"
              @click="handleProductClick(prod)"
              class="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-retail-400 rounded-xl p-2.5 text-left flex flex-col justify-between shadow-xs hover:shadow-md transition-all group cursor-pointer relative overflow-hidden active:scale-95"
            >
              <span 
                class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="getStockBadgeClass(prod)"
              >
                {{ getBranchStock(prod) }} {{ prod.unit }}
              </span>

              <div class="h-24 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 mb-2">
                <img 
                  :src="prod.image" 
                  :alt="prod.name" 
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform" 
                  loading="lazy"
                />
              </div>

              <div class="space-y-0.5">
                <span class="text-[10px] text-slate-400 font-mono">{{ prod.sku }}</span>
                <p class="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                  {{ prod.name }}
                </p>
                <p class="text-[10px] text-slate-500">{{ prod.brand }}</p>
              </div>

              <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-400">PVP</span>
                <span class="text-base font-extrabold text-retail-700 font-mono">
                  S/ {{ prod.price.toFixed(2) }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div class="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <kbd class="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px]">Enter</kbd> Buscar código
            </span>
            <span class="flex items-center gap-1">
              <kbd class="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px]">F4</kbd> Cobro rápido
            </span>
          </div>
          <div>
            <span>Sede actual: <strong>{{ authStore.userBranchName }}</strong></span>
          </div>
        </div>
      </div>

      <!-- PANEL DERECHO: CARRITO -->
      <div class="w-80 sm:w-96 lg:w-[420px] bg-white flex flex-col justify-between border-l border-slate-200 shadow-lg shrink-0">
        <div class="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <ShoppingCartIcon class="w-5 h-5 text-retail-400" />
            <span class="font-bold text-sm">Ticket de Venta</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-retail-500 text-white">
              {{ posStore.cartItemsCount }} ítems
            </span>
          </div>
          <button
            v-if="posStore.cart.length > 0"
            @click="posStore.clearCart"
            class="text-[11px] text-rose-300 hover:text-white flex items-center gap-1 transition"
          >
            <TrashIcon class="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        </div>

        <div class="bg-slate-100 p-2.5 border-b border-slate-200 space-y-2 shrink-0">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              @click="invoiceType = 'boleta'"
              class="py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5"
              :class="invoiceType === 'boleta' ? 'bg-retail-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300'"
            >
              <span>Boleta B001</span>
            </button>
            <button
              type="button"
              @click="invoiceType = 'factura'"
              class="py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5"
              :class="invoiceType === 'factura' ? 'bg-retail-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300'"
            >
              <span>Factura F001</span>
            </button>
          </div>

          <div class="flex gap-2 text-xs">
            <input
              v-if="invoiceType === 'boleta'"
              v-model="clientDocNumber"
              type="text"
              maxlength="8"
              placeholder="DNI Cliente (Opcional)"
              class="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-retail-500 focus:outline-none"
            />
            <input
              v-else
              v-model="clientDocNumber"
              type="text"
              maxlength="11"
              placeholder="RUC 11 dígitos (Obligatorio)"
              class="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-retail-500 focus:outline-none"
            />
            <input
              v-model="clientName"
              type="text"
              :placeholder="invoiceType === 'factura' ? 'Razón Social' : 'Nombre cliente'"
              class="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-retail-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          <div 
            v-if="posStore.cart.length === 0" 
            class="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 p-6 text-center"
          >
            <ShoppingCartIcon class="w-12 h-12 stroke-1" />
            <p class="text-xs font-medium">El carrito está vacío</p>
            <p class="text-[11px] text-slate-400">Escanea un código de barras o haz clic en los productos para agregarlos al ticket.</p>
          </div>

          <div
            v-for="item in posStore.cart"
            :key="item.product.id"
            class="py-2.5 first:pt-0 flex items-center justify-between gap-2"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-800 truncate">{{ item.product.name }}</p>
              <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span class="font-mono">P.U: S/ {{ item.unitPrice.toFixed(2) }}</span>
                <span>•</span>
                <span class="text-slate-400">{{ item.product.unit }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                @click="posStore.updateQuantity(item.product.id, item.quantity - 1)"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition"
              >
                -
              </button>
              <span class="w-8 text-center font-bold text-xs font-mono text-slate-900">
                {{ item.quantity }}
              </span>
              <button
                @click="posStore.updateQuantity(item.product.id, item.quantity + 1)"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition"
              >
                +
              </button>
            </div>

            <div class="text-right shrink-0 min-w-[65px]">
              <span class="font-mono font-bold text-xs text-slate-900">
                S/ {{ item.subtotal.toFixed(2) }}
              </span>
            </div>

            <button
              @click="posStore.removeFromCart(item.product.id)"
              class="text-slate-300 hover:text-rose-500 p-1 transition"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="bg-slate-50 border-t border-slate-200 p-4 space-y-3 shrink-0">
          <div class="space-y-1 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Op. Gravadas (Subtotal):</span>
              <span class="font-mono font-semibold">S/ {{ posStore.cartSubtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>I.G.V. (18%):</span>
              <span class="font-mono font-semibold">S/ {{ posStore.cartIgv.toFixed(2) }}</span>
            </div>
            <div v-if="posStore.fastDiscountPercent > 0" class="flex justify-between text-amber-600 font-semibold">
              <span>Descuento aplicado ({{ posStore.fastDiscountPercent }}%):</span>
              <span class="font-mono">- S/ {{ ((posStore.cartTotal * posStore.fastDiscountPercent) / 100).toFixed(2) }}</span>
            </div>
          </div>

          <div class="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total a Cobrar</span>
              <p class="text-xs text-emerald-400 font-medium">Incluye IGV SUNAT</p>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black text-white font-mono tracking-tight">
                S/ {{ posStore.cartTotal.toFixed(2) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-1">
            <button
              @click="abrirModalCobro('efectivo')"
              :disabled="posStore.cart.length === 0"
              class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <BanknotesIcon class="w-5 h-5" />
              <span>Efectivo</span>
            </button>

            <button
              @click="abrirModalCobro('tarjeta')"
              :disabled="posStore.cart.length === 0"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <CreditCardIcon class="w-5 h-5" />
              <span>Tarjeta</span>
            </button>

            <button
              @click="abrirModalCobro('yape_plin')"
              :disabled="posStore.cart.length === 0"
              class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <DevicePhoneMobileIcon class="w-5 h-5" />
              <span>Yape / Plin</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE COBRO -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              :class="{
                'bg-emerald-600': selectedPaymentMethod === 'efectivo',
                'bg-blue-600': selectedPaymentMethod === 'tarjeta',
                'bg-purple-600': selectedPaymentMethod === 'yape_plin'
              }"
            >
              <component :is="getPaymentIcon(selectedPaymentMethod)" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900">
                Cobro con {{ getPaymentMethodName(selectedPaymentMethod) }}
              </h3>
              <p class="text-[10px] text-slate-500">{{ invoiceType === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta' }}</p>
            </div>
          </div>
          <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
          <span class="text-xs text-slate-400">Total a Pagar:</span>
          <span class="text-2xl font-black font-mono text-emerald-400">
            S/ {{ posStore.cartTotal.toFixed(2) }}
          </span>
        </div>

        <div v-if="selectedPaymentMethod === 'efectivo'" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Monto Entregado por el Cliente</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500">S/</span>
              <input
                ref="cashPaidInput"
                type="number"
                step="0.50"
                min="0"
                v-model.number="amountPaid"
                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xl font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="billete in [posStore.cartTotal, 20, 50, 100]"
              :key="billete"
              type="button"
              @click="amountPaid = Number(billete.toFixed(2))"
              class="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs border border-slate-300"
            >
              {{ billete === posStore.cartTotal ? 'Exacto' : `S/ ${billete}` }}
            </button>
          </div>

          <div 
            class="p-3 rounded-xl border flex items-center justify-between"
            :class="vueltoCalculado >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
          >
            <div>
              <span class="text-xs font-bold uppercase">{{ vueltoCalculado >= 0 ? 'Vuelto a Entregar:' : 'Monto Insuficiente:' }}</span>
            </div>
            <div class="text-xl font-black font-mono">
              S/ {{ Math.abs(vueltoCalculado).toFixed(2) }}
            </div>
          </div>
        </div>

        <div v-else-if="selectedPaymentMethod === 'tarjeta'" class="space-y-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs">
          <p class="font-semibold text-blue-900">Operación con Terminal POS (Visa / Mastercard / Amex):</p>
          <p class="text-blue-700 leading-relaxed">
            Pase la tarjeta del cliente por el lector o acerque su teléfono con NFC. Espere la confirmación impresa en el voucher.
          </p>
          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" id="voucherCheck" v-model="voucherApproved" class="rounded text-blue-600 focus:ring-blue-500" />
            <label for="voucherCheck" class="font-medium text-slate-800 cursor-pointer">
              Voucher aprobado en terminal físico
            </label>
          </div>
        </div>

        <div v-else class="space-y-3 bg-purple-50/60 p-4 rounded-xl border border-purple-200 text-xs">
          <div class="text-center space-y-1">
            <p class="font-bold text-purple-900 text-sm">Escanee el QR en el mostrador</p>
            <p class="text-purple-700">O ingrese el código de aprobación de la app</p>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Código de Operación Yape/Plin (Opcional):</label>
            <input
              type="text"
              maxlength="8"
              v-model="yapeCode"
              placeholder="Ej: 849201"
              class="w-full bg-white border border-purple-300 rounded px-3 py-1.5 font-mono text-center font-bold text-sm text-purple-900 focus:outline-none"
            />
          </div>
        </div>

        <div class="pt-2">
          <button
            type="button"
            @click="confirmarVenta"
            :disabled="isProcessing || (selectedPaymentMethod === 'efectivo' && vueltoCalculado < 0)"
            class="w-full bg-retail-600 hover:bg-retail-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm focus:ring-4 focus:ring-retail-500/30"
          >
            <CheckCircleIcon v-if="!isProcessing" class="w-5 h-5" />
            <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" v-else></span>
            <span>{{ isProcessing ? 'Procesando en Servidor...' : 'Emitir Comprobante y Finalizar Venta' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE TICKET EXITOSO -->
    <div v-if="showSuccessTicketModal && posStore.lastSale" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
        <div class="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckIcon class="w-6 h-6 stroke-2" />
          </div>
          <p class="font-bold text-base tracking-wider text-slate-900">Urba Market E.I.R.L</p>
          <p class="text-[10px] text-slate-500">RUC: 20601234567 • LIMA, PERÚ</p>
          <p class="text-[10px] font-bold text-emerald-700 uppercase">
            {{ posStore.lastSale.invoiceType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}
          </p>
          <p class="font-bold text-sm text-slate-800">{{ posStore.lastSale.ticketNumber }}</p>
        </div>

        <div class="space-y-1 text-slate-700 text-[11px] border-b border-dashed border-slate-300 pb-3">
          <div class="flex justify-between"><span>Fecha/Hora:</span><span>{{ posStore.lastSale.date }} {{ posStore.lastSale.time }}</span></div>
          <div class="flex justify-between"><span>Sede:</span><span>{{ posStore.lastSale.branchName }}</span></div>
          <div class="flex justify-between"><span>Cajero:</span><span>{{ posStore.lastSale.cashierName }}</span></div>
          <div v-if="posStore.lastSale.clientDocNumber" class="flex justify-between">
            <span>Cliente ({{ posStore.lastSale.clientDocType }}):</span>
            <span>{{ posStore.lastSale.clientDocNumber }}</span>
          </div>
        </div>

        <div class="border-b border-dashed border-slate-300 pb-3 space-y-1 max-h-36 overflow-y-auto">
          <div v-for="it in posStore.lastSale.items" :key="it.productId" class="flex justify-between text-[11px]">
            <span class="truncate pr-2">{{ it.quantity }}x {{ it.productName }}</span>
            <span class="font-bold shrink-0">S/ {{ it.subtotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="space-y-1 text-slate-800 text-[11px] border-b border-dashed border-slate-300 pb-3">
          <div class="flex justify-between"><span>Subtotal:</span><span>S/ {{ posStore.lastSale.subtotal.toFixed(2) }}</span></div>
          <div class="flex justify-between"><span>IGV 18%:</span><span>S/ {{ posStore.lastSale.igv.toFixed(2) }}</span></div>
          <div class="flex justify-between text-sm font-bold border-t border-slate-200 pt-1">
            <span>TOTAL:</span>
            <span>S/ {{ posStore.lastSale.total.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>Método: {{ posStore.lastSale.paymentMethod.toUpperCase() }}</span>
            <span v-if="posStore.lastSale.paymentMethod === 'efectivo'">Vuelto: S/ {{ posStore.lastSale.changeGiven.toFixed(2) }}</span>
          </div>
        </div>

        <div class="text-center text-[10px] text-slate-500 space-y-1">
          <p class="font-bold text-emerald-600">Representación impresa de Comprobante Electrónico</p>
          <p class="font-mono">Hash: {{ posStore.lastSale.sunatHash }}</p>
          <p>¡Gracias por su compra en Urba Market E.I.R.L!</p>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            @click="imprimirTicket"
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
          >
            <PrinterIcon class="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            @click="showSuccessTicketModal = false"
            class="px-4 py-2 bg-retail-600 hover:bg-retail-700 text-white font-bold rounded-lg text-xs"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { usePosStore } from '../stores/posStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useToastStore } from '../stores/toastStore';
import type { RetailProduct, ProductCategory, PaymentMethod, InvoiceType } from '../types';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  CheckIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const posStore = usePosStore();
const inventoryStore = useInventoryStore();
const toastStore = useToastStore();

const barcodeInput = ref<HTMLInputElement | null>(null);
const searchQuery = ref<string>('');
const selectedCategory = ref<string>('all');
const isProcessing = ref<boolean>(false);

const invoiceType = ref<InvoiceType>('boleta');
const clientDocNumber = ref<string>('');
const clientName = ref<string>('');

const showPaymentModal = ref<boolean>(false);
const selectedPaymentMethod = ref<PaymentMethod>('efectivo');
const amountPaid = ref<number>(0);
const voucherApproved = ref<boolean>(true);
const yapeCode = ref<string>('');
const showSuccessTicketModal = ref<boolean>(false);

const categoriasDisponibles: ProductCategory[] = [
  'Bebidas', 'Abarrotes', 'Snacks', 'Lácteos', 'Panadería', 'Golosinas', 'Limpieza'
];

onMounted(() => {
  if (barcodeInput.value) barcodeInput.value.focus();
});

const filteredProducts = computed(() => {
  return inventoryStore.products.filter(p => {
    if (p.status === 'de_baja') return false;
    const matchesCat = selectedCategory.value === 'all' || p.category === selectedCategory.value;
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return matchesCat;

    const matchesQuery = 
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query);

    return matchesCat && matchesQuery;
  });
});

function getBranchStock(prod: RetailProduct): number {
  return prod.stockByBranch[authStore.userBranchId] ?? 0;
}

function getStockBadgeClass(prod: RetailProduct) {
  const stock = getBranchStock(prod);
  if (stock <= 0) return 'bg-rose-100 text-rose-700 border border-rose-200';
  if (stock <= prod.minStock) return 'bg-amber-100 text-amber-800 border border-amber-200';
  return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
}

function handleProductClick(product: RetailProduct) {
  try {
    posStore.addToCart(product, 1);
  } catch (err: any) {
    toastStore.warning('Caja Cerrada', err.message);
  }
}

function handleBarcodeEnter() {
  if (!searchQuery.value) return;
  const match = inventoryStore.products.find(
    p => p.barcode === searchQuery.value.trim() || p.sku.toLowerCase() === searchQuery.value.trim().toLowerCase()
  );

  if (match) {
    handleProductClick(match);
    toastStore.info('Producto Escaneado', `${match.name} agregado al ticket.`);
    searchQuery.value = '';
  } else {
    toastStore.warning('No Encontrado', `No existe producto con código "${searchQuery.value}"`);
  }
}

function abrirModalCobro(method: PaymentMethod) {
  selectedPaymentMethod.value = method;
  amountPaid.value = posStore.cartTotal;
  voucherApproved.value = true;
  yapeCode.value = '';
  showPaymentModal.value = true;
}

const vueltoCalculado = computed(() => {
  return Number((amountPaid.value - posStore.cartTotal).toFixed(2));
});

function getPaymentIcon(method: PaymentMethod) {
  if (method === 'efectivo') return BanknotesIcon;
  if (method === 'tarjeta') return CreditCardIcon;
  return DevicePhoneMobileIcon;
}

function getPaymentMethodName(method: PaymentMethod) {
  if (method === 'efectivo') return 'Efectivo';
  if (method === 'tarjeta') return 'Tarjeta de Crédito / Débito';
  return 'Yape o Plin';
}

// LÓGICA DE COBRO ASÍNCRONA (Conectada al Backend Real)
async function confirmarVenta() {
  if (invoiceType.value === 'factura' && !clientDocNumber.value) {
    toastStore.warning('Dato Requerido', 'Para emitir Factura es obligatorio ingresar el RUC de 11 dígitos.');
    return;
  }

  const clientDocType = invoiceType.value === 'factura' ? 'RUC' : (clientDocNumber.value ? 'DNI' : 'SIN_DOC');

  try {
    isProcessing.value = true;

    // Llamamos al store esperando la respuesta de Node.js
    const sale = await posStore.procesarVenta({
      paymentMethod: selectedPaymentMethod.value,
      amountPaid: amountPaid.value,
      invoiceType: invoiceType.value,
      clientDocType,
      clientDocNumber: clientDocNumber.value || undefined,
      clientName: clientName.value || undefined
    });

    showPaymentModal.value = false;
    showSuccessTicketModal.value = true;
    clientDocNumber.value = '';
    clientName.value = '';

    toastStore.success(
      'Venta Completada',
      `Comprobante ${sale.ticketNumber} emitido exitosamente por S/ ${sale.total.toFixed(2)}.`
    );
  } catch (err: any) {
    toastStore.error('Error al Cobrar', err.message);
  } finally {
    isProcessing.value = false;
  }
}

function imprimirTicket() {
  window.print();
}
</script>