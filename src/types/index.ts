// Tipos TypeScript para ERP de Cadena de Minimarkets Multi-Sede (Retail / Supermercado)

export type UserRole = 'admin' | 'trabajador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string; // 'Gerencia General' | 'Trabajador'
  branchId: string;  // Sede asignada (para trabajador es su tienda fija)
  branchName: string;
  avatar?: string;
  dni: string;
  phone?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  posTerminals: number;
  activeCashiersCount: number;
  managerName: string;
  status: 'operativa' | 'mantenimiento' | 'cerrada';
}

// Control de Turnos y Caja
export type ShiftTurn = 'mañana' | 'tarde' | 'noche';
export type ShiftStatus = 'open' | 'closed';

export interface CashMovement {
  id: string;
  time: string;
  type: 'apertura' | 'ingreso' | 'retiro' | 'venta';
  amount: number;
  method: 'efectivo' | 'tarjeta' | 'yape_plin';
  description: string;
  referenceTicket?: string;
}

export interface ShiftTurnReport {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  branchName: string;
  turn: ShiftTurn;
  openingTime: string;
  closingTime?: string;
  initialCash: number;       // Monto de apertura en caja
  cashSales: number;         // Cobros en efectivo
  cardSales: number;         // Cobros con tarjeta POS
  yapePlinSales: number;     // Cobros con billeteras móviles
  totalSales: number;        // Suma total de ventas
  transactionsCount: number; // Cantidad de tickets emitidos
  expectedCash: number;      // initialCash + cashSales
  actualCashCount?: number;  // Conteo físico reportado en el arqueo
  difference?: number;       // actualCashCount - expectedCash (0: conforme, >0: sobrante, <0: faltante)
  status: ShiftStatus;
  notes?: string;
  movements: CashMovement[];
}

// Productos e Inventario Multi-Sede
export type ProductCategory = 
  | 'Bebidas'
  | 'Abarrotes'
  | 'Snacks'
  | 'Lácteos'
  | 'Panadería'
  | 'Frutas y Verduras'
  | 'Limpieza'
  | 'Golosinas';

export interface RetailProduct {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: ProductCategory;
  unit: string; // 'Und', 'Kg', 'Pack', 'Botella', 'Bolsa'
  price: number; // Precio PVP en Soles S/ (con IGV)
  cost: number;  // Costo unitario promedio en Soles S/
  image: string;
  minStock: number;
  stockByBranch: Record<string, number>; // Ej: { 'sede-miraflores': 45, 'sede-san-isidro': 12, ... }
  isFastSale?: boolean; // Para botón rápido táctil en POS
  status?: 'activo' | 'de_baja';
  deactivationReason?: string;
  deactivationDate?: string;
}

// Punto de Venta (POS) & Carrito
export interface CartItem {
  product: RetailProduct;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'yape_plin';
export type InvoiceType = 'boleta' | 'factura' | 'ticket_simple';

export interface POSSaleRecord {
  id: string;
  ticketNumber: string; // Ej: B001-0004128 o F001-0000842
  invoiceType: InvoiceType;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  date: string;
  time: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  igv: number; // 18%
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  clientDocType: 'DNI' | 'RUC' | 'SIN_DOC';
  clientDocNumber?: string;
  clientName?: string;
  sunatStatus: 'ACEPTADO' | 'PENDIENTE' | 'RECHAZADO';
  sunatHash?: string;
  shiftId: string;
}

// RRHH y Trabajadores
export type PensionSystemType = 'AFP Integra' | 'AFP Prima' | 'AFP Habitat' | 'AFP Profuturo' | 'ONP';

export interface RetailWorker {
  id: string;
  dni: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  jobTitle: string; // 'Trabajador' (todos pueden realizar todas las operaciones)
  branchId: string;
  shift: ShiftTurn;
  salary: number;
  hireDate: string;
  status: 'Activo' | 'Vacaciones' | 'Inactivo' | 'Cesado';
  pensionSystem: PensionSystemType;
  cuspp?: string; // Código Único de Identificación del SPP
  hasFamilyAllowance: boolean; // Asignación familiar (S/ 102.50)
  bankName?: string;
  bankAccountNumber?: string;
  deactivationReason?: string;
  deactivationDate?: string;
}

// Boleta Electrónica de Pago
export interface WorkerPayslip {
  id: string;
  code: string; // Ej: BOL-2026-09-001
  workerId: string;
  workerName: string;
  dni: string;
  jobTitle: string;
  branchName: string;
  period: string; // 'Septiembre 2026'
  hireDate: string;
  pensionSystem: PensionSystemType;
  cuspp: string;
  daysWorked: number;
  basicSalary: number;
  familyAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  grossIncome: number;
  pensionDiscount: number;
  pensionRate: number; // Porcentaje AFP (ej. 12.85%) o ONP (13%)
  incomeTax5ta: number; // Retención 5ta categoría si aplica
  otherDiscounts: number;
  totalDiscounts: number;
  netPay: number;
  essaludContribution: number; // Aporte empleador 9%
  status: 'emitida' | 'pagada';
  issueDate: string;
  signedElectronic: boolean;
}

// Traslados entre Sedes
export interface StockTransfer {
  id: string;
  code: string; // TRF-2026-001
  originBranchId: string;
  destBranchId: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'COMPLETADO' | 'EN_TRANSITO';
  responsible: string;
  guideNumber: string;
}

// Notificaciones Toast Globales
export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}
