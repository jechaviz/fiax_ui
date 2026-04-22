<template>
  <div class="fiax-modal-overlay animate-fade-in" @click.self="$emit('close')">
    <div class="fiax-modal-content fiax-glass-card max-w-3xl w-full animate-slide-up max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div>
          <h2 class="text-xl font-black tracking-tight">{{ isNew ? 'Nuevo Emisor Fiscal' : 'Editar Emisor' }}</h2>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">{{ isNew ? 'Configura una nueva identidad' : issuer.rfc }}</p>
        </div>
        <button @click="$emit('close')" class="fiax-icon-btn text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-6 border-b border-white/5 bg-white/2 flex gap-8">
        <button 
          v-for="tab in ['General', 'Certificados (CSD)', 'PAC / Timbrado', 'Reglas Inyectadas']" 
          :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'"
          class="py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-8 overflow-y-auto space-y-10 custom-scrollbar flex-grow">
        
        <!-- Tab: General -->
        <div v-if="activeTab === 'General'" class="space-y-10">
          <section class="space-y-4">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">
                <i class="fa-solid fa-id-card"></i>
              </div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Identidad Fiscal</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="fiax-input-group">
                <label>RFC del Emisor</label>
                <input type="text" v-model="form.rfc" placeholder="ABCD800101XXX" class="fiax-field font-mono uppercase">
              </div>
              <div class="fiax-input-group">
                <label>Régimen Fiscal</label>
                <select v-model="form.taxRegime" class="fiax-field">
                  <option v-for="(name, code) in catalogs.taxRegimes" :key="code" :value="code">
                    {{ code }} - {{ name }}
                  </option>
                </select>
              </div>
              <div class="fiax-input-group md:col-span-2">
                <label>Nombre o Razón Social</label>
                <input type="text" v-model="form.name" placeholder="Ej: Servicios Profesionales S.A." class="fiax-field">
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                  <i class="fa-solid fa-map-location-dot"></i>
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Sucursales / Lugares de Expedición</h3>
              </div>
              <button @click="addBranch" class="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                <i class="fa-solid fa-plus mr-1"></i> Añadir Sucursal
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="(branch, idx) in form.branches" :key="branch.id" class="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4 group relative">
                <div class="flex items-center justify-between border-b border-white/5 pb-3">
                  <div class="flex items-center gap-3">
                    <div class="text-[10px] font-black text-slate-500 bg-white/5 w-6 h-6 rounded flex items-center justify-center">{{ idx + 1 }}</div>
                    <input type="text" v-model="branch.name" placeholder="Nombre de la Sucursal (ej. Matriz)" class="bg-transparent border-none outline-none text-sm font-bold text-white w-64">
                  </div>
                  <button @click="removeBranch(idx)" class="p-2 text-rose-500/50 hover:text-rose-500 transition-all">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="fiax-input-group md:col-span-2">
                    <label class="text-[9px]">Calle y Número</label>
                    <input type="text" v-model="branch.street" placeholder="Av. Principal 123" class="fiax-field-sm">
                  </div>
                  <div class="fiax-input-group">
                    <label class="text-[9px]">Código Postal</label>
                    <input type="text" v-model="branch.postalCode" placeholder="06500" class="fiax-field-sm font-mono">
                  </div>
                  <div class="fiax-input-group md:col-span-2">
                    <label class="text-[9px]">Colonia / Municipio</label>
                    <input type="text" v-model="branch.location" placeholder="Col. Centro, Cuauhtémoc" class="fiax-field-sm">
                  </div>
                  <div class="fiax-input-group">
                    <label class="text-[9px]">País</label>
                    <input type="text" v-model="branch.country" placeholder="MEX" class="fiax-field-sm font-bold text-primary">
                  </div>
                </div>
              </div>
              <div v-if="!form.branches.length" class="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl text-slate-500 text-xs italic">
                No hay sucursales configuradas. Añade una para poder expedir facturas.
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Certificados -->
        <div v-if="activeTab === 'Certificados (CSD)'" class="space-y-10">
          <section class="p-8 bg-slate-900/40 rounded-3xl border border-white/5 space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                <i class="fa-solid fa-key"></i>
              </div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Certificado de Sello Digital (CSD)</h3>
            </div>

            <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
              <i class="fa-solid fa-shield-halved text-amber-500 mt-1"></i>
              <div>
                  <p class="text-xs font-bold text-amber-200 uppercase tracking-tight mb-1">Aviso de Seguridad</p>
                  <p class="text-[10px] text-amber-200/60 leading-relaxed">Tus archivos CSD se manejan de forma local. En esta versión demo, simulamos la asociación de certificados para habilitar las firmas digitales CFDI 4.0.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="fiax-input-group">
                <label>Archivo .CER</label>
                <div class="fiax-file-stub">
                  <i class="fa-solid fa-file-contract text-blue-400/50"></i>
                  <span>{{ form.csdCertName || 'Seleccionar certificado...' }}</span>
                  <input type="file" @change="handleFileChange($event, 'csdCertName')" class="hidden-input">
                </div>
              </div>
              <div class="fiax-input-group">
                <label>Archivo .KEY</label>
                <div class="fiax-file-stub">
                  <i class="fa-solid fa-file-key text-blue-400/50"></i>
                  <span>{{ form.csdKeyName || 'Seleccionar llave privada...' }}</span>
                  <input type="file" @change="handleFileChange($event, 'csdKeyName')" class="hidden-input">
                </div>
              </div>
              <div class="fiax-input-group md:col-span-2">
                <label>Contraseña del Certificado</label>
                <div class="relative">
                  <input type="password" v-model="form.csdPassword" class="fiax-field pr-12">
                  <i class="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"></i>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: PAC -->
        <div v-if="activeTab === 'PAC / Timbrado'" class="space-y-10">
          <section class="space-y-4 px-2">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">
                <i class="fa-solid fa-bolt"></i>
              </div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Configuración de Timbrado (PAC)</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="fiax-input-group">
                <label>Proveedor PAC</label>
                <select v-model="form.pacProvider" class="fiax-field">
                  <option value="Facturama">Facturama (Recomendado)</option>
                  <option value="Finkok">Finkok</option>
                  <option value="SW Sapien">SW Sapien</option>
                </select>
              </div>
              <div class="fiax-input-group">
                <label>Usuario del PAC</label>
                <input type="text" v-model="form.pacUser" placeholder="username_pac" class="fiax-field font-mono">
              </div>
              <div class="fiax-input-group md:col-span-2">
                <label>API Key / Token de Acceso</label>
                <input type="password" v-model="form.pacApiKey" class="fiax-field font-mono text-xs">
              </div>
            </div>
          </section>
        </div>

        <!-- Tab: Custom Rules (Dynamic YAML Engine) -->
        <div v-if="activeTab === 'Reglas Inyectadas'" class="space-y-6">
          <div class="p-6 bg-slate-900/60 rounded-3xl border border-white/5 space-y-4">
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">
                    <i class="fa-solid fa-code"></i>
                  </div>
                  <h3 class="text-sm font-black uppercase tracking-widest text-slate-300">Invoicing Rules Engine (YAML)</h3>
                </div>
                <div v-if="yamlError" class="text-[10px] font-bold text-rose-500 animate-pulse">
                   <i class="fa-solid fa-triangle-exclamation mr-1"></i> YAML Inválido
                </div>
                <div v-else-if="form.rulesYaml" class="text-[10px] font-bold text-emerald-500">
                   <i class="fa-solid fa-check-circle mr-1"></i> Configuración Válida
                </div>
             </div>

             <p class="text-[11px] text-slate-500 leading-relaxed italic">
                Define comportamiento dinámico, visibilidad de campos y menciones legales basadas en RFC. 
                Los cambios se aplican automáticamente al guardar.
             </p>

             <div class="relative group">
                <textarea 
                  v-model="form.rulesYaml" 
                  spellcheck="false"
                  class="w-full h-80 bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-xs text-blue-300 focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="# Example Rules...
