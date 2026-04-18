<template>
  <div class="app-surface rounded-2xl border border-white/5 shadow-2xl p-6">
    <h3 class="text-white font-bold tracking-tight mb-6 flex items-center gap-2">
      <i class="fa-solid fa-gear text-slate-400"></i> Opciones Avanzadas CFDI 4.0
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Exportación</label>
        <select 
          v-model="exportacion" 
          class="app-input-field w-full"
        >
          <option v-for="(label, code) in catalogs.Exportacion" :key="code" :value="code">{{ code }} - {{ label }}</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Condiciones de Pago</label>
        <input 
          type="text" 
          v-model="condicionesDePago" 
          class="app-input-field w-full"
          placeholder="E.g. Contado, 30 días, etc."
        />
      </div>

      <!-- Conditional Language Toggle (Enrichment) -->
      <div v-if="exportacion !== '01' && rules.get('export_language_toggle').value" class="space-y-2 animate-in slide-in-from-right-4">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Idioma del Documento</label>
        <div class="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 h-11">
           <button 
             @click="idioma = 'es'"
             :class="idioma === 'es' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'"
             class="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
           >Español</button>
           <button 
             @click="idioma = 'en'"
             :class="idioma === 'en' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'"
             class="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
           >English</button>
        </div>
      </div>

      <div class="space-y-2 md:col-span-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observaciones / Notas en PDF</label>
        <textarea 
          v-model="observations" 
          class="app-input-field w-full h-24 py-3 resize-none"
          placeholder="Notas adicionales que aparecerán en la representación impresa..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoiceOptionsSection',
  props: {
    invoice: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const catalogs = window.fiax?.demo_data?.catalogs || {};

    const exportacion = Vue.computed({
      get: () => props.invoice.exportacion || '01',
      set: (val) => emit('update', { exportacion: val })
    });

    const condicionesDePago = Vue.computed({
      get: () => props.invoice.condicionesDePago || '',
      set: (val) => emit('update', { condicionesDePago: val })
    });

    const observations = Vue.computed({
      get: () => props.invoice.observations || '',
      set: (val) => emit('update', { observations: val })
    });

    const idioma = Vue.computed({
      get: () => props.invoice.idioma || 'es',
      set: (val) => emit('update', { idioma: val })
    });

    const rules = window.fiax?.useRules('settings');

    return { catalogs, exportacion, condicionesDePago, observations, idioma, rules };
  }
}
</script>
