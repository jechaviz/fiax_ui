<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conceptos / Partidas</h3>
      <button 
        @click="addLineItem"
        class="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all font-bold"
      >
        <i class="fa-solid fa-plus mr-1"></i> Agregar Concepto
      </button>
    </div>

    <!-- Table Header (Desktop) -->
    <div class="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
      <div class="col-span-2">Clave SAT / SKU</div>
      <div class="col-span-3">Descripción / Unidad</div>
      <div class="col-span-1 text-center">Cant.</div>
      <div class="col-span-2 text-right">Precio Unit.</div>
      <div class="col-span-1 text-right">Desc.</div>
      <div class="col-span-2 text-right">Importe</div>
      <div class="col-span-1 text-center">Acciones</div>
    </div>

    <!-- Line Item Rows -->
    <div v-for="(item, idx) in lineItems" :key="item.id" class="group relative bg-white/2 border border-white/5 rounded-2xl p-4 lg:p-1 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center hover:bg-white/5 transition-all">
      
      <!-- SAT Code & SKU -->
      <div class="col-span-2 space-y-1">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Clave SAT / SKU</label>
        <input 
          v-model="item.productCode" 
          class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-2 text-sm text-white font-mono focus:outline-none focus:bg-blue-500/10"
          placeholder="01010101"
        />
        <input 
          v-if="expanded[item.id]"
          v-model="item.noIdentificacion" 
          class="w-full bg-white/5 border-none px-3 py-1 text-[10px] text-slate-400 font-mono focus:outline-none italic animate-in slide-in-from-top-1"
          placeholder="SKU o No. Identificación"
        />
      </div>

      <!-- Description & Unit -->
      <div class="col-span-3 space-y-2">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción</label>
        <div class="flex flex-col gap-1">
          <input 
            v-model="item.description" 
            class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-blue-500/10 font-medium"
            placeholder="Nombre del servicio o producto..."
          />
          <div class="flex gap-2">
            <input 
              v-model="item.unitCode" 
              class="w-20 bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-1 text-[11px] text-slate-400 font-mono focus:outline-none focus:bg-blue-500/10"
              placeholder="E48"
            />
            <input 
              v-model="item.unit" 
              class="flex-1 bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-1 text-[11px] text-slate-400 focus:outline-none focus:bg-blue-500/10"
              placeholder="Servicio"
            />
          </div>
        </div>
      </div>

      <!-- Quantity -->
      <div class="col-span-1">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Cant.</label>
        <input 
          type="number" 
          v-model.number="item.quantity" 
          class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-2 text-sm text-white text-center focus:outline-none focus:bg-blue-500/10 font-bold"
        />
      </div>

      <!-- Unit Price -->
      <div class="col-span-2">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Precio Unit.</label>
        <input 
          type="number" 
          v-model.number="item.unitPrice" 
          class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-2 text-sm text-white text-right focus:outline-none focus:bg-blue-500/10 font-mono"
        />
      </div>

      <!-- Discount -->
      <div class="col-span-1">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1 text-right">Desc.</label>
        <input 
          type="number" 
          v-model.number="item.discount" 
          class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-2 text-sm text-red-400 text-right focus:outline-none focus:bg-red-500/10 font-mono"
          placeholder="0.00"
        />
      </div>

      <!-- Total Amount Column -->
      <div class="col-span-2">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1 text-right">Importe</label>
        <div class="text-right px-3 py-2 text-sm font-black text-white">
          {{ state.formatCurrency(calculateItemTotal(item), currency) }}
        </div>
      </div>

      <!-- Row Actions -->
      <div class="col-span-1 flex items-center justify-center gap-2">
        <button 
          @click="expanded[item.id] = !expanded[item.id]"
          class="p-2 text-slate-500 hover:text-white transition-colors"
          :class="{ 'text-blue-400': expanded[item.id] }"
          title="Más Opciones"
        >
          <i class="fa-solid fa-ellipsis-vertical text-lg"></i>
        </button>
        <button 
          @click="openTaxManager(idx)"
          class="p-2 text-slate-400 hover:text-blue-400 transition-colors relative"
          title="Gestionar Impuestos"
        >
          <i class="fa-solid fa-receipt text-lg"></i>
          <span v-if="item.taxes?.length" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-blue-500 text-[9px] font-bold text-white rounded-full border border-[#0a1428]">
            {{ item.taxes.length }}
          </span>
        </button>
        <button 
          @click="removeLineItem(item.id)"
          class="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Eliminar Línea"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>

      <!-- Advanced Details Toggle (Parity) -->
      <div v-if="expanded[item.id]" class="col-span-12 px-6 py-4 bg-white/2 border-t border-white/5 animate-in slide-in-from-top-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Objeto de Impuesto</label>
              <select v-model="item.objetoImp" class="app-input-field w-full h-9 text-xs">
                <option v-for="(v, k) in catalogs.ObjetoImp" :key="k" :value="k">{{ k }} - {{ v }}</option>
              </select>
           </div>
           <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cuenta Predial</label>
              <input v-model="item.cuentaPredial" class="app-input-field w-full h-9 text-xs" placeholder="Número de cuenta predial..." />
           </div>
           <div class="flex items-center gap-2 pt-4">
              <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Impuestos Federales:</div>
              <div class="text-[11px] font-bold text-blue-400">{{ state.formatCurrency(getTotalFederalTaxes(item), currency) }}</div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LineItemsSection',
  props: {
    lineItems: Array,
    state: { type: Object, required: true },
    currency: String
  },
  emits: ['update', 'open-tax-manager'],
  setup(props, { emit }) {
    const catalogs = window.fiax?.demo_data?.catalogs || {};
    const expanded = Vue.reactive({});

    const calculateItemTotal = (item) => {
        return (Number(item.quantity) * Number(item.unitPrice)) - (Number(item.discount) || 0);
    };

    const getTotalFederalTaxes = (item) => {
        return (item.taxes || []).filter(t => !t.isLocal).reduce((acc, t) => acc + Number(t.amount || 0), 0);
    };

    const addLineItem = () => {
        const newItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            productCode: '80101500',
            unitCode: 'E48',
            quantity: 1,
            unit: 'Servicio',
            description: '',
            unitPrice: 0,
            discount: 0,
            objetoImp: '02',
            taxes: [
                { taxType: 'IVA', rate: 0.16, isRetention: false, isLocal: false, base: 0, amount: 0 }
            ]
        };
        emit('update', [...props.lineItems, newItem]);
    };

    const removeLineItem = (id) => {
        if (props.lineItems.length <= 1) return;
        emit('update', props.lineItems.filter(item => item.id !== id));
    };

    const openTaxManager = (index) => {
        emit('open-tax-manager', index);
    };

    return { catalogs, expanded, calculateItemTotal, getTotalFederalTaxes, addLineItem, removeLineItem, openTaxManager };
  }
}
</script>
