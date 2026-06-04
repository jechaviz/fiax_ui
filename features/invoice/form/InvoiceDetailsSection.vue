<template>
  <div class="app-surface fiax-invoice-details rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-6">
    <h3 class="text-white font-bold tracking-tight mb-6 flex items-center gap-2">
      <i class="fa-solid fa-circle-info text-blue-400"></i> Datos del Comprobante
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serie</label>
        <input 
          type="text" 
          v-model="internalInvoice.serie" 
          class="app-input-field w-full font-bold uppercase"
          placeholder="A"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Folio</label>
        <input 
          type="text" 
          v-model="internalInvoice.folio" 
          class="app-input-field w-full font-mono font-bold"
          placeholder="1000"
        />
      </div>

      <div class="space-y-2 md:col-span-1">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</label>
        <input 
          type="datetime-local" 
          ref="dateInput"
          :value="formattedDate"
          @input="updateDate"
          class="app-input-field w-full text-xs"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lugar Expedición (CP)</label>
        <input 
          type="text" 
          v-model="internalInvoice.expeditionPlace" 
          class="app-input-field w-full font-mono text-center"
          placeholder="06500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/5">
      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Moneda</label>
        <select 
          v-model="internalInvoice.currency" 
          class="app-input-field w-full"
        >
          <option v-for="(label, code) in catalogs.Moneda" :key="code" :value="code">{{ code }} - {{ label }}</option>
        </select>
      </div>

      <div class="space-y-2" v-if="internalInvoice.currency !== 'MXN'">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Cambio</label>
        <input 
          type="number" 
          v-model.number="internalInvoice.exchangeRate" 
          step="0.0001"
          class="app-input-field w-full font-mono"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Método de Pago</label>
        <select 
          v-model="internalInvoice.paymentMethod" 
          class="app-input-field w-full"
        >
          <option v-for="(label, code) in catalogs.MetodoPago" :key="code" :value="code">{{ code }} - {{ label }}</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forma de Pago</label>
        <select 
          v-model="internalInvoice.paymentType" 
          class="app-input-field w-full"
        >
          <option v-for="(label, code) in catalogs.FormaPago" :key="code" :value="code">{{ code }} - {{ label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoiceDetailsSection',
  props: {
    invoice: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const catalogs = window.fiax?.demo_data?.catalogs || {};
    
    // Create a local proxy for simplified event emitting
    const internalInvoice = Vue.reactive({...props.invoice});

    Vue.watch(() => props.invoice, (newVal) => {
      Object.assign(internalInvoice, newVal);
    }, { deep: true });

    Vue.watch(internalInvoice, (newVal) => {
      emit('update', newVal);
    }, { deep: true });

    const formattedDate = Vue.computed(() => {
      const d = props.invoice.date ? new Date(props.invoice.date) : new Date();
      return d.toISOString().slice(0, 16);
    });

    function updateDate(e) {
      emit('update', { date: new Date(e.target.value) });
    }

    return { catalogs, internalInvoice, formattedDate, updateDate };
  }
}
</script>
