
<template>
  <div class="fiax-surface-container app-animate-in">
    <div class="fiax-surface-header">
      <div class="flex items-center gap-4">
        <div class="fiax-icon-badge">
          <i class="fa-solid fa-building-columns"></i>
        </div>
        <div>
          <h1 class="fiax-surface-title">Administración de Emisores</h1>
          <p class="fiax-surface-subtitle">Gestiona tus identidades fiscales, sucursales y certificados de sellos digitales.</p>
        </div>
      </div>
      <div class="fiax-surface-actions">
        <button v-if="state.data.issuers?.length < 5" @click="openIssuerModal()" class="app-btn app-btn--primary">
          <i class="fa-solid fa-plus-circle mr-2"></i>
          <span>Nuevo Emisor</span>
        </button>
      </div>
    </div>

    <!-- Stats Row (Balanced Luxury Design) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="app-stat-card border-l-4 border-l-indigo-500">
        <div class="flex items-center justify-between">
            <div>
              <p class="app-stat-label mb-1">Emisores Activos</p>
              <h3 class="app-stat-value">{{ state.data.issuers?.length || 0 }}</h3>
            </div>
            <div class="text-3xl text-indigo-500/20"><i class="fa-solid fa-building-memo"></i></div>
        </div>
      </div>
      <div class="app-stat-card border-l-4 border-l-emerald-500">
        <div class="flex items-center justify-between">
            <div>
              <p class="app-stat-label mb-1">Certificados Válidos</p>
              <h3 class="app-stat-value">{{ state.data.issuers?.length || 0 }}</h3>
            </div>
            <div class="text-3xl text-emerald-500/20"><i class="fa-solid fa-shield-check"></i></div>
        </div>
      </div>
      <div class="app-stat-card border-l-4 border-l-amber-500">
        <div class="flex items-center justify-between">
            <div>
              <p class="app-stat-label mb-1">Timbres Consumidos</p>
              <h3 class="app-stat-value">1,248</h3>
            </div>
            <div class="text-3xl text-amber-500/20"><i class="fa-solid fa-bolt"></i></div>
        </div>
      </div>
    </div>

    <!-- Main List Container -->
    <div class="app-data-table-shell">
      <div class="app-table-toolbar">
         <div class="flex items-center gap-2 bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/10 rounded-xl px-3 py-1">
            <i class="fa-solid fa-magnifying-glass text-xs text-slate-400"></i>
            <input type="text" v-model="searchQuery" placeholder="Buscar por RFC o Nombre..." class="bg-transparent border-none text-sm outline-none w-64 text-slate-700 dark:text-slate-200">
         </div>
      </div>

      <div class="overflow-x-auto">
        <table class="app-record-table">
          <thead>
            <tr>
              <th>Identidad Fiscal</th>
              <th>Régimen</th>
              <th>Sucursales</th>
              <th>Estado CSD</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issuer in filteredIssuers" :key="issuer.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center font-black text-primary italic">
                    {{ (issuer.name || 'E').charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">{{ issuer.name }}</div>
                    <div class="font-mono text-[10px] text-slate-400 uppercase tracking-widest">{{ issuer.rfc }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {{ issuer.taxRegime }}
                </span>
              </td>
              <td>
                <div class="flex -space-x-2">
                  <div v-for="(b, i) in (issuer.branches || [])" :key="b.id" 
                       class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold shadow-sm"
                       v-tooltip="b.name">
                    {{ i + 1 }}
                  </div>
                  <div v-if="!issuer.branches?.length" class="text-xs text-slate-400 italic">Sin sucursales</div>
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   <span class="text-[10px] font-bold uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">Vigente</span>
                </div>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-1">
                  <button @click="openIssuerModal(issuer)" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-glow hover:text-primary transition-colors" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button v-if="state.currentIssuer?.id !== issuer.id" @click="state.switchIssuer(issuer.id)" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors" title="Activar">
                    <i class="fa-solid fa-power-off"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail/Edit Modal -->
    <IssuersFormModal
      v-if="modal.show"
      :issuer="modal.issuer"
      @close="modal.show = false"
      @save="onSaveIssuer"
    />
  </div>
</template>

<script>
export default {
  name: 'IssuersList',
  props: {
    state: { type: Object, required: true }
  },
  components: {
    IssuersFormModal: Vue.defineAsyncComponent(() => 
      window.fiax.loadModule('/components/IssuersFormModal.vue', window.fiax.loaderOptions)
    )
  },
  setup(props) {
    const searchQuery = Vue.ref('');
    const modal = Vue.reactive({
      show: false,
      issuer: null
    });

    const filteredIssuers = Vue.computed(() => {
      const all = props.state.data.issuers || [];
      if (!searchQuery.value) return all;
      const q = searchQuery.value.toLowerCase();
      return all.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.rfc.toLowerCase().includes(q)
      );
    });

    const openIssuerModal = (issuer = null) => {
      modal.issuer = issuer ? JSON.parse(JSON.stringify(issuer)) : {
        id: `issuer-${Date.now()}`,
        name: '',
        rfc: '',
        taxRegime: '',
        branches: [],
        pacProvider: 'Facturama',
        pacUser: '',
        pacApiKey: ''
      };
      modal.show = true;
    };

    const onSaveIssuer = (updated) => {
      props.state.saveIssuer(updated);
      modal.show = false;
    };

    return { searchQuery, filteredIssuers, modal, openIssuerModal, onSaveIssuer };
  }
}
</script>

<style scoped>
.fiax-surface-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 32px;
}
.fiax-icon-badge {
  width: 52px; height: 52px; border-radius: 14px;
  background: var(--app-primary-glow); color: var(--app-primary);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.fiax-surface-title { font-size: 26px; font-weight: 900; letter-spacing: -0.03em; color: var(--app-text-primary); }
.fiax-surface-subtitle { color: var(--app-text-muted); font-size: 14px; font-weight: 500; }
</style>
