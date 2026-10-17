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
      // 1. Caja y Turnos (Apertura y Cierre)
      {
        path: 'caja/apertura',
        name: 'caja-apertura',
        component: AperturaCaja,
        meta: {
          title: 'Apertura y Cierre de Caja'
        }
      },
      // 2. Punto de Venta (POS) - Solo accesible si la caja está abierta
      {
        path: 'pos',
        name: 'pos',
        component: POS,
        meta: {
          requiresOpenShift: true,
          title: 'Punto de Venta Rápido (POS)'
        }
      },
      // 3. Dashboard Global (Admin)
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardGlobal,
        meta: {
          requiresAdmin: true,
          title: 'Dashboard Global de Cadena'
        }
      },
      // 4. Inventario Multisede (Admin & Consultas)
      {
        path: 'inventario',
        name: 'inventario',
        component: InventarioMultisede,
        meta: {
          title: 'Inventario Multi-Sede'
        }
      },
      // 5. RRHH y Planillas (Admin)
      {
        path: 'rrhh',
        name: 'rrhh',
        component: RrhhView,
        meta: {
          requiresAdmin: true,
          title: 'Recursos Humanos y Turnos'
        }
      },
      // 6. Contabilidad y SUNAT (Admin)
      {
        path: 'contabilidad',
        name: 'contabilidad',
        component: ContabilidadSunat,
        meta: {
          requiresAdmin: true,
          title: 'Facturación Electrónica SUNAT'
        }
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

// ROUTE GUARDS: Protección estricta de Roles y Estado de Caja
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const posStore = usePosStore();
  const toastStore = useToastStore();

  // 1. Verificar si requiere autenticación
  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  // 2. Si ya está autenticado e intenta ir a /login
  if (to.name === 'login' && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next('/dashboard');
    } else {
      next(posStore.isShiftOpen ? '/pos' : '/caja/apertura');
    }
    return;
  }

  // 3. Protección de áreas administrativas frente a cajeros/trabajadores
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    toastStore.warning(
      'Módulo Restringido',
      'Esta sección administrativa está reservada para Gerencia General y Supervisores de cadena.'
    );
    next(posStore.isShiftOpen ? '/pos' : '/caja/apertura');
    return;
  }

  // 4. Protección del POS: Bloqueado si la caja está cerrada
  if (to.meta.requiresOpenShift) {
    // Si un Admin intenta entrar al POS, notificarle que su rol es de supervisión
    if (authStore.isAdmin) {
      toastStore.info(
        'Modo Supervisión',
        'El perfil Administrador supervisa las tiendas. Cambia al rol Trabajador (Cajero) para emitir ventas en el POS.'
      );
      next('/dashboard');
      return;
    }

    // Para el cajero: si la caja NO está abierta, bloquear acceso al POS
    if (!posStore.isShiftOpen) {
      toastStore.warning(
        'Caja Cerrada (POS Bloqueado)',
        'Debes registrar el monto inicial y dar clic en "Abrir Caja / Iniciar Turno" para poder vender.'
      );
      next('/caja/apertura');
      return;
    }
  }

  next();
});

export default router;
