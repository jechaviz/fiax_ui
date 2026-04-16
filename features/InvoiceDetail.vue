<template>
  <div v-if="loading" class="flex items-center justify-center p-20">
    <div class="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="!invoice" class="p-20 text-center space-y-4">
    <i class="fa-solid fa-file-circle-exclamation text-5xl text-slate-700"></i>
    <h2 class="text-xl font-bold text-white">Comprobante no encontrado</h2>
    <p class="text-slate-500">El CFDI solicitado no existe en la base de datos local.</p>
    <router-link to="/cfdi/ingresos" class="inline-block px-6 py-2 bg-white/5 rounded-xl text-white font-bold">Volver al listado</router-link>
  </div>

  <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
    <!-- Action Bar -->
    <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div class="flex items-center gap-4">
        <router-link to="/cfdi/ingresos" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <i class="fa-solid fa-arrow-left"></i>
        </router-link>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-white">Factura #{{ invoice.serie }}{{ invoice.folio }}</h1>
          <div class="flex items-center gap-2 mt-1">
             <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest" :class="statusColor">
                {{ invoice.status }}
             </span>
             <span class="text-slate-500 text-xs">•</span>
             <span class="text-slate-500 text-xs">ID Interno: {{ invoice.id }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button @click="printInvoice" class="app-button-secondary py-2 px-4 flex items-center gap-2">
          <i class="fa-solid fa-print"></i> Imprimir / PDF
        </button>
        <button @click="handleClone" class="app-button-ghost py-2 px-4 flex items-center gap-2 border border-white/5">
          <i class="fa-regular fa-copy"></i> Clonar
        </button>
        
        <template v-if="invoice.status === 'Vigente'">
          <router-link :to="`/cfdi/ingresos/${invoice.id}/edit`" class="app-button-primary py-2 px-6 flex items-center gap-2">
            <i class="fa-solid fa-pencil"></i> Editar
          </router-link>
          <button @click="handleSend" class="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-bold text-sm flex items-center gap-2">
            <i class="fa-regular fa-paper-plane"></i> Enviar
          </button>
          <button @click="handleCancel" class="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold text-sm flex items-center gap-2">
            <i class="fa-solid fa-ban"></i> Cancelar
          </button>
        </template>
        <template v-else>
           <button @click="handleSend" class="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-bold text-sm flex items-center gap-2">
            <i class="fa-regular fa-paper-plane"></i> Reenviar
           </button>
        </template>
      </div>
    </header>

    <!-- Cancellation Banner -->
    <div v-if="invoice.status === 'Cancelado'" class="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-start gap-4">
      <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 text-xl">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div>
        <h3 class="text-red-400 font-black uppercase tracking-widest text-xs mb-1">Comprobante Cancelado</h3>
        <p class="text-sm text-slate-400">Este comprobante ha sido invalidado ante el SAT. Motivo: {{ invoice.cancellationDetails?.motive || 'No especificado' }}.</p>
        <p v-if="invoice.cancellationDetails?.replacementUuid" class="text-xs text-slate-500 mt-2">UUID de Sustitución: <span class="font-mono">{{ invoice.cancellationDetails.replacementUuid }}</span></p>
      </div>
    </div>

    <!-- Preview Surface -->
    <div class="relative group">
      <!-- Glow effect -->
      <div class="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <!-- Actual Content -->
      <InvoicePreview :invoice="invoice" class="relative" />
    </div>

  </div>
</template>

<script>
import InvoicePreview from './invoice/InvoicePreview.vue';

export default {
  name: 'InvoiceDetail',
  components: {
    InvoicePreview
  },
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const route = VueRouter.useRoute();
    const router = VueRouter.useRouter();
    const loading = Vue.ref(true);
    const invoice = Vue.ref(null);

    Vue.onMounted(async () => {
      // Fetch invoice from state
      const id = route.params.id;
      invoice.value = props.state.data.invoices.find(inv => inv.id === id);
      loading.value = false;
    });

    const statusColor = Vue.computed(() => {
      if (!invoice.value) return '';
      return invoice.value.status === 'Vigente' 
        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
        : 'bg-red-500/10 text-red-400 border border-red-500/20';
    });

    function printInvoice() {
      window.print();
    }

    function handleClone() {
      if (!invoice.value) return;
      if (confirm('¿Deseas crear una copia de esta factura como borrador?')) {
        const newId = `inv-${Date.now()}`;
        const draft = {
          ...JSON.parse(JSON.stringify(invoice.value)),
          id: newId,
          status: 'Vigente',
          date: new Date().toISOString(),
          uuid: null,
          folio: String(Math.floor(Number(invoice.value.folio) + 1)),
          satSeal: null,
          issuerSeal: null
        };
        props.state.data.invoices.push(draft);
        router.push('/cfdi/ingresos/new'); // or edit with id
      }
    }

    function handleSend() {
      alert(`Simulando envío de correo a ${invoice.value.receiver?.name}...`);
    }

    function handleCancel() {
      const motive = prompt('Por favor, indica el motivo de cancelación (SAT):', '02 - Comprobante emitido con errores sin relación');
      if (motive) {
        invoice.value.status = 'Cancelado';
        invoice.value.cancellationDetails = { motive };
        alert('Solicitud de cancelación enviada al PAC satisfactoriamente.');
      }
    }

    return { 
      loading, 
      invoice, 
      statusColor, 
      printInvoice, 
      handleClone, 
      handleSend, 
      handleCancel 
    };
  }
}
</script>
