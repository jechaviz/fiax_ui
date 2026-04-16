<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-[#050c1a]/80 backdrop-blur-xl" @click="$emit('close')"></div>
    
    <div class="relative w-full max-w-2xl bg-[#0a1428] border border-white/10 rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-8">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-black text-white tracking-tighter">Gestor de Impuestos CFDI 4.0</h2>
            <p class="text-slate-500 text-sm mt-1">Configuración técnica de traslados y retenciones.</p>
          </div>
          <button @click="$emit('close')" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="space-y-6">
          <div class="flex items-center justify-between bg-white/2 p-4 rounded-xl border border-white/5">
            <div class="text-sm font-bold text-slate-400">Concepto Seleccionado:</div>
            <div class="text-sm font-black text-white truncate max-w-[300px]">{{ lineItem.description || 'Sin descripción' }}</div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest">Impuestos Configurados</h3>
              <div class="flex gap-2">
                <button @click="addTax(false)" class="text-[10px] px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-black uppercase tracking-widest">+ Federal</button>
                <button @click="addTax(true)" class="text-[10px] px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg font-black uppercase tracking-widest">+ Local</button>
              </div>
            </div>

            <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(tax, idx) in localTaxes" :key="idx" class="group relative bg-white/2 border border-white/5 rounded-2xl p-4 grid grid-cols-12 gap-4 items-center">
                <div class="col-span-3 space-y-1">
                  <label class="text-[9px] font-black text-slate-600 uppercase">Clave/Tipo</label>
                  <select v-model="tax.taxType" class="w-full bg-transparent text-white text-sm font-bold border-none focus:ring-0">
                    <option v-for="t in taxOptions" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                
                <div class="col-span-3 space-y-1">
                  <label class="text-[9px] font-black text-slate-600 uppercase">Factor</label>
                  <select v-model="tax.isRetention" class="w-full bg-transparent text-white text-sm border-none focus:ring-0">
                    <option :value="false">Traslado</option>
                    <option :value="true">Retención</option>
                  </select>
                </div>

                <div class="col-span-3 space-y-1">
                  <label class="text-[9px] font-black text-slate-600 uppercase">Tasa/Cuota</label>
                  <input type="number" v-model.number="tax.rate" step="0.0001" class="w-full bg-transparent text-white text-sm font-mono border-none focus:ring-0" />
                </div>

                <div class="col-span-2 text-right">
                  <div class="text-[9px] font-black text-blue-500/50 uppercase mb-1">{{ tax.isLocal ? 'Local' : 'Federal' }}</div>
                  <div class="text-white font-mono font-bold text-xs">{{ state.formatCurrency(calculateTaxAmount(tax)) }}</div>
                </div>

                <div class="col-span-1 flex justify-end">
                  <button @click="removeTax(idx)" class="w-8 h-8 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>

              <div v-if="localTaxes.length === 0" class="py-12 text-center text-slate-600 italic text-sm">
                No se han configurado impuestos para este concepto.
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 flex gap-4">
          <button @click="$emit('close')" class="flex-1 h-14 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs">Cerrar</button>
          <button @click="save" class="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black hover:shadow-blue-500/20 hover:shadow-2xl transition-all uppercase tracking-widest text-xs">Guardar Impuestos</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaxManagerModal',
  props: {
    isOpen: Boolean,
    lineItem: Object,
    lineItemIndex: Number,
    state: Object
  },
  setup(props, { emit }) {
    const localTaxes = Vue.ref(JSON.parse(JSON.stringify(props.lineItem.taxes || [])));
    const taxOptions = ['IVA', 'ISR', 'IEPS', 'ISH', 'IEDU', 'CÉDULA'];

    const calculateTaxAmount = (tax) => {
        const base = (props.lineItem.quantity * props.lineItem.unitPrice) - (props.lineItem.discount || 0);
        return base * (tax.rate || 0);
    };

    const addTax = (isLocal = false) => {
        localTaxes.value.push({
            taxType: isLocal ? 'ISH' : 'IVA',
            rate: isLocal ? 0.03 : 0.16,
            isRetention: false,
            isLocal: isLocal,
            base: 0,
            amount: 0
        });
    };

    const removeTax = (index) => {
        localTaxes.value.splice(index, 1);
    };

    const save = () => {
        const finalTaxes = localTaxes.value.map(t => ({
            ...t,
            amount: calculateTaxAmount(t)
        }));
        emit('save', finalTaxes);
    };

    return { localTaxes, taxOptions, addTax, removeTax, save, calculateTaxAmount };
  }
}
</script>
