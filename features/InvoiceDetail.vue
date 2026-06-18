<template>
  <div v-if="loading" class="flex items-center justify-center p-20">
    <div class="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="!invoice" class="p-20 text-center space-y-4">
    <i class="fa-solid fa-file-circle-exclamation text-5xl text-slate-700"></i>
    <h2 class="text-xl font-bold text-white">Comprobante no encontrado</h2>
    <p class="text-slate-500">El CFDI solicitado no existe en la base de datos local.</p>
    <router-link :to="basePath" class="inline-block px-6 py-2 bg-white/5 rounded-xl text-white font-bold">Volver al listado</router-link>
  </div>

  <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
    <!-- Action Bar -->
    <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div class="flex items-center gap-4">
        <router-link :to="basePath" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <i class="fa-solid fa-arrow-left"></i>
        </router-link>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-white">{{ documentLabel }} #{{ invoice.serie }}{{ invoice.folio }}</h1>
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
        <button @click="downloadXml" :disabled="downloadingXml" class="app-button-secondary py-2 px-4 flex items-center gap-2">
          <i v-if="downloadingXml" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-file-code"></i> XML
        </button>
        <button @click="downloadPdf" :disabled="downloadingPdf" class="app-button-secondary py-2 px-4 flex items-center gap-2">
          <i v-if="downloadingPdf" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-file-pdf"></i> PDF
        </button>
        <button @click="handleClone" class="app-button-ghost py-2 px-4 flex items-center gap-2 border border-white/5">
          <i class="fa-regular fa-copy"></i> Clonar
        </button>
        
        <template v-if="invoice.status === 'Vigente'">
          <router-link :to="editPath" class="app-button-primary py-2 px-6 flex items-center gap-2">
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
      <InvoicePreview ref="previewRef" :invoice="invoice" class="relative" />
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
    state: { type: Object, required: true },
    type: { type: String, default: '' }
  },
  setup(props) {
    const route = VueRouter.useRoute();
    const router = VueRouter.useRouter();
    const loading = Vue.ref(true);
    const invoice = Vue.ref(null);
    const downloadingXml = Vue.ref(false);
    const downloadingPdf = Vue.ref(false);
    const previewRef = Vue.ref(null);

    function findInvoice(list) {
      return (list || []).find(inv => String(inv.id) === String(route.params.id)) || null;
    }

    // React when state hydrates (covers list→detail navigation)
    Vue.watch(
      () => props.state.data.invoices,
      (list) => {
        const found = findInvoice(list);
        if (found) { invoice.value = found; loading.value = false; }
      },
      { immediate: true }
    );

    Vue.onMounted(async () => {
      // Always fetch full detail from proxy (has issuer, receiver, lineItems)
      try {
        const full = await window.fiax?.api?.getInvoiceDetail?.(route.params.id);
        if (full) { invoice.value = full; loading.value = false; return; }
      } catch (e) { /* ignore */ }
      // Fallback: use state list entry if detail fetch failed
      if (invoice.value) { loading.value = false; return; }
      loading.value = false;
    });

    const statusColor = Vue.computed(() => {
      if (!invoice.value) return '';
      return invoice.value.status === 'Timbrado' || invoice.value.status === 'Vigente'
        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
        : 'bg-red-500/10 text-red-400 border border-red-500/20';
    });
    const currentType = Vue.computed(() => {
      if (invoice.value?.tipoDeComprobante) return invoice.value.tipoDeComprobante;
      if (props.type) return props.type;
      if (route.path.includes('/egresos')) return 'E';
      if (route.path.includes('/traslado')) return 'T';
      return 'I';
    });
    const basePath = Vue.computed(() => {
      if (currentType.value === 'E') return '/cfdi/egresos';
      if (currentType.value === 'T') return '/cfdi/traslado';
      return '/cfdi/ingresos';
    });
    const documentLabel = Vue.computed(() => {
      if (currentType.value === 'E') return 'Nota de Credito';
      if (currentType.value === 'T') return 'Carta Porte';
      return 'Factura';
    });
    const editPath = Vue.computed(() => invoice.value ? `${basePath.value}/${invoice.value.id}/edit` : basePath.value);

    async function downloadXml() {
      if (!invoice.value || downloadingXml.value) return;
      downloadingXml.value = true;
      try {
        const filename = `CFDI_${invoice.value.serie}${invoice.value.folio}_${invoice.value.uuid || invoice.value.id}.xml`;
        await window.fiax.api.downloadXml(invoice.value.id, filename);
      } catch (e) {
        alert(e.message || 'No se pudo descargar el XML.');
      } finally {
        downloadingXml.value = false;
      }
    }

    async function downloadPdf() {
      if (!invoice.value || downloadingPdf.value) return;
      downloadingPdf.value = true;
      try {
        const filename = `CFDI_${invoice.value.serie}${invoice.value.folio}_${invoice.value.uuid || invoice.value.id}.pdf`;
        await window.fiax.api.downloadPdf(invoice.value.id, filename);
      } catch (_) {
        // Odoo PDF not available — fall back to html2canvas export
        await previewRef.value?.exportToPdf?.();
      } finally {
        downloadingPdf.value = false;
      }
    }

    function printInvoice() {
      window.print();
    }

    async function handleClone() {
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
        await props.state.saveInvoice(draft);
        router.push(`${basePath.value}/${newId}/edit`);
      }
    }

    async function handleSend() {
      if (!invoice.value) return;
      const recipient = invoice.value.receiver?.email || invoice.value.email || '';
      const result = await window.fiax.api.sendInvoice(invoice.value, recipient);
      if (!result.ok) {
        alert(result.message || 'No se pudo enviar: falta backend fiscal o servicio de correo configurado.');
        return;
      }
      alert('Factura enviada correctamente.');
    }

    async function handleCancel() {
      const motive = prompt('Por favor, indica el motivo de cancelación (SAT):', '02 - Comprobante emitido con errores sin relación');
      if (motive) {
        const result = await window.fiax.api.cancelInvoice(invoice.value, motive);
        if (!result.ok) {
          alert(result.message || 'No se pudo cancelar: falta backend fiscal o PAC configurado.');
          return;
        }
        const canceled = result.data?.invoice || { ...invoice.value, status: 'Cancelado', cancellationDetails: { motive } };
        invoice.value = canceled;
        await props.state.saveInvoice(canceled);
        alert('Factura cancelada correctamente.');
      }
    }

    return {
      loading,
      invoice,
      previewRef,
      statusColor,
      basePath,
      documentLabel,
      editPath,
      downloadXml,
      downloadingXml,
      downloadPdf,
      downloadingPdf,
      printInvoice,
      handleClone,
      handleSend,
      handleCancel
    };
  }
}
</script>
