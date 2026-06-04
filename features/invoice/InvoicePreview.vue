<template>
  <div class="relative group">
    <!-- Action Toolbar (Hidden in PDF) -->
    <div class="absolute -top-14 right-0 flex items-center gap-3 no-print opacity-0 group-hover:opacity-100 transition-all duration-300">
       <button 
         @click="exportToPdf"
         :disabled="isExporting"
         class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
       >
         <span v-if="isExporting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
         <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
         {{ isExporting ? 'Generando...' : 'Exportar PDF' }}
       </button>
    </div>

    <!-- The Assembler Container -->
    <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-10 max-w-5xl mx-auto font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300" id="invoice-capture-area" :style="globalStyles">
      <template v-for="(band, bIdx) in templateStructure" :key="bIdx">
         <component 
           :is="band.component" 
           :invoice="enrichedInvoice" 
           :config="band.config || {}" 
         />
      </template>

      <!-- Fallback if no structure defined -->
      <div v-if="!templateStructure.length" class="p-20 text-center text-slate-400">
         <p class="text-sm font-black uppercase tracking-widest">No hay estructura de plantilla definida</p>
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
    const rules = window.fiax?.rules;
    const isExporting = Vue.ref(false);

    // Dynamic component mapping
    const bandComponents = {
       'Header': 'BandHeader',
       'Parties': 'BandParties',
       'Table': 'BandTable',
       'Totals': 'BandTotals',
       'Legal': 'BandLegal'
    };

    // Resolve template structure from rules or use a modern default
    const templateStructure = Vue.computed(() => {
        const custom = rules?.resolve('template.structure', []).value;
        if (custom?.length) {
            return custom.map(b => ({
                component: bandComponents[b.band] || b.band,
                config: b
            }));
        }
        // Default modern layout
        return [
            { component: 'BandHeader', config: { style: 'classic', show_logo: true } },
            { component: 'BandParties', config: { layout: 'side-by-side' } },
            { component: 'BandTable', config: {} },
            { component: 'BandTotals', config: {} },
            { component: 'BandLegal', config: {} }
        ];
    });

    // Global branding styles from YAML
    const globalStyles = Vue.computed(() => {
        const config = rules?.resolve('template.global', {}).value;
        return {
            '--primary-color': config.primary_color || '#3b82f6',
            'font-family': config.font_family || 'Inter, sans-serif'
        };
    });

    // We "enrich" the invoice data for the bands (e.g. resolve issuer object)
    const enrichedInvoice = Vue.computed(() => {
        const state = window.fiax.state?.ensureState?.() || window.fiax.state;
        return window.fiax?.cfdiModel?.normalizeInvoice?.(props.invoice, state) || props.invoice;
    });

    const exportToPdf = async () => {
        // Debounce/Prevent double export
        if (isExporting.value) return;

        isExporting.value = true;
        try {
            // Robustness: Small buffer for async components to finish any internal rendering
            await new Promise(r => setTimeout(r, 500));
            
            const area = document.getElementById('invoice-capture-area');
            const filename = `FACTURA_${props.invoice.serie}${props.invoice.folio}.pdf`;
            await window.fiax.pdf.generate(area, filename);
        } finally {
            isExporting.value = false;
        }
    };

    return { 
        templateStructure, 
        globalStyles, 
        enrichedInvoice, 
        exportToPdf, 
        isExporting 
    };
  },
  components: {
     // Local registration for the SFC loader to find them
     BandHeader: Vue.defineAsyncComponent(() => window.fiax.loadModule('./components/invoice/bands/BandHeader.vue', window.fiax.loaderOptions)),
     BandParties: Vue.defineAsyncComponent(() => window.fiax.loadModule('./components/invoice/bands/BandParties.vue', window.fiax.loaderOptions)),
     BandTable: Vue.defineAsyncComponent(() => window.fiax.loadModule('./components/invoice/bands/BandTable.vue', window.fiax.loaderOptions)),
     BandTotals: Vue.defineAsyncComponent(() => window.fiax.loadModule('./components/invoice/bands/BandTotals.vue', window.fiax.loaderOptions)),
     BandLegal: Vue.defineAsyncComponent(() => window.fiax.loadModule('./components/invoice/bands/BandLegal.vue', window.fiax.loaderOptions))
  }
}
</script>

<style>
#invoice-capture-area {
  --primary-color: #3b82f6;
}

@media print {
  .no-print { display: none !important; }
}

/* Custom PDF Mode Styles - Forced Contrast */
.fiax-pdf-export-mode {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    color: #000000 !important;
    background: #ffffff !important;
}

.fiax-pdf-export-mode * {
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
}

/* Ensure all text is dark in PDF even if UI is dark */
.fiax-pdf-export-mode .text-slate-400,
.fiax-pdf-export-mode .text-slate-500 {
    color: #64748b !important;
}

.fiax-pdf-export-mode .text-slate-900,
.fiax-pdf-export-mode .text-slate-800 {
    color: #0f172a !important;
}
</style>
