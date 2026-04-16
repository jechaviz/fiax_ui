<template>
  <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-10 max-w-5xl mx-auto font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300" id="invoice-preview">
    <!-- Header Section -->
    <div class="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 dark:border-slate-700/50 pb-12">
      <div class="space-y-4">
        <h2 class="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">{{ invoice.issuer?.name }}</h2>
        <div class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ invoice.issuer?.rfc }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Régimen Fiscal:</span> {{ resolveLabel('RegimenFiscal', invoice.issuer?.taxRegime) }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Lugar de Expedición:</span> {{ invoice.expeditionPlace }}</p>
        </div>
      </div>
      <div class="text-right">
        <h1 class="text-5xl font-black uppercase tracking-tighter text-slate-100 dark:text-slate-700/30 mb-2 leading-none">FACTURA</h1>
        <p class="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200">{{ invoice.serie }}{{ invoice.folio }}</p>
        <div v-if="invoice.uuid" class="mt-6">
          <p class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">UUID: {{ invoice.uuid }}</p>
        </div>
      </div>
    </div>

    <!-- Relationships & Global Info -->
    <div v-if="invoice.cfdiRelacionados && invoice.cfdiRelacionados.uuids?.length" class="mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CFDI Relacionados</p>
      <div class="text-sm space-y-1">
        <p class="text-slate-600 dark:text-slate-400"><strong>Tipo de Relación:</strong> {{ resolveLabel('TipoRelacion', invoice.cfdiRelacionados.tipoRelacion) }}</p>
        <p class="text-slate-600 dark:text-slate-400 font-mono text-xs"><strong>UUIDs:</strong> {{ invoice.cfdiRelacionados.uuids.join(', ') }}</p>
      </div>
    </div>

    <div v-if="invoice.informacionGlobal" class="mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Información Global</p>
      <div class="grid grid-cols-3 gap-6 text-sm">
        <div><strong class="text-slate-500">Periodicidad:</strong> <span class="text-slate-700 dark:text-slate-300">{{ resolveLabel('Periodicidad', invoice.informacionGlobal.periodicidad) }}</span></div>
        <div><strong class="text-slate-500">Meses:</strong> <span class="text-slate-700 dark:text-slate-300">{{ resolveLabel('Meses', invoice.informacionGlobal.meses) }}</span></div>
        <div><strong class="text-slate-500">Año:</strong> <span class="text-slate-700 dark:text-slate-300">{{ invoice.informacionGlobal.año }}</span></div>
      </div>
    </div>

    <!-- Receiver & Dates -->
    <div class="grid grid-cols-2 gap-12 mb-12 p-8 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Receptor</p>
        <p class="font-bold text-xl text-slate-900 dark:text-white mb-2">{{ invoice.receiver?.name }}</p>
        <div class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ invoice.receiver?.rfc }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Uso CFDI:</span> {{ resolveLabel('UsoCFDI', invoice.receiver?.cfdiUse) }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Dom. Fiscal:</span> {{ invoice.receiver?.postalCode }}</p>
          <p v-if="invoice.receiver?.taxRegime"><span class="font-semibold text-slate-700 dark:text-slate-300">Régimen:</span> {{ resolveLabel('RegimenFiscal', invoice.receiver.taxRegime) }}</p>
        </div>
      </div>
      <div class="text-right flex flex-col justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Fecha y Hora de Emisión</p>
          <p class="text-slate-800 dark:text-slate-200 font-medium">{{ formatDate(invoice.date) }}</p>
        </div>
        <div class="mt-6 space-y-3">
          <div class="grid grid-cols-2 gap-4 text-right">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Método de Pago</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold">{{ invoice.paymentMethod }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Forma de Pago</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold">{{ invoice.paymentType }}</p>
            </div>
          </div>
          <div v-if="invoice.condicionesDePago" class="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Condiciones</p>
            <p class="text-slate-800 dark:text-slate-200 text-sm italic">{{ invoice.condicionesDePago }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Line Items Table -->
    <div class="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl mb-8">
      <table class="w-full text-left table-fixed">
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
          <template v-for="(item, idx) in invoice.lineItems" :key="item.id || idx">
            <!-- Main Content Row -->
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
              <td class="p-4 pb-1 align-top">
                <div class="flex flex-col gap-1 mb-1">
                  <div class="text-[10px] font-mono uppercase tracking-widest leading-none flex items-center gap-2 flex-wrap">
                    <span v-if="item.noIdentificacion" class="text-slate-600 dark:text-slate-300 font-bold">ID: {{ item.noIdentificacion }}</span>
                    <span v-if="item.noIdentificacion" class="text-slate-300 dark:text-slate-600">|</span>
                    <span class="text-slate-400 dark:text-slate-500">{{ resolveUnit(item.unitCode) }}: {{ item.unitCode }}</span>
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

                  <!-- Advanced metadata (Aduana, Predial, etc) -->
                  <div v-if="hasAdvancedInfo(item)" class="pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-2 py-1">
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

    <!-- Totals and Footer -->
    <div class="flex flex-col md:flex-row justify-between mt-12 gap-12">
      <div class="flex-grow space-y-8">
        <div v-if="invoice.observations">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observaciones</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{{ invoice.observations }}</p>
        </div>
        
        <div v-if="invoice.uuid" class="pt-8 border-t border-slate-100 dark:border-slate-700 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
            <div class="space-y-2">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello Digital del CFDI</p>
              <p class="break-all opacity-80">{{ invoice.satSeal }}</p>
            </div>
            <div class="space-y-2">
              <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello del Emisor</p>
              <p class="break-all opacity-80">{{ invoice.issuerSeal }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-xs flex-shrink-0">
        <div class="bg-slate-50 dark:bg-slate-700/20 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4 shadow-sm">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(invoice.subtotal) }}</span>
          </div>
          
          <div v-if="invoice.discount > 0" class="flex justify-between text-sm text-red-600 dark:text-red-400">
            <span class="font-medium">Descuento Global</span>
            <span class="font-bold">-{{ formatCurrency(invoice.discount) }}</span>
          </div>

          <div v-for="(group, gIdx) in taxGroups" :key="gIdx" class="flex justify-between text-[11px] font-mono uppercase tracking-tight">
            <span class="text-slate-500 dark:text-slate-400">
              {{ group.taxType }} {{ (group.rate * 100).toFixed(2) }}% {{ group.isRetention ? '(RET)' : '(TRA)' }}
            </span>
            <span :class="group.isRetention ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'" class="font-bold">
              {{ group.isRetention ? '-' : '' }}{{ formatCurrency(group.amount) }}
            </span>
          </div>

          <div class="pt-6 border-t border-slate-200 dark:border-slate-600 flex justify-between items-end text-primary-600 dark:text-primary-400">
            <span class="font-black text-xs uppercase tracking-widest pb-1">Total MXN</span>
            <span class="text-4xl font-black tracking-tighter leading-none">{{ formatCurrency(invoice.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoicePreview',
  props: {
    invoice: { type: Object, required: true }
  },
  setup(props) {
    const formatCurrency = (amount) => {
      return (amount || 0).toLocaleString('en-US', { 
        style: 'currency', 
        currency: props.invoice.currency || 'MXN' 
      });
    };

    const formatDate = (date) => {
      if (!date) return '—';
      return new Date(date).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const resolveLabel = (catalog, key) => {
      if (!key) return '—';
      const cat = window.fiax.demo_data?.catalogs?.[catalog];
      if (!cat) return key;
      // Handle array vs object catalogs
      if (Array.isArray(cat)) {
        return cat.find(i => i.id === key)?.name || key;
      }
      return cat[key] || key;
    };

    const resolveUnit = (code) => {
      if (code === 'E48') return 'UdS';
      const label = resolveLabel('ClaveUnidad', code);
      return label === code ? 'Und' : label;
    };

    const hasAdvancedInfo = (item) => {
      return item.informacionAduanera?.length || item.cuentaPredial;
    };

    const taxGroups = Vue.computed(() => {
      const summary = {};
      (props.invoice.lineItems || []).forEach(item => {
        (item.taxes || []).forEach(tax => {
          const key = `${tax.taxType}-${tax.rate}-${tax.isRetention}`;
          if (!summary[key]) {
            summary[key] = {
              taxType: tax.taxType,
              rate: tax.rate,
              isRetention: tax.isRetention,
              amount: 0
            };
          }
          summary[key].amount += Number(tax.amount || 0);
        });
      });
      return Object.values(summary);
    });

    return { formatCurrency, formatDate, resolveLabel, resolveUnit, hasAdvancedInfo, taxGroups };
  }
}
</script>

<style scoped>
#invoice-preview {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-print-color-adjust: exact;
}

@media print {
  #invoice-preview {
    box-shadow: none !important;
    padding: 0 !important;
    background: white !important;
    max-width: 100% !important;
  }
}
</style>
