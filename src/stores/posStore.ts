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
import apiClient from '../services/api'; // <-- Cliente HTTP importado

export const usePosStore = defineStore('pos', () => {
  const inventoryStore = useInventoryStore();
  const authStore = useAuthStore();

  const activeShift = ref<ShiftTurnReport | null>(null);

  const shiftHistory = ref<ShiftTurnReport[]>([]); // Limpiamos el mock, lo llenaremos desde BD luego

  const cart = ref<CartItem[]>([]);
  const fastDiscountPercent = ref<number>(0);
  const salesHistory = ref<POSSaleRecord[]>([]); // Limpiamos mocks
  const lastSale = ref<POSSaleRecord | null>(null);

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
    return Number((cartTotal.value / 1.18).toFixed(2));
  });

  const cartIgv = computed(() => {
    return Number((cartTotal.value - cartSubtotal.value).toFixed(2));
  });

  // 1. APERTURA DE CAJA (Conectada al Backend Real)
  async function abrirCaja(payload: {
    initialCash: number;
    turn: ShiftTurn;
    notes?: string;
  }) {
    try {
      // Hacemos el POST al servidor en Node.js
      const response = await apiClient.post('/caja/apertura', {
        initial_amount: payload.initialCash,
        turn: payload.turn
      });

      const dbShift = response.data.shift;

      const branchId = authStore.userBranchId || 'sede-desconocida';
      const branchName = authStore.userBranchName || 'Sede';
      const cashierId = authStore.currentUser?.id || 'usr-cajero';
      const cashierName = authStore.currentUser?.name || 'Cajero';

      // Mapeamos los datos de la base de datos a tu tipo Frontend
      const newShift: ShiftTurnReport = {
        id: String(dbShift.id), // ID real numérico de PostgreSQL
        cashierId,
        cashierName,
        branchId,
        branchName,
        turn: dbShift.turn,
        openingTime: dbShift.opening_time || new Date().toISOString(),
        initialCash: Number(dbShift.initial_cash),
        cashSales: 0,
        cardSales: 0,
        yapePlinSales: 0,
        totalSales: 0,
        transactionsCount: 0,
        expectedCash: Number(dbShift.expected_cash),
        status: 'open',
        notes: payload.notes || '',
        movements: [] // Los movimientos extras los podemos traer después
      };

      activeShift.value = newShift;
      return newShift;

    } catch (error: any) {
      console.error('Error al abrir caja:', error);
      throw new Error(error.response?.data?.error || 'Error interno al aperturar la caja');
    }
  }

  // --- LAS SIGUIENTES FUNCIONES DE CAJA MANTIENEN SU LÓGICA LOCAL POR AHORA ---
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

    const closedReport = { ...activeShift.value };
    shiftHistory.value.unshift(closedReport);

    cart.value = [];
    activeShift.value = null;

    return closedReport;
  }

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

  // 2. COBRO Y EMISIÓN DE COMPROBANTE (Conectado al Backend Real)
  async function procesarVenta(params: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    invoiceType: InvoiceType;
    clientDocType: 'DNI' | 'RUC' | 'SIN_DOC';
    clientDocNumber?: string;
    clientName?: string;
  }): Promise<POSSaleRecord> {
    if (!activeShift.value) throw new Error('No hay turno abierto en esta caja.');
    if (cart.value.length === 0) throw new Error('El carrito está vacío.');

    try {
      // Armamos el JSON exactamente como lo exige tu controlador en Node
      const payload = {
        items: cart.value.map(item => ({
          product_id: Number(item.product.id), // Aseguramos que sea un número para PostgreSQL
          quantity: item.quantity,
          unit_price: item.unitPrice
        })),
        payment_method: params.paymentMethod,
        amount_paid: params.amountPaid,
        invoice_type: params.invoiceType,
        client_doc_type: params.clientDocType,
        client_doc_number: params.clientDocNumber,
        client_name: params.clientName
      };

      // Disparamos la petición HTTP usando Axios
      const response = await apiClient.post('/pos/venta', payload);
      const dbSale = response.data.venta;

      // Mapeamos la respuesta real de la base de datos a tu tipo del frontend
      const newSale: POSSaleRecord = {
        id: String(dbSale.id),
        ticketNumber: dbSale.ticket_number,
        invoiceType: dbSale.invoice_type,
        branchId: activeShift.value.branchId,
        branchName: activeShift.value.branchName,
        cashierId: activeShift.value.cashierId,
        cashierName: activeShift.value.cashierName,
        date: new Date(dbSale.date_time).toLocaleDateString('es-PE'),
        time: new Date(dbSale.date_time).toLocaleTimeString('es-PE'),
        items: cart.value.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          sku: i.product.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal
        })),
        subtotal: Number(dbSale.subtotal),
        igv: Number(dbSale.igv),
        discountTotal: 0,
        total: Number(dbSale.total),
        paymentMethod: dbSale.payment_method,
        amountPaid: Number(dbSale.amount_paid),
        changeGiven: Number(dbSale.change_given),
        clientDocType: dbSale.client_doc_type,
        clientDocNumber: dbSale.client_doc_number,
        clientName: dbSale.client_name,
        sunatStatus: dbSale.sunat_status || 'PENDIENTE',
        sunatHash: dbSale.sunat_hash || '',
        shiftId: activeShift.value.id
      };

      // Actualizamos el estado global para reflejar la venta
      salesHistory.value.unshift(newSale);
      lastSale.value = newSale;

      // Restamos de caja local para mantener la vista sincronizada
      if (params.paymentMethod === 'efectivo') {
        activeShift.value.cashSales += newSale.total;
      } else if (params.paymentMethod === 'tarjeta') {
        activeShift.value.cardSales += newSale.total;
      } else {
        activeShift.value.yapePlinSales += newSale.total;
      }
      activeShift.value.expectedCash = activeShift.value.initialCash + activeShift.value.cashSales;

      clearCart();
      return newSale;

    } catch (error: any) {
      console.error('Error procesando venta en API:', error);
      throw new Error(error.response?.data?.error || 'Error interno al procesar la venta en el servidor');
    }
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