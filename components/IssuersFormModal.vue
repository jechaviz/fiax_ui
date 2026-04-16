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

      <!-- Modal Body -->
      <div class="p-8 overflow-y-auto space-y-10 custom-scrollbar flex-grow">
        
        <!-- Section: Identidad Fiscal -->
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
                <option value="601">601 - General de Ley Personas Morales</option>
                <option value="612">612 - Personas Físicas con Actividades Emp.</option>
                <option value="626">626 - RESICO</option>
              </select>
            </div>
            <div class="fiax-input-group md:col-span-2">
              <label>Nombre o Razón Social</label>
              <input type="text" v-model="form.name" placeholder="Ej: Servicios Profesionales S.A." class="fiax-field">
            </div>
          </div>
        </section>

        <!-- Section: Sucursales (Luxury Cards) -->
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

          <div class="grid grid-cols-1 gap-3">
            <div v-for="(branch, idx) in form.branches" :key="branch.id" class="fiax-sub-card group">
              <div class="flex items-center gap-4 flex-grow">
                <div class="text-[10px] font-black text-slate-500 bg-white/5 w-6 h-6 rounded flex items-center justify-center">{{ idx + 1 }}</div>
                <input type="text" v-model="branch.name" placeholder="Nombre (ej. CDMX Central)" class="bg-transparent border-none outline-none text-sm font-bold flex-grow">
                <input type="text" v-model="branch.postalCode" placeholder="CP (ej. 06500)" class="bg-transparent border-none outline-none text-xs font-mono text-slate-400 w-24">
              </div>
              <button @click="removeBranch(idx)" class="opacity-0 group-hover:opacity-100 p-2 text-rose-500/50 hover:text-rose-500 transition-all">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
            <div v-if="!form.branches.length" class="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl text-slate-500 text-xs italic">
               No hay sucursales configuradas. Añade una para poder expedir facturas.
            </div>
          </div>
        </section>

        <!-- Section: Certificados CSD (Security Aesthetic) -->
        <section class="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-6">
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
                <i class="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"></i>
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Timbrado (PAC) -->
        <section class="space-y-4">
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
    const form = Vue.reactive({ ...props.issuer });

    const addBranch = () => {
      form.branches.push({ id: `br-${Date.now()}`, name: '', postalCode: '' });
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
      emit('save', { ...form });
    };

    return { isNew, form, addBranch, removeBranch, handleFileChange, save };
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
