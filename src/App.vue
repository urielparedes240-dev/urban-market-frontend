<template>
  <div id="app" class="min-h-screen text-slate-800 bg-slate-50">
    <router-view />
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import ToastNotification from './components/common/ToastNotification.vue';
</script>
