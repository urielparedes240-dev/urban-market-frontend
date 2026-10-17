import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RetailProduct, StockTransfer, ProductCategory } from '../types';

export const INITIAL_PRODUCTS: RetailProduct[] = [
  {
    id: 'prod-001',
    sku: 'BEB-0101',
    barcode: '7750106001201',
    name: 'Coca Cola Sin Azúcar 1.5 L',
    brand: 'The Coca-Cola Company',
    category: 'Bebidas',
    unit: 'Botella',
    price: 8.50,
    cost: 5.80,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
    minStock: 20,
    stockByBranch: {
      'sede-miraflores': 64,
      'sede-san-isidro': 38,
      'sede-surco': 45,
      'sede-los-olivos': 52
    },
    isFastSale: true
  },
  {
    id: 'prod-002',
    sku: 'BEB-0102',
    barcode: '7750106001300',
    name: 'Inca Kola Regular 1.5 L',
    brand: 'Corporación Lindley',
    category: 'Bebidas',
    unit: 'Botella',
    price: 8.50,
    cost: 5.75,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80',
    minStock: 25,
    stockByBranch: {
      'sede-miraflores': 82,
      'sede-san-isidro': 54,
      'sede-surco': 60,
      'sede-los-olivos': 78
    },
    isFastSale: true
  },
  {
    id: 'prod-003',
    sku: 'BEB-0103',
    barcode: '7751271000142',
    name: 'Agua Mineral San Mateo Sin Gas 600 ml',
    brand: 'Backus',
    category: 'Bebidas',
    unit: 'Botella',
    price: 2.80,
    cost: 1.40,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
    minStock: 30,
    stockByBranch: {
      'sede-miraflores': 95,
      'sede-san-isidro': 42,
      'sede-surco': 55,
      'sede-los-olivos': 70
    },
    isFastSale: true
  },
  {
    id: 'prod-004',
    sku: 'LAC-0201',
    barcode: '7750150001015',
    name: 'Leche Evaporada Gloria Azul 400 g',
    brand: 'Gloria',
    category: 'Lácteos',
    unit: 'Lata',
    price: 4.60,
    cost: 3.45,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
    minStock: 40,
    stockByBranch: {
      'sede-miraflores': 110,
      'sede-san-isidro': 28, // Crítico
      'sede-surco': 65,
      'sede-los-olivos': 92
    },
    isFastSale: true
  },
  {
    id: 'prod-005',
    sku: 'LAC-0202',
    barcode: '7750150004504',
    name: 'Yogurt Gloria Fresa Parcialmente Descremado 1 kg',
    brand: 'Gloria',
    category: 'Lácteos',
    unit: 'Botella',
    price: 7.20,
    cost: 5.10,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
    minStock: 15,
    stockByBranch: {
      'sede-miraflores': 32,
      'sede-san-isidro': 18,
      'sede-surco': 22,
      'sede-los-olivos': 29
    },
    isFastSale: false
  },
  {
    id: 'prod-006',
    sku: 'ABA-0301',
    barcode: '7750243003012',
    name: 'Arroz Extra Costeño Bolsa 1 kg',
    brand: 'Costeño',
    category: 'Abarrotes',
    unit: 'Bolsa',
    price: 5.40,
    cost: 4.10,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    minStock: 50,
    stockByBranch: {
      'sede-miraflores': 85,
      'sede-san-isidro': 45,
      'sede-surco': 70,
      'sede-los-olivos': 130
    },
    isFastSale: true
  },
  {
    id: 'prod-007',
    sku: 'ABA-0302',
    barcode: '7750885002010',
    name: 'Aceite Vegetal Primor Clásico 900 ml',
    brand: 'Alicorp',
    category: 'Abarrotes',
    unit: 'Botella',
    price: 9.80,
    cost: 7.50,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    minStock: 25,
    stockByBranch: {
      'sede-miraflores': 48,
      'sede-san-isidro': 24, // Crítico
      'sede-surco': 33,
      'sede-los-olivos': 55
    },
    isFastSale: true
  },
  {
    id: 'prod-008',
    sku: 'ABA-0303',
    barcode: '7750885005523',
    name: 'Atún Primor Trozos en Aceite Vegetal 170 g',
    brand: 'Primor',
    category: 'Abarrotes',
    unit: 'Lata',
    price: 6.50,
    cost: 4.60,
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=300&q=80',
    minStock: 30,
    stockByBranch: {
      'sede-miraflores': 72,
      'sede-san-isidro': 35,
      'sede-surco': 40,
      'sede-los-olivos': 80
    },
    isFastSale: true
  },
  {
    id: 'prod-009',
    sku: 'PAN-0401',
    barcode: '7750650001019',
    name: 'Pan de Molde Bimbo Blanco Grande 770 g',
    brand: 'Bimbo',
    category: 'Panadería',
    unit: 'Bolsa',
    price: 8.90,
    cost: 6.70,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    minStock: 15,
    stockByBranch: {
      'sede-miraflores': 22,
      'sede-san-isidro': 14, // Crítico
      'sede-surco': 19,
      'sede-los-olivos': 25
    },
    isFastSale: true
  },
  {
    id: 'prod-010',
    sku: 'SNK-0501',
    barcode: '7750031002014',
    name: 'Papas Lays Clásicas Onduladas 160 g',
    brand: 'Frito Lay',
    category: 'Snacks',
    unit: 'Bolsa',
    price: 6.80,
    cost: 4.90,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
    minStock: 20,
    stockByBranch: {
      'sede-miraflores': 45,
      'sede-san-isidro': 28,
      'sede-surco': 32,
      'sede-los-olivos': 50
    },
    isFastSale: true
  },
  {
    id: 'prod-011',
    sku: 'GOL-0601',
    barcode: '7622210100124',
    name: 'Galletas Oreo Original Paquete x6 tubos',
    brand: 'Mondelēz',
    category: 'Golosinas',
    unit: 'Pack',
    price: 5.50,
    cost: 3.80,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
    minStock: 25,
    stockByBranch: {
      'sede-miraflores': 58,
      'sede-san-isidro': 31,
      'sede-surco': 40,
      'sede-los-olivos': 62
    },
    isFastSale: true
  },
  {
    id: 'prod-012',
    sku: 'LIM-0701',
    barcode: '7750243009021',
    name: 'Detergente en Polvo Ariel Doble Poder 1 kg',
    brand: 'Procter & Gamble',
    category: 'Limpieza',
    unit: 'Bolsa',
    price: 13.50,
    cost: 9.90,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
    minStock: 20,
    stockByBranch: {
      'sede-miraflores': 36,
      'sede-san-isidro': 19, // Crítico
      'sede-surco': 28,
      'sede-los-olivos': 42
    },
    isFastSale: false
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'trf-001',
    code: 'TRF-2026-0041',
    originBranchId: 'sede-miraflores',
    destBranchId: 'sede-san-isidro',
    date: '2026-09-25 10:30',
    productId: 'prod-004',
    productName: 'Leche Evaporada Gloria Azul 400 g',
    quantity: 30,
    status: 'COMPLETADO',
    responsible: 'Ing. Carlos Mendoza',
    guideNumber: 'T001-000142'
  },
  {
    id: 'trf-002',
    code: 'TRF-2026-0042',
    originBranchId: 'sede-miraflores',
    destBranchId: 'sede-surco',
    date: '2026-09-25 14:15',
    productId: 'prod-007',
    productName: 'Aceite Vegetal Primor Clásico 900 ml',
    quantity: 15,
    status: 'EN_TRANSITO',
    responsible: 'Renzo Palacios',
    guideNumber: 'T001-000143'
  }
];

