import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Branch } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'sede-miraflores',
    name: 'Sede Miraflores (Principal)',
    code: 'SM-01',
    address: 'Av. Larco 450, Miraflores',
    district: 'Miraflores',
    city: 'Lima',
    phone: '(01) 445-8920',
    posTerminals: 3,
    activeCashiersCount: 2,
    managerName: 'Ing. Carlos Mendoza',
    status: 'operativa'
  },
  {
    id: 'sede-san-isidro',
    name: 'Sede San Isidro',
    code: 'SM-02',
    address: 'Av. Conquistadores 890, San Isidro',
    district: 'San Isidro',
    city: 'Lima',
    phone: '(01) 422-3150',
    posTerminals: 2,
    activeCashiersCount: 1,
    managerName: 'Lic. Mariana Vega',
    status: 'operativa'
  },
  {
    id: 'sede-surco',
    name: 'Sede Surco',
    code: 'SM-03',
    address: 'Av. Caminos del Inca 1220, Chacarilla',
    district: 'Santiago de Surco',
    city: 'Lima',
    phone: '(01) 275-6010',
    posTerminals: 2,
    activeCashiersCount: 1,
    managerName: 'Renzo Palacios',
    status: 'operativa'
  },
  {
    id: 'sede-los-olivos',
    name: 'Sede Los Olivos',
    code: 'SM-04',
    address: 'Av. Antúnez de Mayolo 1045',
    district: 'Los Olivos',
    city: 'Lima',
    phone: '(01) 521-7788',
    posTerminals: 2,
    activeCashiersCount: 1,
    managerName: 'Katia Benavides',
    status: 'operativa'
  }
];

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([...INITIAL_BRANCHES]);
  // Filtro de sede seleccionado en vistas administrativas (vacío o 'all' significa todas)
  const selectedBranchFilter = ref<string>('all');

  const activeBranches = computed(() => {
    return branches.value.filter(b => b.status === 'operativa');
  });

  const currentFilteredBranch = computed(() => {
    if (selectedBranchFilter.value === 'all') return null;
    return branches.value.find(b => b.id === selectedBranchFilter.value) || null;
  });

  function getBranchById(id: string): Branch | undefined {
    return branches.value.find(b => b.id === id);
  }

  function getBranchName(id: string): string {
    const b = getBranchById(id);
    return b ? b.name : 'Sede Desconocida';
  }

  function setBranchFilter(branchId: string) {
    selectedBranchFilter.value = branchId;
  }

  return {
    branches,
    selectedBranchFilter,
    activeBranches,
    currentFilteredBranch,
    getBranchById,
    getBranchName,
    setBranchFilter
  };
});
