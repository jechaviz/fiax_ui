<template>
  <div class="space-y-6">
    <!-- Row 1: Issuer and Branch -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Emisor
          <span v-if="rules.get('issuer_id').value.required" class="text-rose-500 ml-1">*</span>
        </label>
        <select 
          :value="invoice.issuerId" 
          @change="$emit('update', { issuerId: $event.target.value })"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
        >
          <option v-for="iss in issuers" :key="iss.id" :value="iss.id">{{ iss.name }} ({{ iss.rfc }})</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Sucursal / Lugar de Expedición</label>
        <select 
          :value="invoice.branchId" 
          @change="$emit('update', { branchId: $event.target.value })"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
        >
          <option v-for="br in activeIssuerBranches" :key="br.id" :value="br.id">{{ br.name }} (C.P. {{ br.postalCode }})</option>
        </select>
      </div>
    </div>

    <!-- Row 2: Receiver and Use of CFDI -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {{ rules.get('receiver_id').value.visible ? rules.get('receiver_id').value.label : 'Receptor (Cliente)' }}
          <span v-if="rules.get('receiver_id').value.required" class="text-rose-500 ml-1">*</span>
        </label>
        <div class="relative">
          <select 
            :value="invoice.receiver?.userId" 
            @change="handleReceiverChange"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">Seleccionar cliente...</option>
            <option v-for="u in clients" :key="u.id" :value="u.id">{{ u.companyName || u.name }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Uso de CFDI</label>
        <div class="relative">
          <select 
            :value="invoice.cfdiUse" 
            @change="$emit('update', { cfdiUse: $event.target.value })"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
          >
            <option v-for="cat in catalogs.useCfdi" :key="cat.id" :value="cat.id">{{ cat.id }} - {{ cat.name }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Receiver Summary (Visual) -->
    <div v-if="selectedClient" class="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-2 relative overflow-hidden">
      <div class="absolute top-0 right-0 p-2 text-[10px] font-black text-blue-500/20 uppercase tracking-widest pointer-events-none">
        {{ rules.get('title.' + invoice.tipoDeComprobante).value || 'Receptor' }}
      </div>
      <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
        {{ (selectedClient.companyName || selectedClient.name).charAt(0) }}
      </div>
      <div>
        <p class="text-white font-bold">{{ selectedClient.companyName || selectedClient.name }}</p>
        <div class="flex gap-3 text-xs text-slate-400 mt-1">
          <span>RFC: <b class="text-slate-300">{{ selectedClient.rfc }}</b></span>
          <span v-if="selectedClient.id_interno">ID: <b class="text-blue-400">{{ selectedClient.id_interno }}</b></span>
          <span>Regimen: <b class="text-slate-300">{{ selectedClient.taxRegime }}</b></span>
          <span>C.P.: <b class="text-slate-300">{{ selectedClient.postalCode }}</b></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssuerReceiverSection',
  props: {
    invoice: Object,
    issuers: Array,
    clients: Array,
    catalogs: Object
  },
  emits: ['update'],
  setup(props, { emit }) {
    const activeIssuerBranches = Vue.computed(() => {
      const issuer = props.issuers.find(i => i.id === props.invoice.issuerId);
      return issuer?.branches || [];
    });

    const selectedClient = Vue.computed(() => {
      return props.clients.find(c => c.id === props.invoice.receiver?.userId);
    });

    const handleReceiverChange = (e) => {
      const val = e.target.value;
      const client = props.clients.find(c => c.id === val);
      if (client) {
        emit('update', { 
          receiver: { 
            userId: client.id,
            name: client.companyName || client.name,
            rfc: client.rfc,
            taxRegime: client.taxRegime,
            postalCode: client.postalCode,
            cfdiUse: props.invoice.cfdiUse || 'G03'
          } 
        });
      }
    };

    const _safeDefault = (val) => Vue.computed(() => ({ value: val || {}, visible: true, required: false, label: null }));
    const rules = window.fiax?.useRules?.('labels.issuer_receiver') || {
        get: (key, def) => _safeDefault(def)
    };

    return { activeIssuerBranches, selectedClient, handleReceiverChange, rules };
  }
}
</script>
