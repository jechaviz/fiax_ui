<template>
  <div class="fiax-modal-overlay animate-fade-in" @click.self="$emit('close')">
    <div class="fiax-modal-content fiax-glass-card max-w-2xl w-full animate-slide-up max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div>
          <h2 class="text-xl font-black tracking-tight">{{ isNew ? 'Nuevo Cliente' : 'Editar Cliente' }}</h2>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">{{ isNew ? 'Registro de Receptor CFDI' : form.rfc }}</p>
        </div>
        <button @click="$emit('close')" class="fiax-icon-btn text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-8 overflow-y-auto space-y-10 custom-scrollbar flex-grow">
        
        <!-- Tab: Identidad -->
        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Identidad Fiscal</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="fiax-input-group md:col-span-2">
              <label>RFC del Receptor</label>
              <input type="text" v-model="form.rfc" placeholder="XAXX010101000" class="fiax-field font-mono uppercase">
            </div>
            <div class="fiax-input-group md:col-span-2">
              <label>Nombre o Razón Social (Tal cual aparece en Constancia)</label>
              <input type="text" v-model="form.name" placeholder="Ej: EMPRESA DE PRUEBA SA DE CV" class="fiax-field uppercase">
              <p class="text-[9px] text-slate-500 mt-1 italic">* Para CFDI 4.0 no incluir el Régimen Capital (ej. SA de CV).</p>
            </div>
            <div class="fiax-input-group">
              <label>Régimen Fiscal</label>
              <select v-model="form.taxRegime" class="fiax-field">
                <option v-for="(name, code) in catalogs.taxRegimes" :key="code" :value="code">
                  {{ code }} - {{ name }}
                </option>
              </select>
            </div>
            <div class="fiax-input-group">
              <label>Uso de CFDI (Por defecto)</label>
              <select v-model="form.cfdiUse" class="fiax-field">
                <option v-for="use in catalogs.useCfdi" :key="use.id" :value="use.id">
                  {{ use.id }} - {{ use.name }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <!-- Tab: Domicilio -->
        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Domicilio Fiscal (Requerido para 4.0)</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="fiax-input-group md:col-span-2">
              <label>Calle</label>
              <input type="text" v-model="form.street" placeholder="Av. Insurgentes Sur" class="fiax-field">
            </div>
            <div class="fiax-input-group">
              <label>No. Ext / Int</label>
              <div class="flex gap-2">
                <input type="text" v-model="form.extNo" placeholder="Ext" class="fiax-field w-1/2">
                <input type="text" v-model="form.intNo" placeholder="Int" class="fiax-field w-1/2">
              </div>
            </div>
            <div class="fiax-input-group">
              <label>Código Postal</label>
              <input type="text" v-model="form.postalCode" placeholder="06500" class="fiax-field font-mono">
            </div>
            <div class="fiax-input-group md:col-span-2">
              <label>Colonia</label>
              <input type="text" v-model="form.suburb" placeholder="Col. Juárez" class="fiax-field">
            </div>
            <div class="fiax-input-group">
              <label>Ciudad / Municipio</label>
              <input type="text" v-model="form.municipality" placeholder="Cuauhtémoc" class="fiax-field">
            </div>
            <div class="fiax-input-group">
              <label>Estado</label>
              <input type="text" v-model="form.state" placeholder="CDMX" class="fiax-field">
            </div>
            <div class="fiax-input-group">
              <label>País</label>
              <input type="text" v-model="form.country" placeholder="MEX" class="fiax-field font-bold">
            </div>
          </div>
        </section>

        <!-- Tab: Contacto -->
        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Contacto y Envío</h3>
          </div>
          
          <div class="fiax-input-group">
            <label>Correo Electrónico (Para envío automático de XML/PDF)</label>
            <input type="email" v-model="form.email" placeholder="contabilidad@cliente.com" class="fiax-field font-mono">
          </div>
        </section>

      </div>

      <!-- Modal Footer -->
      <div class="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5 rounded-b-3xl">
        <button @click="$emit('close')" class="fiax-btn fiax-btn-ghost text-slate-400">Cancelar</button>
        <button @click="save" class="fiax-btn fiax-btn-primary px-8">Registrar Cliente</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientsFormModal',
  props: {
    client: { type: Object, default: null }
  },
  setup(props, { emit }) {
    const isNew = Vue.computed(() => !props.client?.id);
    
    // Default initial state for a new client
    const defaultForm = {
        name: '',
        rfc: '',
        taxRegime: '601',
        cfdiUse: 'G03',
        email: '',
        street: '',
        extNo: '',
        intNo: '',
        suburb: '',
        municipality: '',
        state: '',
        postalCode: '',
        country: 'MEX'
    };

    const form = Vue.reactive(props.client ? { ...defaultForm, ...props.client } : { ...defaultForm });

    const catalogs = Vue.computed(() => window.fiax.demo_data?.catalogs || {});

    const save = () => {
      if (!form.rfc || !form.name || !form.postalCode) {
          alert("RFC, Nombre y Código Postal son obligatorios.");
          return;
      }
      emit('save', { 
          ...form, 
          id: form.id || `cli-${Date.now()}`,
          type: 'Client'
      });
    };

    return { isNew, form, catalogs, save };
  }
}
</script>

<style scoped>
/* Reuse the same styles as IssuersFormModal for consistency */
.fiax-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
  padding: 24px;
}
.fiax-modal-content {
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 32px;
}

.fiax-input-group { display: flex; flex-direction: column; gap: 8px; }
.fiax-input-group label {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--app-text-muted);
}
.fiax-field {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 10px 14px; font-size: 13px; color: #fff;
  transition: all 0.2s ease; outline: none; width: 100%;
}
.fiax-field:focus {
  border-color: var(--app-primary);
  background: rgba(var(--app-primary-rgb), 0.05);
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
