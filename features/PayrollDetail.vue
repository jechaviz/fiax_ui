<template>
  <div v-if="loading" class="flex items-center justify-center p-20">
    <div class="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="!payroll" class="p-20 text-center space-y-4">
    <i class="fa-solid fa-file-circle-exclamation text-5xl text-slate-700"></i>
    <h2 class="text-xl font-bold text-white">Recibo de Nómina no encontrado</h2>
    <p class="text-slate-500">El CFDI de nómina solicitado no existe.</p>
    <router-link to="/cfdi/nomina" class="inline-block px-6 py-2 bg-white/5 rounded-xl text-white font-bold">Volver al listado</router-link>
  </div>

  <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
    <!-- Action Bar -->
    <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div class="flex items-center gap-4">
        <router-link to="/cfdi/nomina" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <i class="fa-solid fa-arrow-left"></i>
        </router-link>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-white">Recibo Nómina #{{ payroll.serie }}{{ payroll.folio }}</h1>
          <div class="flex items-center gap-2 mt-1">
             <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TIMBRADO
             </span>
             <span class="text-slate-500 text-xs">•</span>
             <span class="text-slate-500 text-xs">ID: {{ payroll.id }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button @click="print" class="app-button-secondary py-2 px-4 flex items-center gap-2">
          <i class="fa-solid fa-print"></i> Imprimir / PDF
        </button>
        <button @click="handleSend" class="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-bold text-sm flex items-center gap-2">
          <i class="fa-regular fa-paper-plane"></i> Enviar al Empleado
        </button>
      </div>
    </header>

    <!-- Preview Surface -->
    <div class="relative group">
      <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      <PayrollPreview :payroll="payroll" class="relative" />
    </div>
  </div>
</template>

<script>
import PayrollPreview from './invoice/PayrollPreview.vue';

export default {
  name: 'PayrollDetail',
  components: {
    PayrollPreview
  },
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const route = VueRouter.useRoute();
    const loading = Vue.ref(true);
    const payroll = Vue.ref(null);

    Vue.onMounted(() => {
      const id = route.params.id;
      payroll.value = props.state.data.payrollReceipts.find(p => p.id === id);
      loading.value = false;
    });

    const print = () => window.print();
    const handleSend = () => alert(`Enviando recibo a ${payroll.value.employee?.name}...`);

    return { loading, payroll, print, handleSend };
  }
}
</script>