form:
  line_items:
    columns:
      lot: { visible: true, label: 'Lote ERP' }"
                ></textarea>
                <div class="absolute bottom-4 right-4 text-[10px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                   YAML Editor v1.0
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5 rounded-b-3xl">
        <button @click="$emit('close')" class="fiax-btn fiax-btn-ghost text-slate-400">Cancelar</button>
        <button @click="save" class="fiax-btn fiax-btn-primary px-8">Guardar Cambios</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssuersFormModal',
  props: {
    issuer: { type: Object, default: null }
  },
  setup(props, { emit }) {
    const isNew = Vue.computed(() => !props.issuer?.rfc);
    const activeTab = Vue.ref('General');
    const form = Vue.reactive({ ...props.issuer, rulesYaml: props.issuer.rulesYaml || '' });
    const yamlError = Vue.ref(false);

    Vue.watch(() => form.rulesYaml, (val) => {
      if (!val) { yamlError.ref = false; return; }
      try {
        jsyaml.load(val);
        yamlError.value = false;
      } catch (e) {
        yamlError.value = true;
      }
    });

    const catalogs = Vue.computed(() => window.fiax.demo_data?.catalogs || { taxRegimes: {} });

    const addBranch = () => {
      form.branches.push({ 
          id: `br-${Date.now()}`, 
          name: '', 
          street: '',
          postalCode: '', 
          location: '',
          country: 'MEX' 
      });
    };

    const removeBranch = (idx) => {
      form.branches.splice(idx, 1);
    };

    const handleFileChange = (event, field) => {
      const file = event.target.files[0];
      if (file) {
        form[field] = file.name;
      }
    };

    const save = () => {
      if (yamlError.value) {
        alert("El YAML tiene errores de sintaxis. Por favor corrígelo antes de guardar.");
        return;
      }
      emit('save', { ...form });
    };

    return { isNew, activeTab, form, yamlError, addBranch, removeBranch, handleFileChange, save, catalogs };
  }
}
</script>

<style scoped>
.fiax-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
  padding: 24px;
}
.fiax-modal-content {
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.fiax-input-group { display: flex; flex-direction: column; gap: 8px; }
.fiax-input-group label {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--app-text-muted);
}
.fiax-field {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px 16px; font-size: 14px; color: #fff;
  transition: all 0.2s ease; outline: none; width: 100%;
}
.fiax-field:focus {
  border-color: var(--app-primary);
  background: rgba(var(--app-primary-rgb), 0.05);
}

.fiax-sub-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
  transition: all 0.2s ease;
}
.fiax-sub-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }

.fiax-field-sm {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fff;
  transition: all 0.2s ease; outline: none; width: 100%;
}
.fiax-field-sm:focus {
  border-color: var(--app-primary);
  background: rgba(var(--app-primary-rgb), 0.05);
}

.fiax-file-stub {
  position: relative; display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: rgba(255,255,255,0.02);
  border: 2px dashed rgba(255,255,255,0.08); border-radius: 12px;
  font-size: 12px; color: var(--app-text-muted); cursor: pointer;
}
.fiax-file-stub:hover { border-color: var(--app-primary); color: #fff; }
.hidden-input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
