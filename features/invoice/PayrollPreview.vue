<template>
  <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-10 max-w-5xl mx-auto font-sans text-slate-900 dark:text-slate-100" id="payroll-preview">
    <!-- Header Section -->
    <div class="grid grid-cols-2 gap-12 mb-10 border-b border-slate-100 dark:border-slate-700/50 pb-10">
      <div class="space-y-4">
        <h2 class="font-bold text-2xl tracking-tight text-slate-800 dark:text-white">{{ payroll.issuer?.name }}</h2>
        <div class="text-xs text-slate-500 font-bold uppercase tracking-widest">
           RFC: <span class="text-slate-900 dark:text-slate-300 ml-1 font-mono">{{ payroll.issuer?.rfc }}</span>
        </div>
      </div>
      <div class="text-right">
        <h1 class="text-4xl font-black uppercase tracking-tighter text-slate-100 dark:text-slate-700/30 mb-1">RECIBO DE NÓMINA</h1>
        <p class="font-mono text-xl font-bold text-slate-800 dark:text-slate-200">FOLIO: {{ payroll.serie }}{{ payroll.folio }}</p>
      </div>
    </div>

    <!-- Employee Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 p-8 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div class="md:col-span-2">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Datos del Empleado</p>
        <p class="font-bold text-xl text-slate-900 dark:text-white mb-4">{{ payroll.employee?.name }}</p>
        <div class="grid grid-cols-2 gap-x-8 gap-y-3">
          <div class="text-xs">
            <span class="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest block mb-0.5">RFC</span>
            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">{{ payroll.employee?.rfc }}</span>
          </div>
          <div class="text-xs">
            <span class="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest block mb-0.5">CURP</span>
            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">{{ payroll.employee?.curp }}</span>
          </div>
          <div v-if="payroll.employee?.nss" class="text-xs">
            <span class="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest block mb-0.5">Num. Seg. Social</span>
            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">{{ payroll.employee?.nss }}</span>
          </div>
        </div>
      </div>
      <div class="md:col-span-1 border-l border-slate-200 dark:border-slate-700 pl-8">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Periodo de Pago</p>
        <div class="space-y-4">
           <div>
              <p class="text-slate-900 dark:text-white font-bold text-lg">{{ formatDate(payroll.paymentDate) }}</p>
              <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fecha de Pago</p>
           </div>
           <div class="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
              {{ formatDate(payroll.startDate) }} — {{ formatDate(payroll.endDate) }}
           </div>
        </div>
      </div>
    </div>

    <!-- Perceptions & Deductions Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
      <!-- Perceptions -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">I. Percepciones</h3>
        <div class="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 text-[10px] uppercase font-black tracking-widest border-b border-emerald-100 dark:border-emerald-900/30">
              <tr>
                <th class="p-3">Concepto / Clave</th>
                <th class="p-3 text-right">Gravado</th>
                <th class="p-3 text-right">Exento</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="p in payroll.perceptions" :key="p.clave" class="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                <td class="p-3">
                  <div class="font-bold text-slate-700 dark:text-slate-300">{{ p.concept }}</div>
                  <div class="text-[9px] font-mono text-slate-400 dark:text-slate-500 tracking-widest">{{ p.type }} - {{ p.clave }}</div>
                </td>
                <td class="p-3 text-right font-medium text-slate-600 dark:text-slate-400 font-mono">{{ formatCurrency(p.amountTaxable) }}</td>
                <td class="p-3 text-right font-medium text-slate-600 dark:text-slate-400 font-mono">{{ formatCurrency(p.amountExempt) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50/50 dark:bg-slate-700/30 font-bold border-t border-slate-100 dark:border-slate-700">
              <tr>
                <td class="p-3 text-[10px] uppercase tracking-widest text-slate-500">Subtotal Percepciones</td>
                <td colspan="2" class="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm font-black">{{ formatCurrency(payroll.subtotal) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Deductions -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">II. Deducciones</h3>
        <div class="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 text-[10px] uppercase font-black tracking-widest border-b border-rose-100 dark:border-rose-900/30">
              <tr>
                <th class="p-3">Concepto / Clave</th>
                <th class="p-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr v-for="d in payroll.deductions" :key="d.clave" class="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                <td class="p-3">
                  <div class="font-bold text-slate-700 dark:text-slate-300">{{ d.concept }}</div>
                  <div class="text-[9px] font-mono text-slate-400 dark:text-slate-500 tracking-widest">{{ d.type }} - {{ d.clave }}</div>
                </td>
                <td class="p-3 text-right font-bold text-rose-500 dark:text-rose-400 font-mono">-{{ formatCurrency(d.amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50/50 dark:bg-slate-700/30 font-bold border-t border-slate-100 dark:border-slate-700">
              <tr>
                <td class="p-3 text-[10px] uppercase tracking-widest text-slate-500">Total Deducciones</td>
                <td class="p-3 text-right text-rose-600 dark:text-rose-400 text-sm font-black">{{ formatCurrency(payroll.discount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Net Pay & Seals -->
    <div class="flex flex-col md:flex-row justify-between gap-12 pt-10 border-t border-slate-100 dark:border-slate-700">
      <div class="flex-grow">
         <div v-if="payroll.uuid" class="space-y-6 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
            <div class="space-y-1">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-0.5">Sello Digital SAT</p>
              <p class="break-all opacity-70">{{ payroll.satSeal || 'mOcK_pAyRoLl_sAt_SeAl==' }}</p>
            </div>
            <div class="space-y-1">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-0.5">Sello Digital Emisor</p>
              <p class="break-all opacity-70">{{ payroll.issuerSeal || 'mOcK_pAyRoLl_iSsUeR_sEaL==' }}</p>
            </div>
          </div>
      </div>

      <div class="w-full max-w-sm flex-shrink-0">
        <div class="bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/20 text-white">
          <div class="text-center space-y-2 mb-6 border-b border-white/5 pb-4">
             <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neto Pagado al Empleado</p>
             <h3 class="text-4xl font-black tracking-tighter">{{ formatCurrency(payroll.total) }}</h3>
             <p class="text-xs text-primary-400 font-bold uppercase tracking-widest">MXN</p>
          </div>
          
          <div class="space-y-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div class="flex justify-between">
              <span>(+) Percepciones</span>
              <span class="text-white">{{ formatCurrency(payroll.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span>(-) Deducciones</span>
              <span class="text-rose-400">-{{ formatCurrency(payroll.discount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayrollPreview',
  props: {
    payroll: { type: Object, required: true }
  },
  setup() {
    const formatCurrency = (amount) => {
      return (amount || 0).toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'MXN' 
      });
    };

    const formatDate = (date) => {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    return { formatCurrency, formatDate };
  }
}
</script>

<style scoped>
#payroll-preview {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-print-color-adjust: exact;
}
@media print {
  #payroll-preview {
    box-shadow: none !important;
    padding: 0 !important;
    background: white !important;
  }
}
</style>