export const useInventoryStore = defineStore('inventory', () => {
  const products = ref<RetailProduct[]>([...INITIAL_PRODUCTS]);
  const transfers = ref<StockTransfer[]>([...INITIAL_TRANSFERS]);
  const selectedCategory = ref<string>('all');

  const totalCatalogItems = computed(() => products.value.length);

  // Calcula el stock total consolidado de un producto sumando todas las sedes
  function getTotalStock(product: RetailProduct): number {
    return Object.values(product.stockByBranch).reduce((acc, val) => acc + val, 0);
  }

  // Stock para una sede en particular
  function getStockInBranch(product: RetailProduct, branchId: string): number {
    return product.stockByBranch[branchId] ?? 0;
  }

  // Estado del stock en una sede (o consolidado)
  function getStockStatus(product: RetailProduct, branchId?: string): 'optimo' | 'critico' | 'agotado' {
    const stock = branchId && branchId !== 'all' ? getStockInBranch(product, branchId) : getTotalStock(product);
    if (stock <= 0) return 'agotado';
    if (stock <= product.minStock) return 'critico';
    return 'optimo';
  }

  // Descontar inventario al vender en el POS
  function decrementStock(branchId: string, productId: string, quantity: number) {
    const prod = products.value.find(p => p.id === productId);
    if (prod && prod.stockByBranch[branchId] !== undefined) {
      prod.stockByBranch[branchId] = Math.max(0, prod.stockByBranch[branchId] - quantity);
    }
  }

  // Ajuste manual simple
  function adjustStock(branchId: string, productId: string, newStock: number, reason: string) {
    const prod = products.value.find(p => p.id === productId);
    if (prod) {
      prod.stockByBranch[branchId] = newStock;
    }
  }

  // Ajuste de stock físico multi-sede (una o más sedes, sumar, restar o fijar exacto)
  function adjustStockMulti(
    productId: string, 
    branchIds: string[], 
    mode: 'set' | 'add' | 'subtract', 
    amount: number, 
    reason: string
  ) {
    const prod = products.value.find(p => p.id === productId);
    if (!prod) return false;

    branchIds.forEach(branchId => {
      const current = prod.stockByBranch[branchId] || 0;
      if (mode === 'set') {
        prod.stockByBranch[branchId] = Math.max(0, amount);
      } else if (mode === 'add') {
        prod.stockByBranch[branchId] = current + Math.max(0, amount);
      } else if (mode === 'subtract') {
        prod.stockByBranch[branchId] = Math.max(0, current - Math.max(0, amount));
      }
    });

    return true;
  }

  // Crear nuevo producto en el catálogo
  function addProduct(payload: Omit<RetailProduct, 'id'>): RetailProduct {
    const newId = `prod-${Date.now()}`;
    const newProduct: RetailProduct = {
      ...payload,
      id: newId,
      status: 'activo',
      stockByBranch: payload.stockByBranch || {
        'sede-miraflores': 0,
        'sede-san-isidro': 0,
        'sede-surco': 0,
        'sede-los-olivos': 0
      }
    };
    products.value.unshift(newProduct);
    return newProduct;
  }

  // Modificar producto existente
  function updateProduct(id: string, updates: Partial<RetailProduct>) {
    const index = products.value.findIndex(p => p.id === id);
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...updates
      };
      return products.value[index];
    }
    return null;
  }

  // Dar de baja o reactivar producto (no elimina, cambia estado para auditoría y lo oculta del POS)
  function toggleProductStatus(id: string, reason?: string) {
    const prod = products.value.find(p => p.id === id);
    if (prod) {
      if (prod.status === 'de_baja') {
        prod.status = 'activo';
        prod.deactivationReason = undefined;
        prod.deactivationDate = undefined;
      } else {
        prod.status = 'de_baja';
        prod.deactivationReason = reason || 'Dado de baja por administración';
        prod.deactivationDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
      }
      return prod.status;
    }
    return null;
  }

  // Registrar traslado entre dos sedes
  function transferStock(originBranchId: string, destBranchId: string, productId: string, quantity: number, responsible: string) {
    const prod = products.value.find(p => p.id === productId);
    if (!prod) return false;

    const currentOrigin = prod.stockByBranch[originBranchId] || 0;
    if (currentOrigin < quantity) return false;

    // Descontar del origen
    prod.stockByBranch[originBranchId] = currentOrigin - quantity;
    // Sumar al destino
    prod.stockByBranch[destBranchId] = (prod.stockByBranch[destBranchId] || 0) + quantity;

    const transferCode = `TRF-2026-${String(transfers.value.length + 43).padStart(4, '0')}`;
    transfers.value.unshift({
      id: `trf-${Date.now()}`,
      code: transferCode,
      originBranchId,
      destBranchId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      productId: prod.id,
      productName: prod.name,
      quantity,
      status: 'COMPLETADO',
      responsible,
      guideNumber: `T001-${String(Math.floor(Math.random() * 900000) + 100000)}`
    });

    return true;
  }

  return {
    products,
    transfers,
    selectedCategory,
    totalCatalogItems,
    getTotalStock,
    getStockInBranch,
    getStockStatus,
    decrementStock,
    adjustStock,
    adjustStockMulti,
    addProduct,
    updateProduct,
    toggleProductStatus,
    transferStock
  };
});
