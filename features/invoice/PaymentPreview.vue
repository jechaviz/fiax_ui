<template>
  <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-10 max-w-5xl mx-auto font-sans text-slate-900 dark:text-slate-100" id="payment-preview">
    <!-- Header Section -->
    <div class="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 dark:border-slate-700/50 pb-12">
      <div class="space-y-4">
        <h2 class="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">{{ payment.issuer?.name }}</h2>
        <div class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ payment.issuer?.rfc }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Régimen Fiscal:</span> {{ resolveLabel('RegimenFiscal', payment.issuer?.taxRegime) }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Lugar de Expedición:</span> {{ payment.expeditionPlace }}</p>
        </div>
      </div>
      <div class="text-right">
        <h1 class="text-4xl font-black uppercase tracking-tighter text-slate-100 dark:text-slate-700/30 mb-2 leading-none">RECIBO DE PAGO</h1>
        <p class="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200">{{ payment.serie }}{{ payment.folio }}</p>
        <div v-if="payment.uuid" class="mt-6">
          <p class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">UUID: {{ payment.uuid }}</p>
        </div>
      </div>
    </div>

    <!-- Receiver & Payment info -->
    <div class="grid grid-cols-2 gap-12 mb-12 p-8 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Receptor</p>
        <p class="font-bold text-xl text-slate-900 dark:text-white mb-2">{{ payment.receiver?.name }}</p>
        <div class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ payment.receiver?.rfc }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Uso CFDI:</span> {{ resolveLabel('UsoCFDI', 'CP01') }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Dom. Fiscal:</span> {{ payment.receiver?.postalCode }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Datos del Pago</p>
        <div class="space-y-4">
          <div>
            <p class="text-slate-800 dark:text-slate-200 font-bold text-lg">{{ formatDate(payment.paymentDate) }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de Pago</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Forma</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold">{{ payment.paymentType }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operación</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold font-mono">{{ payment.operationNumber || '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Documents Table -->
    <div class="mb-12">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Documentos Relacionados (Facturas Pagadas)</h3>
      <div class="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
        <table class="w-full text-left table-fixed">
          <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th class="p-4 w-[40%]">Id Documento / Folio</th>
              <th class="p-4 text-right w-[15%]">Imp. Pagado</th>
              <th class="p-4 text-right w-[15%]">Saldo Ant.</th>
              <th class="p-4 text-right w-[15%]">Saldo Insol.</th>
              <th class="p-4 text-center w-[15%]">Parcialidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <tr v-for="doc in payment.relatedDocuments" :key="doc.uuid" class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
              <td class="p-4">
                <div class="text-xs font-black text-slate-900 dark:text-white mb-1">{{ doc.serie }}{{ doc.folio }}</div>
                <div class="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ doc.uuid }}</div>
              </td>
              <td class="p-4 text-right font-black text-slate-900 dark:text-white text-sm">{{ formatCurrency(doc.amountPaid, doc.currency) }}</td>
              <td class="p-4 text-right font-medium text-slate-500 dark:text-slate-400 text-xs">{{ formatCurrency(doc.previousBalance, doc.currency) }}</td>
              <td class="p-4 text-right font-black text-primary-600 dark:text-primary-400 text-sm">{{ formatCurrency(doc.remainingBalance, doc.currency) }}</td>
              <td class="p-4 text-center text-xs font-bold text-slate-400">{{ doc.installmentNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Totals and QR Section -->
    <div class="flex flex-col md:flex-row justify-between gap-12">
      <div class="flex-grow space-y-8">
        <div v-if="payment.notes">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Comentarios</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ payment.notes }}</p>
        </div>
        
        <!-- Mock QR and Seals -->
        <div v-if="payment.uuid" class="pt-8 border-t border-slate-100 dark:border-slate-700 flex gap-8 items-start">
          <div class="w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
            <i class="fa-solid fa-qrcode text-6xl text-slate-200 dark:text-slate-700"></i>
          </div>
          <div class="flex-1 space-y-4 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
            <div class="space-y-1">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-0.5">Sello Digital SAT</p>
              <p class="break-all opacity-70">{{ payment.satSeal || 'mOcK_sAt_SeAl_vAlUe==' }}</p>
            </div>
            <div class="space-y-1">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-0.5">Sello Digital Emisor</p>
              <p class="break-all opacity-70">{{ payment.issuerSeal || 'mOcK_iSsUeR_sEaL_vAlUe==' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-sm flex-shrink-0">
        <div class="bg-primary-600 dark:bg-primary-700 rounded-3xl p-8 space-y-6 shadow-xl shadow-primary-500/20 text-white">
          <div class="text-center space-y-2 mb-4 border-b border-white/10 pb-4">
             <p class="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Monto Total de Pago</p>
             <h3 class="text-4xl font-black tracking-tighter">{{ formatCurrency(payment.total, payment.currency) }}</h3>
             <p class="text-xs text-primary-100 font-bold uppercase tracking-widest">{{ payment.currency }}</p>
          </div>
          
          <div class="space-y-3 text-[10px] text-primary-100 font-bold uppercase tracking-widest">
            <div class="flex justify-between">
              <span>Equivalencia DR</span>
              <span>1 {{ payment.currency }} = {{ payment.exchangeRate || 1 }} MXN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentPreview',
  props: {
    payment: { type: Object, required: true }
  },
  setup(props) {
    const formatCurrency = (amount, currency = 'MXN') => {
      return (amount || 0).toLocaleString('en-US', { style: 'currency', currency });
    };

    const formatDate = (date) => {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    const resolveLabel = (catalog, key) => {
      const cat = window.fiax.demo_data?.catalogs?.[catalog];
      if (!cat || !key) return key || '—';
      if (Array.isArray(cat)) return cat.find(i => i.id === key)?.name || key;
      return cat[key] || key;
    };

    return { formatCurrency, formatDate, resolveLabel };
  }
}
</script>

<style scoped>
#payment-preview {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-print-color-adjust: exact;
}
@media print {
  #payment-preview {
    box-shadow: none !important;
    padding: 0 !important;
    background: white !important;
  }
}
</style>
