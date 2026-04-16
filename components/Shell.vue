
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
.page-fade-enter-active { animation: fadeSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
.page-fade-leave-active { animation: fadeSlideOut 0.18s ease forwards; }
@keyframes fadeSlideIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeSlideOut { from { opacity:1; } to { opacity:0; } }

/* ── Topbar elements ────────────────────────── */
.topbar-search-trigger {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all 0.18s ease; color: var(--app-text-muted);
  font-size: 13px; font-weight: 500; min-width: 240px;
}
.topbar-search-trigger:hover {
  background: rgba(255,255,255,0.06); border-color: rgba(var(--app-primary-rgb),0.3); color: var(--app-text-secondary);
}
.topbar-search-trigger i { font-size: 12px; }
.topbar-search-trigger kbd {
  margin-left: auto; font-size: 9px; font-weight: 700;
  color: var(--app-text-muted); background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09); border-radius: 5px; padding: 2px 6px;
}

.topbar-actions { display: flex; align-items: center; gap: 10px; }

.topbar-ai-btn {
  position: relative; display: flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 999px;
  background: rgba(var(--app-primary-rgb), 0.1); border: 1px solid rgba(var(--app-primary-rgb), 0.2);
  color: rgba(var(--app-primary-rgb), 0.9); font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.18s ease; font-family: var(--app-font-main);
}
.topbar-ai-btn:hover { background: rgba(var(--app-primary-rgb), 0.18); border-color: rgba(var(--app-primary-rgb), 0.4); }
.topbar-ai-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: var(--app-primary);
  animation: app-pulse 2.5s infinite;
}

.topbar-icon-btn {
  position: relative; width: 34px; height: 34px; border-radius: 9px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  color: var(--app-text-muted); cursor: pointer; transition: all 0.15s ease;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.topbar-icon-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

.topbar-notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 6px; height: 6px; border-radius: 50%;
  background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.7);
}

.topbar-avatar {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 900; color: #fff; cursor: pointer;
  font-style: italic;
}
</style>
