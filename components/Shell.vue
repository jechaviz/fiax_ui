
<template>
  <div class="app-luxury-shell">
    <!-- Command Palette (Cmd+K) -->
    <CommandPalette ref="cmdPalette" :state="state" />

    <!-- AI Chat Panel -->
    <AIChatPanel ref="aiPanel" :state="state" />

    <!-- Sidebar -->
    <Sidebar :state="state" />

    <!-- Content pane -->
    <div class="app-content-pane">
      <!-- Topbar -->
      <header class="app-topbar">
        <!-- Search / Command trigger -->
        <div
          class="topbar-search-trigger"
          @click="$refs.cmdPalette?.open()"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Buscar o ejecutar un comando...</span>
          <kbd>⌘K</kbd>
        </div>

        <!-- Right actions -->
        <div class="topbar-actions">
          <!-- AI Button -->
          <button
            class="topbar-ai-btn"
            @click="$refs.aiPanel?.open()"
            title="Fiax AI Assistant"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>AI</span>
            <div class="topbar-ai-pulse"></div>
          </button>

          <!-- Onboarding Blinker -->
          <button
            v-if="!state.isSetupComplete"
            class="topbar-setup-btn"
            @click="state.onboardingOpen = true"
            title="Configuración Pendiente"
          >
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span class="setup-pulse"></span>
          </button>

          <!-- Theme Toggle -->
          <button 
            class="topbar-icon-btn" 
            @click="state.toggleTheme()" 
            :title="state.activeTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'"
          >
            <i :class="state.activeTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
          </button>

          <!-- Notifications -->
          <button class="topbar-icon-btn" title="Notificaciones">
            <i class="fa-regular fa-bell"></i>
            <span class="topbar-notif-dot"></span>
          </button>

          <!-- User avatar -->
          <div class="topbar-avatar">
            {{ state.user?.name?.charAt(0) || 'U' }}
          </div>
        </div>
      </header>

      <main class="app-pane-body">
        <slot />
      </main>
    </div>

    <!-- Onboarding Wizard -->
    <OnboardingWizard
      v-if="state.onboardingOpen"
      :is-open="state.onboardingOpen"
      :state="state"
      @close="state.onboardingOpen = false"
    />
  </div>
</template>

<script>
export default {
  name: 'Shell',
  props: {
    state: { type: Object, required: true }
  },
  components: {
    Sidebar: Vue.defineAsyncComponent(() =>
      window.fiax.loadModule('/components/Sidebar.vue', window.fiax.loaderOptions)
    ),
    CommandPalette: Vue.defineAsyncComponent(() =>
      window.fiax.loadModule('app/workspace/CommandPalette.vue', window.fiax.loaderOptions)
    ),
    AIChatPanel: Vue.defineAsyncComponent(() =>
      window.fiax.loadModule('app/workspace/AIChatPanel.vue', window.fiax.loaderOptions)
    ),
    OnboardingWizard: Vue.defineAsyncComponent(() =>
      window.fiax.loadModule('/components/OnboardingWizard.vue', window.fiax.loaderOptions)
    ),
  }
}
</script>


<style>
/* ── Page transition ────────────────────────── */
.page-fade-enter-active { animation: fadeSlideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }
.page-fade-leave-active { animation: fadeSlideOut 0.16s ease forwards; }
@keyframes fadeSlideOut { from { opacity:1; } to { opacity:0; } }

/* ── Setup Blinker ────────────────────────── */
.topbar-setup-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b; display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer; transition: all 0.3s ease;
}
.topbar-setup-btn:hover { background: rgba(245, 158, 11, 0.2); transform: scale(1.1); }

.setup-pulse {
  position: absolute; inset: -2px; border-radius: 12px;
  border: 2px solid #f59e0b; opacity: 0;
  animation: setup-blink 2s infinite;
}

@keyframes setup-blink {
  0%   { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}
</style>
