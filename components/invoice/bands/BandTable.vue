<template>
  <div class="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl mb-8">
    <!-- Detail loading overlay -->
    <div v-if="loadingDetail" class="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
      <span class="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></span>
      Cargando conceptos...
    </div>
    <table v-else class="w-full text-left table-fixed">
      <thead>
        <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-[50%]">Descripción del Concepto</th>
          <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-[10%]">Cant.</th>
          <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-[15%]">Unitario</th>
          <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-[10%]">Desc.</th>
          <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-[15%]">Importe</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
        <template v-for="(item, idx) in invoice.items" :key="item.id || idx">
          <!-- Main Content Row -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
            <td class="p-4 pb-1 align-top">
              <div class="flex flex-col gap-1 mb-1">
                <div class="text-[10px] font-mono uppercase tracking-widest leading-none flex items-center gap-2 flex-wrap">
                  <span v-if="item.noIdentificacion" class="text-slate-600 dark:text-slate-300 font-bold">ID: {{ item.noIdentificacion }}</span>
                  <span v-if="item.noIdentificacion" class="text-slate-300 dark:text-slate-600">|</span>
                  <span class="text-slate-400 dark:text-slate-500">UdS: {{ item.unitCode }}</span>
                  <span class="text-slate-300 dark:text-slate-600">|</span>
                  <span class="text-slate-400 dark:text-slate-500">CPS: {{ item.productCode }}</span>
                </div>
              </div>
              <div class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {{ item.description }}
              </div>
            </td>
            <td class="p-4 pb-1 text-right align-top text-sm text-slate-600 dark:text-slate-400">{{ item.quantity }}</td>
            <td class="p-4 pb-1 text-right align-top text-sm text-slate-600 dark:text-slate-400">{{ formatCurrency(item.unitPrice) }}</td>
            <td class="p-4 pb-1 text-right align-top text-sm text-slate-400">{{ formatCurrency(item.discount || 0) }}</td>
            <td class="p-4 pb-1 text-right align-top text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(item.amount) }}</td>
          </tr>
          
          <!-- Taxes & Advanced Info Row -->
          <tr class="border-none">
            <td colspan="5" class="p-4 pt-1 pb-4">
              <div class="flex flex-col gap-3">
                <!-- Tax Groups for the item -->
                <div v-if="item.taxes?.length" class="flex flex-col items-end gap-1">
                  <div v-for="(tax, tIdx) in item.taxes" :key="tIdx" class="flex justify-between w-64 text-[10px] font-mono uppercase tracking-widest border-b border-slate-50 dark:border-slate-700/30 pb-0.5 last:border-0">
                    <span class="text-slate-400 dark:text-slate-500">{{ tax.taxType }} {{ (tax.rate * 100).toFixed(2) }}% {{ tax.isRetention ? '(Ret)' : '(Tra)' }}</span>
                    <span :class="tax.isRetention ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'" class="font-bold">
                      {{ tax.isRetention ? '-' : '' }}{{ formatCurrency(tax.amount) }}
                    </span>
                  </div>
                </div>

                <!-- Advanced metadata -->
                <div v-if="item.informacionAduanera?.length || item.cuentaPredial" class="pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-2 py-1">
                  <div v-if="item.informacionAduanera?.length" class="flex items-center gap-2 text-[10px]">
                    <span class="font-bold text-slate-400 uppercase tracking-widest">Aduana:</span>
                    <span v-for="ped in item.informacionAduanera" :key="ped.numeroPedimento" class="text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{{ ped.numeroPedimento }}</span>
                  </div>
                  <div v-if="item.cuentaPredial" class="flex items-center gap-2 text-[10px]">
                    <span class="font-bold text-slate-400 uppercase tracking-widest">Predial:</span>
                    <span class="text-slate-700 dark:text-slate-300 font-mono">{{ item.cuentaPredial.numero }}</span>
                  </div>
                </div>

                <!-- Parts (Sub-items) -->
                <div v-if="item.partes?.length" class="mt-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
                   <p class="text-[9px] font-bold text-indigo-400 dark:text-indigo-400/60 uppercase tracking-widest mb-2">Partes / Componentes</p>
                   <div class="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/20 dark:bg-slate-900/20">
                      <table class="w-full text-left text-[10px]">
                        <thead>
                          <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                            <th class="p-2 font-bold text-slate-500 uppercase">Descripción</th>
                            <th class="p-2 font-bold text-slate-500 text-right">Cant.</th>
                            <th class="p-2 font-bold text-slate-500 text-right">Unitario</th>
                            <th class="p-2 font-bold text-slate-500 text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="part in item.partes" :key="part.id" class="border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                            <td class="p-2">
                              <span v-if="part.productCode" class="text-[9px] font-mono text-slate-400 dark:text-slate-500 mr-2">CPS: {{ part.productCode }}</span>
                              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ part.description }}</span>
                            </td>
                            <td class="p-2 text-right text-slate-600 dark:text-slate-400">{{ part.quantity }}</td>
                            <td class="p-2 text-right text-slate-600 dark:text-slate-400">{{ formatCurrency(part.unitPrice || 0) }}</td>
                            <td class="p-2 text-right font-bold text-slate-800 dark:text-white">{{ formatCurrency(part.amount || (part.quantity * (part.unitPrice || 0))) }}</td>
                          </tr>
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['invoice', 'config', 'loadingDetail'],
  setup(props) {
    const rules = window.fiax?.rules;
    
    // Default columns if not provided in config
    const columns = props.config.columns || [
        { id: 'description', label: '~Descripción~Description~', align: 'left' },
        { id: 'quantity', label: '~Cant~Qty~', align: 'right' },
        { id: 'unitPrice', label: '~P. Unitario~Unit Price~', align: 'right' },
        { id: 'amount', label: '~Importe~Amount~', align: 'right' }
    ];

    const isIndustrial = rules.resolve('settings.high_density', false).value;
    const priceFormat = rules.resolve('settings.price_format', null).value;

    const formatCurrency = (val) => {
        return (val || 0).toLocaleString('en-US', { style: 'currency', currency: props.invoice.moneda || 'MXN' });
    };

    return { rules, columns, isIndustrial, priceFormat, formatCurrency };
  }
}
</script>
