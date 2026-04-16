<template>
  <div class="app-surface rounded-2xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-500" :class="{ 'ring-2 ring-blue-500/50 bg-blue-500/5': isGlobal }">
    <div class="p-6 flex items-center justify-between cursor-pointer" @click="toggleGlobal">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-blue-400">
          <i class="fa-solid fa-earth-americas text-lg"></i>
        </div>
        <div>
          <h3 class="text-white font-bold tracking-tight">Información Global (Comprobante Público en General)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Activa esta sección para facturas globales según el estándar 4.0.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="app-switch" :class="{ 'is-active': isGlobal }"></div>
        <i class="fa-solid fa-chevron-down text-slate-600 transition-transform duration-300" :class="{ 'rotate-180': isGlobal }"></i>
      </div>
    </div>

    <div v-if="isGlobal" class="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl bg-white/2 border border-white/5">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periodicidad</label>
          <select 
            v-model="informacionGlobal.periodicidad" 
            class="app-input-field w-full"
          >
            <option v-for="(label, code) in catalogs.Periodicidad" :key="code" :value="code">{{ code }} - {{ label }}</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meses</label>
          <select 
            v-model="informacionGlobal.meses" 
            class="app-input-field w-full"
          >
            <option v-for="(label, code) in catalogs.Meses" :key="code" :value="code">{{ code }} - {{ label }}</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Año</label>
          <input 
            type="number" 
            v-model="informacionGlobal.año" 
            class="app-input-field w-full font-mono"
            placeholder="2024"
          />
        </div>
      </div>
      
      <div class="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <i class="fa-solid fa-circle-info text-blue-400 mt-1"></i>
        <p class="text-xs text-blue-200/70 leading-relaxed">
          Al activar el modo global, el RFC del receptor se ajustará automáticamente a <strong>XAXX010101000</strong> (Público en General) y el régimen fiscal se fijará en <strong>616</strong> (Sin obligaciones fiscales).
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalInfoSection',
  props: {
    invoice: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const catalogs = window.fiax?.demo_data?.catalogs || {};
    
    const isGlobal = Vue.computed(() => !!props.invoice.informacionGlobal);
    
    const informacionGlobal = Vue.computed({
      get: () => props.invoice.informacionGlobal || {},
      set: (val) => emit('update', { informacionGlobal: val })
    });

    function toggleGlobal() {
      if (!isGlobal.value) {
        // Activate Global Mode
        emit('update', {
          informacionGlobal: {
            periodicidad: '04', // Mensual default
            meses: (new Date().getMonth() + 1).toString().padStart(2, '0'),
            año: new Date().getFullYear()
          },
          // SAT rules for Global Invoice
          receiver: {
            ...props.invoice.receiver,
            rfc: 'XAXX010101000',
            name: 'PUBLICO EN GENERAL',
            taxRegime: '616',
            cfdiUse: 'S01'
          }
        });
      } else {
        // Deactivate Global Mode
        const { informacionGlobal, ...rest } = props.invoice;
        emit('update-top', rest); // Need to remove a top-level key
      }
    }

    return { catalogs, isGlobal, informacionGlobal, toggleGlobal };
  }
}
</script>
