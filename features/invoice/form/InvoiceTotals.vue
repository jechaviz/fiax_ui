<template>
  <div
    class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 neural-glass shadow-xl"
    data-form-totals-surface="invoice"
    :data-form-totals-payload="surfacePayloadJson"
  >
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

      <div
        v-for="row in taxRows"
        :key="row.group_label"
        class="flex justify-between text-sm"
        data-form-totals-tax-row="1"
      >
        <span class="text-slate-400" data-surface-tax-label="1">{{ row.group_label }}:</span>
        <span
          class="font-medium"
          :class="row.tax_amount_currency < 0 ? 'text-red-400' : taxRowColor(row.group_label)"
          data-surface-tax-amount="1"
        >{{ formatTaxAmount(row.tax_amount_currency) }}</span>
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
    },
    setup(props) {
        const surfaceAdapter = window.fiax && window.fiax.formSurfaces && window.fiax.formSurfaces.invoiceTotals;
        if (!surfaceAdapter) {
            throw new Error('FIAX invoice totals surface adapter is required');
        }

        const surfacePayload = Vue.computed(() => surfaceAdapter.toFormTotalsPayload(props.totals || {}));
        const surfacePayloadJson = Vue.computed(() => JSON.stringify(surfacePayload.value));
        const taxRows = Vue.computed(() => surfaceAdapter.buildTaxRows(props.totals || {}));

        const taxRowColor = (label) => label.includes('Locales') ? 'text-green-300' : 'text-green-400';
        const formatTaxAmount = (amount) => {
            const prefix = Number(amount) < 0 ? '-' : '+';
            return `${prefix}${props.state.formatCurrency(Math.abs(Number(amount) || 0), props.currency)}`;
        };

        return { surfacePayloadJson, taxRows, taxRowColor, formatTaxAmount };
    }
}
</script>
