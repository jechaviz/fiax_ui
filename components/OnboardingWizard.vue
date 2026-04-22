<template>
  <div class="fiax-modal-overlay onboarding-overlay" v-if="isOpen" @click.self="close">
    <div class="fiax-wizard-container fiax-glass-card animate-slide-up">
      
      <!-- Wizard Sidebar (Progress) -->
      <aside class="fiax-wizard-sidebar">
        <div class="wizard-header">
          <div class="fiax-logo-mini italic">FIAX</div>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Setup Inicial</p>
        </div>
        
        <nav class="wizard-steps">
          <div 
            v-for="(step, idx) in steps" 
            :key="idx"
            class="wizard-step-item"
            :class="{ 'is-active': currentStep === idx, 'is-completed': currentStep > idx }"
          >
            <div class="step-indicator">
              <i v-if="currentStep > idx" class="fa-solid fa-check"></i>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="step-meta">
              <span class="step-label">{{ step.label }}</span>
              <span class="step-desc">{{ step.desc }}</span>
            </div>
          </div>
        </nav>

        <div class="wizard-footer-note">
          <p>Puedes saltar este proceso y terminarlo después desde la sección de Emisores.</p>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="fiax-wizard-main">
        <button @click="close" class="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <div class="wizard-content-scroll custom-scrollbar">
          <!-- Step 1: Empresa / Identidad -->
          <div v-if="currentStep === 0" class="wizard-pane animate-fade-in">
            <h2 class="wizard-title">Identidad Fiscal</h2>
            <p class="wizard-subtitle">Comencemos por registrar los datos básicos de tu empresa o identidad profesional.</p>
            
            <div class="grid grid-cols-1 gap-6 mt-8">
              <div class="fiax-input-group">
                <label>RFC de la Empresa</label>
                <input type="text" v-model="form.rfc" @input="form.rfc = form.rfc.toUpperCase()" placeholder="ABCD800101XXX" class="fiax-field font-mono">
              </div>
              <div class="fiax-input-group">
                <label>Nombre o Razón Social</label>
                <input type="text" v-model="form.name" placeholder="Ej: Servicios Digitales S.A." class="fiax-field">
              </div>
              <div class="fiax-input-group">
                <label>Régimen Fiscal</label>
                <select v-model="form.taxRegime" class="fiax-field">
                  <option v-for="(name, code) in catalogs.taxRegimes" :key="code" :value="code">{{ code }} - {{ name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 2: Sucursales -->
          <div v-if="currentStep === 1" class="wizard-pane animate-fade-in">
            <h2 class="wizard-title">Lugar de Expedición</h2>
            <p class="wizard-subtitle">Configura tu domicilio fiscal o sucursal principal para emitir facturas.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div class="fiax-input-group md:col-span-2">
                <label>Nombre de la Sucursal</label>
                <input type="text" v-model="branch.name" placeholder="Ej: Matriz CDMX" class="fiax-field">
              </div>
              <div class="fiax-input-group md:col-span-2">
                <label>Calle y Número</label>
                <input type="text" v-model="branch.street" placeholder="Av. Insurgentes Sur 123" class="fiax-field">
              </div>
              <div class="fiax-input-group">
                <label>Código Postal</label>
                <input type="text" v-model="branch.postalCode" placeholder="06500" class="fiax-field font-mono">
              </div>
              <div class="fiax-input-group">
                <label>País</label>
                <input type="text" v-model="branch.country" placeholder="MEX" class="fiax-field font-bold">
              </div>
            </div>
          </div>

          <!-- Step 3: Sellos (CSD) -->
          <div v-if="currentStep === 2" class="wizard-pane animate-fade-in">
            <h2 class="wizard-title">Sello Digital (CSD)</h2>
            <p class="wizard-subtitle">Sube tus archivos de certificado para que podamos firmar tus facturas ante el SAT.</p>
            
            <div class="mt-8 space-y-6">
              <div class="fiax-file-upload-zone" @click="triggerFile('cer')">
                <i class="fa-solid fa-certificate text-blue-400 text-2xl"></i>
                <div class="text-left">
                  <p class="text-sm font-bold">{{ form.csdCertName || 'Seleccionar archivo .CER' }}</p>
                  <p class="text-[10px] text-slate-500">Certificado de Sello Digital</p>
                </div>
                <input type="file" ref="fileCer" @change="onFileChange($event, 'csdCertName')" class="hidden">
              </div>

              <div class="fiax-file-upload-zone" @click="triggerFile('key')">
                <i class="fa-solid fa-key text-amber-400 text-2xl"></i>
                <div class="text-left">
                  <p class="text-sm font-bold">{{ form.csdKeyName || 'Seleccionar archivo .KEY' }}</p>
                  <p class="text-[10px] text-slate-500">Llave privada de tu sello</p>
                </div>
                <input type="file" ref="fileKey" @change="onFileChange($event, 'csdKeyName')" class="hidden">
              </div>

              <div class="fiax-input-group">
                <label>Contraseña de la Llave</label>
                <div class="relative">
                  <input type="password" v-model="form.csdPassword" class="fiax-field pr-12">
                  <i class="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Conectividad PAC -->
          <div v-if="currentStep === 3" class="wizard-pane animate-fade-in">
            <h2 class="wizard-title">Timbrado Electrónico</h2>
            <p class="wizard-subtitle">Conéctate con tu proveedor PAC para validar y timbrar oficialmente tus CFDIs.</p>
            
            <div class="grid grid-cols-1 gap-6 mt-8">
              <div class="fiax-input-group">
                <label>Proveedor Certificado</label>
                <select v-model="form.pacProvider" class="fiax-field">
                  <option value="Facturama">Facturama</option>
                  <option value="Finkok">Finkok</option>
                  <option value="SW Sapien">SW Sapien</option>
                </select>
              </div>
              <div class="fiax-input-group">
                <label>Usuario del PAC</label>
                <input type="text" v-model="form.pacUser" placeholder="cuenta_pac_01" class="fiax-field font-mono">
              </div>
              <div class="fiax-input-group">
                <label>API Key / Token de Acceso</label>
                <input type="password" v-model="form.pacApiKey" class="fiax-field font-mono text-xs">
              </div>
            </div>

            <div class="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3">
              <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
              <p class="text-xs text-emerald-200/70 leading-relaxed">Al terminar, realizaremos una prueba de conexión automática para asegurar que todo esté configurado correctamente.</p>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="wizard-actions">
          <button v-if="currentStep > 0" @click="currentStep--" class="fiax-btn fiax-btn-ghost text-slate-400">
            <i class="fa-solid fa-arrow-left mr-2"></i> Anterior
          </button>
          <div class="flex-grow"></div>
          <button v-if="currentStep < steps.length - 1" @click="currentStep++" class="fiax-btn fiax-btn-primary px-10">
            Siguiente <i class="fa-solid fa-arrow-right ml-2"></i>
          </button>
          <button v-else @click="finish" class="fiax-btn fiax-btn-primary px-12 bg-emerald-600 hover:bg-emerald-500">
             Finalizar Configuración <i class="fa-solid fa-wand-magic-sparkles ml-2"></i>
          </button>
        </div>
      </main>

    </div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingWizard',
  props: {
    state: { type: Object, required: true },
    isOpen: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const currentStep = Vue.ref(0);
    const steps = [
      { label: 'Identidad', desc: 'Datos fiscales base' },
      { label: 'Localización', desc: 'Sucursal principal' },
      { label: 'Seguridad', desc: 'Certificados SAT' },
      { label: 'Timbrado', desc: 'Credenciales PAC' }
    ];

    const form = Vue.reactive({
      id: `issuer-${Date.now()}`,
      rfc: '',
      name: '',
      taxRegime: '601',
      csdCertName: '',
      csdKeyName: '',
      csdPassword: '',
      pacProvider: 'Facturama',
      pacUser: '',
      pacApiKey: '',
      branches: []
    });

    const branch = Vue.reactive({
      name: 'Matriz',
      street: '',
      postalCode: '',
      country: 'MEX'
    });

    const catalogs = Vue.computed(() => window.fiax.demo_data?.catalogs || {});

    const triggerFile = (type) => {
        const refName = type === 'cer' ? 'fileCer' : 'fileKey';
        // In Vue 3 with SFC-loader we need to access refs carefully if needed, 
        // but often we can just use document.querySelector for stubs in this project.
        const input = document.querySelector(`input[type="file"][ref="${refName}"]`) || { click: () => {} };
        // For simplicity in the loader environment:
        const el = document.createElement('input');
        el.type = 'file';
        el.onchange = (e) => onFileChange(e, type === 'cer' ? 'csdCertName' : 'csdKeyName');
        el.click();
    };

    const onFileChange = (e, field) => {
      const file = e.target.files[0];
      if (file) form[field] = file.name;
    };

    const close = () => emit('close');

    const finish = () => {
      if (!form.rfc || !form.name) {
          alert("El RFC y Nombre son obligatorios en el Paso 1.");
          currentStep.value = 0;
          return;
      }
      // Attach the branch
      form.branches = [{ ...branch, id: `br-${Date.now()}` }];
      props.state.saveIssuer({ ...form });
      alert("🚀 ¡Felicidades! Tu cuenta está configurada y lista para facturar.");
      emit('finished');
      close();
    };

    return { steps, currentStep, form, branch, catalogs, triggerFile, onFileChange, close, finish };
  }
}
</script>

<style scoped>
.onboarding-overlay {
  z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}

.fiax-wizard-container {
  width: 900px;
  height: 600px;
  display: flex;
  overflow: hidden;
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
}

/* Sidebar */
.fiax-wizard-sidebar {
  width: 280px;
  background: rgba(255,255,255,0.02);
  border-right: 1px solid rgba(255,255,255,0.05);
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.fiax-logo-mini { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.05em; }

.wizard-steps { margin-top: 50px; flex-grow: 1; }
.wizard-step-item {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 24px;
  opacity: 0.4;
  transition: all 0.3s ease;
}
.wizard-step-item.is-active { opacity: 1; }
.wizard-step-item.is-completed { opacity: 0.8; }

.step-indicator {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 900;
  transition: all 0.3s ease;
}
.is-active .step-indicator { background: var(--app-primary); border-color: transparent; color: #fff; transform: scale(1.1); }
.is-completed .step-indicator { background: var(--app-success); border-color: transparent; color: #fff; }

.step-label { display: block; font-size: 13px; font-weight: 800; color: #fff; }
.step-desc { display: block; font-size: 10px; color: var(--app-text-muted); }

.wizard-footer-note { font-size: 10px; color: var(--app-text-muted); font-style: italic; line-height: 1.5; }

/* Main */
.fiax-wizard-main {
  flex-grow: 1;
  background: rgba(255,255,255,0.01);
  padding: 60px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.wizard-content-scroll { flex-grow: 1; overflow-y: auto; padding-right: 10px; }

.wizard-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 8px; color: #fff; }
.wizard-subtitle { font-size: 14px; color: var(--app-text-secondary); line-height: 1.6; }

.wizard-actions { display: flex; align-items: center; padding-top: 40px; margin-top: auto; }

.fiax-file-upload-zone {
  display: flex; align-items: center; gap: 20px;
  padding: 24px;
  background: rgba(255,255,255,0.03);
  border: 2px dashed rgba(255,255,255,0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.fiax-file-upload-zone:hover { border-color: var(--app-primary); background: rgba(59,130,246,0.05); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
