import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  ShiftTurnReport, 
  CartItem, 
  POSSaleRecord, 
  RetailProduct, 
  ShiftTurn, 
  PaymentMethod, 
  InvoiceType 
} from '../types';
import { useInventoryStore } from './inventoryStore';
import { useAuthStore } from './authStore';

export const usePosStore = defineStore('pos', () => {
  const inventoryStore = useInventoryStore();
  const authStore = useAuthStore();

  // Turno de Caja Activo (null si la caja está cerrada)
  // Almacenamos en ref y persistimos en localStorage para consistencia de sesión
  const activeShift = ref<ShiftTurnReport | null>(null);

  // Historial de turnos cerrados (reportes Z de caja)
  const shiftHistory = ref<ShiftTurnReport[]>([
    {
      id: 'shift-prev-001',
      cashierId: 'usr-cajero-01',
      cashierName: 'Jorge Quispe Cárdenas',
      branchId: 'sede-miraflores',
      branchName: 'Sede Miraflores (Principal)',
      turn: 'mañana',
      openingTime: '2026-09-24 07:02',
      closingTime: '2026-09-24 15:05',
      initialCash: 250.00,
      cashSales: 1845.50,
      cardSales: 2120.00,
      yapePlinSales: 940.00,
      totalSales: 4905.50,
      transactionsCount: 88,
      expectedCash: 2095.50, // 250 + 1845.50
      actualCashCount: 2095.50,
      difference: 0.00,
      status: 'closed',
      notes: 'Turno cerrado sin novedades. Cuadre exacto.',
      movements: []
    }
  ]);

  // Carrito del Punto de Venta (POS)
  const cart = ref<CartItem[]>([]);
  const fastDiscountPercent = ref<number>(0);

  // Historial de ventas de la sesión
  const salesHistory = ref<POSSaleRecord[]>([
    {
      id: 'sale-init-01',
      ticketNumber: 'B001-0004120',
      invoiceType: 'boleta',
      branchId: 'sede-miraflores',
      branchName: 'Sede Miraflores (Principal)',
      cashierId: 'usr-cajero-01',
      cashierName: 'Jorge Quispe Cárdenas',
      date: '2026-09-25',
      time: '08:35',
      items: [
        { productId: 'prod-001', productName: 'Coca Cola Sin Azúcar 1.5 L', sku: 'BEB-0101', quantity: 2, unitPrice: 8.50, subtotal: 17.00 },
        { productId: 'prod-010', productName: 'Papas Lays Clásicas Onduladas 160 g', sku: 'SNK-0501', quantity: 1, unitPrice: 6.80, subtotal: 6.80 }
      ],
      subtotal: 20.17,
      igv: 3.63,
      discountTotal: 0,
      total: 23.80,
      paymentMethod: 'efectivo',
      amountPaid: 30.00,
      changeGiven: 6.20,
      clientDocType: 'SIN_DOC',
      sunatStatus: 'ACEPTADO',
      sunatHash: 'q8zL7mP9Kx2W==',
      shiftId: 'shift-prev-001'
    }
  ]);

  const lastSale = ref<POSSaleRecord | null>(null);

  // Getters
  const isShiftOpen = computed(() => {
    return activeShift.value !== null && activeShift.value.status === 'open';
  });

  const cartItemsCount = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    const rawSum = cart.value.reduce((acc, item) => acc + item.subtotal, 0);
    const discount = (rawSum * fastDiscountPercent.value) / 100;
    return Math.max(0, rawSum - discount);
  });

  const cartSubtotal = computed(() => {
    // En Perú el total ya incluye IGV (18%), se desglosa base gravada
    return Number((cartTotal.value / 1.18).toFixed(2));
  });

  const cartIgv = computed(() => {
    return Number((cartTotal.value - cartSubtotal.value).toFixed(2));
  });

  // Acciones de Apertura y Cierre de Caja
  function abrirCaja(payload: {
    initialCash: number;
    turn: ShiftTurn;
    notes?: string;
  }) {
    const branchId = authStore.userBranchId;
    const branchName = authStore.userBranchName;
    const cashierId = authStore.currentUser?.id || 'usr-cajero';
    const cashierName = authStore.currentUser?.name || 'Cajero';

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newShift: ShiftTurnReport = {
      id: `shift-${Date.now()}`,
      cashierId,
      cashierName,
      branchId,
      branchName,
      turn: payload.turn,
      openingTime: formattedDate,
      initialCash: Number(payload.initialCash) || 0,
      cashSales: 0,
      cardSales: 0,
      yapePlinSales: 0,
      totalSales: 0,
      transactionsCount: 0,
      expectedCash: Number(payload.initialCash) || 0,
      status: 'open',
      notes: payload.notes || '',
      movements: [
        {
          id: `mov-${Date.now()}`,
          time: formattedDate,
          type: 'apertura',
          amount: Number(payload.initialCash) || 0,
          method: 'efectivo',
          description: `Apertura de turno ${payload.turn} con fondo de caja inicial`
        }
      ]
    };

    activeShift.value = newShift;
    return newShift;
  }

  function cerrarCaja(payload: {
    actualCashCount: number;
    notes?: string;
  }): ShiftTurnReport | null {
    if (!activeShift.value) return null;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const expected = activeShift.value.initialCash + activeShift.value.cashSales;
    const actual = Number(payload.actualCashCount) || 0;
    const diff = Number((actual - expected).toFixed(2));

    activeShift.value.closingTime = formattedDate;
    activeShift.value.actualCashCount = actual;
    activeShift.value.expectedCash = expected;
    activeShift.value.difference = diff;
    activeShift.value.status = 'closed';
    activeShift.value.notes = payload.notes || activeShift.value.notes;

    // Agregar al historial de turnos
    const closedReport = { ...activeShift.value };
    shiftHistory.value.unshift(closedReport);

    // Limpiar carrito y bloquear POS
    cart.value = [];
    activeShift.value = null;

    return closedReport;
  }

  // Acciones del Carrito POS
  function addToCart(product: RetailProduct, quantity: number = 1) {
    if (!isShiftOpen.value) {
      throw new Error('La caja se encuentra cerrada. Debe aperturar el turno para cobrar.');
    }

    const existingIndex = cart.value.findIndex(item => item.product.id === product.id);
    if (existingIndex !== -1) {
      cart.value[existingIndex].quantity += quantity;
      cart.value[existingIndex].subtotal = Number((cart.value[existingIndex].quantity * cart.value[existingIndex].unitPrice).toFixed(2));
    } else {
      cart.value.push({
        product,
        quantity,
        unitPrice: product.price,
        discountPercent: 0,
        subtotal: Number((quantity * product.price).toFixed(2))
      });
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.value.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      item.subtotal = Number((quantity * item.unitPrice).toFixed(2));
    }
  }

  function removeFromCart(productId: string) {
    cart.value = cart.value.filter(i => i.product.id !== productId);
  }

  function clearCart() {
    cart.value = [];
    fastDiscountPercent.value = 0;
  }

  // Cobro y Emisión de Comprobante Electrónico (Boleta/Factura)
  function procesarVenta(params: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    invoiceType: InvoiceType;
    clientDocType: 'DNI' | 'RUC' | 'SIN_DOC';
    clientDocNumber?: string;
    clientName?: string;
  }): POSSaleRecord {
    if (!activeShift.value) {
      throw new Error('No hay turno abierto en esta caja.');
    }
    if (cart.value.length === 0) {
      throw new Error('El carrito está vacío.');
    }

    const totalSale = cartTotal.value;
    const amountPaid = params.paymentMethod === 'efectivo' ? Number(params.amountPaid) : totalSale;
    const changeGiven = params.paymentMethod === 'efectivo' ? Math.max(0, Number((amountPaid - totalSale).toFixed(2))) : 0;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Generar serie y correlativo tipo SUNAT
    const series = params.invoiceType === 'factura' ? 'F001' : 'B001';
    const correlative = String(salesHistory.value.length + 4129).padStart(7, '0');
    const ticketNumber = `${series}-${correlative}`;

    // Descontar inventario físico de la sede del cajero
    const branchId = activeShift.value.branchId;
    for (const item of cart.value) {
      inventoryStore.decrementStock(branchId, item.product.id, item.quantity);
    }

    // Actualizar caja del turno activo
    if (params.paymentMethod === 'efectivo') {
      activeShift.value.cashSales = Number((activeShift.value.cashSales + totalSale).toFixed(2));
      activeShift.value.expectedCash = Number((activeShift.value.initialCash + activeShift.value.cashSales).toFixed(2));
    } else if (params.paymentMethod === 'tarjeta') {
      activeShift.value.cardSales = Number((activeShift.value.cardSales + totalSale).toFixed(2));
    } else if (params.paymentMethod === 'yape_plin') {
      activeShift.value.yapePlinSales = Number((activeShift.value.yapePlinSales + totalSale).toFixed(2));
    }

    activeShift.value.totalSales = Number((activeShift.value.totalSales + totalSale).toFixed(2));
    activeShift.value.transactionsCount += 1;

    activeShift.value.movements.push({
      id: `mov-sale-${Date.now()}`,
      time: `${dateStr} ${timeStr}`,
      type: 'venta',
      amount: totalSale,
      method: params.paymentMethod,
      description: `Venta ${ticketNumber} (${params.paymentMethod.toUpperCase()})`,
      referenceTicket: ticketNumber
    });

    const newSale: POSSaleRecord = {
      id: `sale-${Date.now()}`,
      ticketNumber,
      invoiceType: params.invoiceType,
      branchId,
      branchName: activeShift.value.branchName,
      cashierId: activeShift.value.cashierId,
      cashierName: activeShift.value.cashierName,
      date: dateStr,
      time: timeStr,
      items: cart.value.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal
      })),
      subtotal: cartSubtotal.value,
      igv: cartIgv.value,
      discountTotal: Number(((cart.value.reduce((acc, i) => acc + i.subtotal, 0) * fastDiscountPercent.value) / 100).toFixed(2)),
      total: totalSale,
      paymentMethod: params.paymentMethod,
      amountPaid,
      changeGiven,
      clientDocType: params.clientDocType,
      clientDocNumber: params.clientDocNumber,
      clientName: params.clientName,
      sunatStatus: 'ACEPTADO',
      sunatHash: Math.random().toString(36).substring(2, 10).toUpperCase() + '==',
      shiftId: activeShift.value.id
    };

    salesHistory.value.unshift(newSale);
    lastSale.value = newSale;
    clearCart();

    return newSale;
  }

  return {
    activeShift,
    shiftHistory,
    cart,
    fastDiscountPercent,
    salesHistory,
    lastSale,
    isShiftOpen,
    cartItemsCount,
    cartTotal,
    cartSubtotal,
    cartIgv,
    abrirCaja,
    cerrarCaja,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    procesarVenta
  };
});
