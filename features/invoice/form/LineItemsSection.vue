<template>
  <div class="fiax-line-items space-y-4">
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
    <div class="fiax-line-head hidden lg:flex gap-x-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter shadow-sm border-b border-white/5 items-center">
      <div class="w-32 flex-shrink-0">Clave SAT / SKU</div>
      <div v-if="rules.get('columns.order_no').value.visible" class="w-20 flex-shrink-0 text-center">Pedido</div>
      <div v-if="rules.get('columns.delivery_no').value.visible" class="w-20 flex-shrink-0 text-center">Entrega</div>
      <div v-if="rules.get('columns.lot').value.visible" class="w-24 flex-shrink-0 text-center font-mono">Lote</div>
      
      <div class="flex-1 min-w-0">Descripción / Unidad</div>
      
      <div class="w-16 flex-shrink-0 text-center">Cant.</div>
      <div class="w-24 flex-shrink-0 text-right">Precio Unit.</div>
      <div class="w-20 flex-shrink-0 text-right">Desc.</div>
      <div class="w-28 flex-shrink-0 text-right">Importe</div>
      <div class="w-12 flex-shrink-0 text-center">Acciones</div>
    </div>

    <!-- Line Item Rows -->
    <div v-for="(item, idx) in lineItems" :key="item.id" class="fiax-line-row group relative bg-white/2 border border-white/5 rounded-2xl p-4 lg:p-1 space-y-4 lg:space-y-0 lg:flex lg:gap-x-4 lg:items-center lg:px-3 hover:bg-white/5 transition-all">
      
      <!-- SAT Code & SKU -->
      <div class="fiax-line-cell fiax-line-code w-full lg:w-32 flex-shrink-0 space-y-1">
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

      <!-- Dynamic ERP Columns: Order No, Delivery No, Lot -->
      <div v-if="rules.get('columns.order_no').value.visible" class="fiax-line-cell fiax-line-erp w-full lg:w-20 flex-shrink-0">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Pedido</label>
        <input v-model="item.order_no" class="app-input-field w-full h-8 px-2 text-[11px] lg:text-center" placeholder="PO..." />
      </div>

      <div v-if="rules.get('columns.delivery_no').value.visible" class="fiax-line-cell fiax-line-erp w-full lg:w-20 flex-shrink-0">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Entrega</label>
        <input v-model="item.delivery_no" class="app-input-field w-full h-8 px-2 text-[11px] lg:text-center" placeholder="DN..." />
      </div>

      <div v-if="rules.get('columns.lot').value.visible" class="fiax-line-cell fiax-line-lot w-full lg:w-24 flex-shrink-0">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Lote</label>
        <input v-model="item.lot" class="app-input-field w-full h-8 px-2 text-[11px] lg:text-center font-mono" placeholder="Batch..." />
      </div>

      <!-- Description & Unit -->
      <div class="fiax-line-cell fiax-line-description w-full flex-1 min-w-0 space-y-2">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción</label>
        <div class="flex flex-col gap-1">
          <input 
            v-model="item.description" 
            class="w-full bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-blue-500/10 font-medium truncate"
            placeholder="Descripción..."
          />
          <div class="flex gap-2">
            <input 
              v-model="item.unitCode" 
              class="w-14 bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-2 py-1 text-[10px] text-slate-400 font-mono focus:outline-none"
              placeholder="E48"
            />
            <input 
              v-model="item.unit" 
              class="flex-1 bg-white/5 border border-white/10 lg:border-none rounded-lg lg:rounded-none px-2 py-1 text-[10px] text-slate-400 focus:outline-none"
              placeholder="Unidad"
            />
          </div>
        </div>
      </div>

      <!-- Quantities & Prices -->
      <div class="fiax-line-cell fiax-line-qty w-full lg:w-16 flex-shrink-0">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Cantidad</label>
        <input type="number" v-model="item.quantity" class="app-input-field w-full lg:text-center px-2 font-mono h-8 text-[13px]" placeholder="1" />
      </div>

      <div class="fiax-line-cell fiax-line-money w-full lg:w-24 flex-shrink-0 relative">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Precio Unitario</label>
        <span class="absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 lg:top-1.5 text-slate-500 text-sm opacity-50 lg:hidden">$</span>
        <input type="number" v-model="item.unitPrice" class="app-input-field w-full pl-6 lg:pl-2 px-2 lg:text-right font-mono h-8 text-[13px]" placeholder="0.00" />
      </div>

      <div class="fiax-line-cell fiax-line-discount w-full lg:w-20 flex-shrink-0 relative">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Descuento</label>
        <span class="absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 lg:top-1.5 text-slate-500 text-sm opacity-50 lg:hidden">$</span>
        <input type="number" v-model="item.discount" class="app-input-field w-full pl-6 lg:pl-2 px-2 lg:text-right font-mono text-emerald-400 h-8 text-[13px]" placeholder="0.00" />
      </div>

      <div class="fiax-line-cell fiax-line-total w-full lg:w-28 flex-shrink-0 text-right bg-white/5 lg:bg-transparent p-3 lg:p-0 rounded-lg lg:rounded-none">
        <label class="lg:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1 text-left">Importe Neto</label>
        <p class="font-bold text-lg lg:text-base font-mono text-white tracking-tight">{{ state.formatCurrency(calculateItemTotal(item), currency) }}</p>
        <p v-if="getTotalFederalTaxes(item) > 0" class="text-[10px] text-slate-400 font-mono mt-0.5">
          + Impuestos
        </p>
      </div>

      <!-- Actions -->
      <div class="fiax-line-cell fiax-line-actions w-full lg:w-12 flex-shrink-0 flex justify-end lg:justify-center gap-2 pt-2 border-t border-white/10 lg:border-0 lg:pt-0">
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

    const _safeDefault = (val) => Vue.computed(() => ({ value: val || {}, visible: false, required: false, label: null }));
    const rules = window.fiax?.useRules?.('form.line_items') || {
        get: (key, def) => _safeDefault(def)
    };

    return { catalogs, rules, expanded, calculateItemTotal, getTotalFederalTaxes, addLineItem, removeLineItem, openTaxManager };
  }
}
</script>
