<template>
  <div class="app-surface rounded-2xl border border-white/5 shadow-2xl overflow-hidden shadow-indigo-500/5">
    <div class="p-6 flex items-center justify-between cursor-pointer" @click="isOpen = !isOpen">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center text-purple-400">
          <i class="fa-solid fa-link text-lg"></i>
        </div>
        <div>
          <h3 class="text-white font-bold tracking-tight">CFDI Relacionados</h3>
          <p class="text-xs text-slate-500 mt-0.5">Relaciona otros comprobantes (Sustitución, Notas de Crédito, etc.)</p>
        </div>
      </div>
      <i class="fa-solid fa-chevron-down text-slate-600 transition-transform duration-300" :class="{ 'rotate-180': isOpen }"></i>
    </div>

    <div v-if="isOpen" class="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Relación</label>
          <select 
            v-model="tipoRelacion" 
            class="app-input-field w-full"
          >
            <option value="">-- Seleccione Tipo --</option>
            <option v-for="(label, code) in catalogs.TipoRelacion" :key="code" :value="code">{{ code }} - {{ label }}</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">UUIDs Relacionados</label>
          <div class="flex flex-col gap-2">
            <div v-for="(uuid, index) in uuids" :key="index" class="flex gap-2">
              <input 
                type="text" 
                v-model="uuids[index]" 
                class="app-input-field flex-1 font-mono text-xs"
                placeholder="00000000-0000-0000-0000-000000000000"
              />
              <button @click="removeUuid(index)" class="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
            <button @click="addUuid" class="w-full h-10 rounded-lg border border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-500 hover:text-purple-400 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <i class="fa-solid fa-plus"></i> Agregar UUID
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RelatedCfdiSection',
  props: {
    invoice: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const catalogs = window.fiax?.demo_data?.catalogs || {};
    const isOpen = Vue.ref(!!props.invoice.cfdiRelacionados);

    const tipoRelacion = Vue.computed({
      get: () => props.invoice.cfdiRelacionados?.tipoRelacion || '',
      set: (val) => {
        const current = props.invoice.cfdiRelacionados || { uuids: [] };
        emit('update', { cfdiRelacionados: { ...current, tipoRelacion: val } });
      }
    });

    const uuids = Vue.computed({
      get: () => props.invoice.cfdiRelacionados?.uuids || [],
      set: (val) => {
        const current = props.invoice.cfdiRelacionados || { tipoRelacion: '' };
        emit('update', { cfdiRelacionados: { ...current, uuids: val } });
      }
    });

    function addUuid() {
      const next = [...uuids.value, ''];
      uuids.value = next;
    }

    function removeUuid(index) {
      const next = [...uuids.value];
      next.splice(index, 1);
      uuids.value = next;
    }

    return { catalogs, isOpen, tipoRelacion, uuids, addUuid, removeUuid };
  }
}
</script>
