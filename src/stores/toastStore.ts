import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Toast } from '../types';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function show(toast: Omit<Toast, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000
    };

    toasts.value.push(newToast);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, newToast.duration);
    }
    return id;
  }

  function success(title: string, message: string = '') {
    return show({ type: 'success', title, message });
  }

  function warning(title: string, message: string = '') {
    return show({ type: 'warning', title, message });
  }

  function error(title: string, message: string = '') {
    return show({ type: 'error', title, message });
  }

  function info(title: string, message: string = '') {
    return show({ type: 'info', title, message });
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  function clearAll() {
    toasts.value = [];
  }

  return {
    toasts,
    show,
    success,
    warning,
    error,
    info,
    remove,
    clearAll
  };
});
