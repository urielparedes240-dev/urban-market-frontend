import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import LoginView from '../views/LoginView.vue';
import AperturaCaja from '../views/AperturaCaja.vue';
import POS from '../views/POS.vue';
import InventarioMultisede from '../views/InventarioMultisede.vue';
import DashboardGlobal from '../views/DashboardGlobal.vue';
import RrhhView from '../views/RrhhView.vue';
import ContabilidadSunat from '../views/ContabilidadSunat.vue';
import { useAuthStore } from '../stores/authStore';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean;
    requiresAdmin?: boolean;
    requiresOpenShift?: boolean;
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true, title: 'Acceso Urba Market E.I.R.L | ERP Retail' }
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'root',
        redirect: () => {
          const auth = useAuthStore();
          const pos = usePosStore();
          if (auth.isAdmin) return '/dashboard';
          return pos.isShiftOpen ? '/pos' : '/caja/apertura';
        }
      },
      {
        path: 'caja/apertura',
        name: 'caja-apertura',
        component: AperturaCaja,
        meta: { title: 'Apertura y Cierre de Caja' }
      },
      {
        path: 'pos',
        name: 'pos',
        component: POS,
        meta: { requiresOpenShift: true, title: 'Punto de Venta Rápido (POS)' }
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardGlobal,
        meta: { requiresAdmin: true, title: 'Dashboard Global de Cadena' }
      },
      {
        path: 'inventario',
        name: 'inventario',
        component: InventarioMultisede,
        meta: { title: 'Inventario Multi-Sede' }
      },
      {
        path: 'rrhh',
        name: 'rrhh',
        component: RrhhView,
        meta: { requiresAdmin: true, title: 'Recursos Humanos y Turnos' }
      },
      {
        path: 'contabilidad',
        name: 'contabilidad',
        component: ContabilidadSunat,
        meta: { requiresAdmin: true, title: 'Facturación Electrónica SUNAT' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// ROUTE GUARDS: Protección estricta de Roles y Estado de Caja (Corregido)
router.beforeEach((to, _from) => {
  const authStore = useAuthStore();
  const posStore = usePosStore();
  const toastStore = useToastStore();

  // 1. Verificar si requiere autenticación
  if (!to.meta.public && !authStore.isAuthenticated) {
    return '/login';
  }

  // 2. Si ya está autenticado e intenta ir a /login
  if (to.name === 'login' && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return '/dashboard';
    } else {
      return posStore.isShiftOpen ? '/pos' : '/caja/apertura';
    }
  }

  // 3. Protección de áreas administrativas frente a cajeros/trabajadores
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    toastStore.warning(
      'Módulo Restringido',
      'Esta sección administrativa está reservada para Gerencia General y Supervisores de cadena.'
    );
    return posStore.isShiftOpen ? '/pos' : '/caja/apertura';
  }

  // 4. Protección del POS: Bloqueado si la caja está cerrada
  if (to.meta.requiresOpenShift) {
    if (authStore.isAdmin) {
      toastStore.info(
        'Modo Supervisión',
        'El perfil Administrador supervisa las tiendas. Cambia al rol Trabajador (Cajero) para emitir ventas en el POS.'
      );
      return '/dashboard';
    }

    if (!posStore.isShiftOpen) {
      toastStore.warning(
        'Caja Cerrada (POS Bloqueado)',
        'Debes registrar el monto inicial y dar clic en "Abrir Caja / Iniciar Turno" para poder vender.'
      );
      return '/caja/apertura';
    }
  }

  return true; // Reemplaza a next() para permitir la navegación
});

export default router;