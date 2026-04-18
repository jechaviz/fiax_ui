<template>
  <div class="band-totals p-8 bg-slate-50/50 dark:bg-slate-900/20">
    <div class="flex flex-col md:flex-row justify-between gap-12">
      <!-- Left side: Amount in words & Notes -->
      <div class="flex-grow space-y-6">
        <div v-if="invoice.cantidadLetra" class="space-y-1">
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ rules.resolvePattern('~Importe con Letra~Amount in Words~') }}</span>
           <p class="text-sm text-slate-600 dark:text-slate-400 italic">
             *** ({{ invoice.cantidadLetra }}) ***
           </p>
        </div>

        <div v-if="invoice.observations">
           <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ rules.resolvePattern('~Observaciones~Observations~') }}</h4>
           <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
             {{ invoice.observations }}
           </p>
        </div>
      </div>

      <!-- Right side: Calculation Breakdown -->
      <div class="w-full max-w-[280px] flex-shrink-0">
        <div class="space-y-2.5">
          <!-- Subtotal -->
          <div class="flex justify-between text-sm">
             <span class="text-slate-500 dark:text-slate-400">{{ rules.resolvePattern('~Subtotal~Subtotal~') }}</span>
             <span class="font-semibold text-slate-800 dark:text-slate-200">{{ formatCurrency(invoice.subTotal) }}</span>
          </div>

          <!-- Taxes Loop (Rule driven grouping) -->
          <div v-if="invoice.taxes?.groups?.length">
             <div v-for="tax in invoice.taxes.groups" :key="tax.name" class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">
                  {{ tax.name }} {{ (tax.rate * 100).toFixed(0) }}% {{ tax.isRetention ? '(RET)' : '(TRA)' }}
                </span>
                <span :class="tax.isRetention ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'" class="font-semibold">
                   {{ tax.isRetention ? '-' : '' }}{{ formatCurrency(tax.amount) }}
                </span>
             </div>
          </div>

          <!-- Total -->
          <div class="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
             <div class="flex flex-col items-end">
                <span class="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-1">Total {{ rules.getConstant('currency', invoice.moneda || 'MXN') }}</span>
                <span class="text-3xl font-black tracking-tight text-primary-600 dark:text-primary-400">
                 {{ formatCurrency(invoice.total) }}
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['invoice', 'config'],
  setup(props) {
    const rules = window.fiax?.rules;
    const formatCurrency = (val) => {
        return (val || 0).toLocaleString('en-US', { 
            style: 'currency', 
            currency: props.invoice.moneda || 'MXN' 
        });
    };
    return { rules, formatCurrency };
  }
}
</script>
