<template>
  <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 neural-glass shadow-xl">
    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resumen de Totales</h3>
    
    <div class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">Subtotal:</span>
        <span class="text-white font-medium">{{ state.formatCurrency(totals.subtotal, currency) }}</span>
      </div>
      
      <div v-if="totals.discount > 0" class="flex justify-between text-sm">
        <span class="text-slate-400">Descuento:</span>
        <span class="text-red-400 font-medium">-{{ state.formatCurrency(totals.discount, currency) }}</span>
      </div>

      <!-- Taxes Summary -->
      <div v-if="totals.taxTotal > 0" class="flex justify-between text-sm">
        <span class="text-slate-400">Total Impuestos Trasladados:</span>
        <span class="text-green-400 font-medium">+{{ state.formatCurrency(totals.taxTotal, currency) }}</span>
      </div>
      
      <div v-if="totals.retainedTotal > 0" class="flex justify-between text-sm">
        <span class="text-slate-400">Total Impuestos Retenidos:</span>
        <span class="text-red-400 font-medium">-{{ state.formatCurrency(totals.retainedTotal, currency) }}</span>
      </div>

      <div v-if="totals.localTaxTotal > 0" class="flex justify-between text-sm">
        <span class="text-slate-400">Total Impuestos Locales:</span>
        <span class="text-green-300 font-medium">+{{ state.formatCurrency(totals.localTaxTotal, currency) }}</span>
      </div>
    </div>

    <!-- Grand Total -->
    <div class="pt-4 border-t border-white/10 flex justify-between items-center">
      <span class="text-white font-black text-xl uppercase tracking-tighter">Total</span>
      <div class="text-right">
        <span class="text-white font-black text-3xl tracking-tight">{{ state.formatCurrency(totals.total, currency) }}</span>
        <p class="text-[10px] text-slate-500 font-bold mt-1">{{ currency }} - Peso Mexicano</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'InvoiceTotals',
    props: {
        totals: Object,
        state: Object,
        currency: String
    }
}
</script>
