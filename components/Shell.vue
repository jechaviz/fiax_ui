
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

      <!-- Main content with page transition -->
      <main class="app-pane-body">
        <slot />
      </main>
    </div>
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
  }
}
</script>


<style>
/* ── Page transition ────────────────────────── */
.page-fade-enter-active { animation: fadeSlideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }
.page-fade-leave-active { animation: fadeSlideOut 0.16s ease forwards; }
@keyframes fadeSlideIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeSlideOut { from { opacity:1; } to { opacity:0; } }
</style>
