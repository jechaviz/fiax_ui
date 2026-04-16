
<template>
  <teleport to="body">
    <transition name="cp-fade">
      <div v-if="isOpen" class="cp-overlay" @click.self="close">
        <div class="cp-modal">
          <!-- Search bar -->
          <div class="cp-search-bar">
            <i class="fa-solid fa-bolt-lightning cp-search-icon"></i>
            <input
              ref="inputRef"
              v-model="query"
              class="cp-input"
              placeholder="Buscar acciones, módulos o registros..."
              @keydown.esc="close"
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter.prevent="executeActive"
            />
            <kbd class="cp-esc-key">ESC</kbd>
          </div>

          <!-- Results -->
          <div v-if="filteredResults.length" class="cp-results">
            <div
              v-for="(item, idx) in filteredResults"
              :key="item.key"
              class="cp-item"
              :class="{ 'is-active': activeIndex === idx }"
              @click="executeItem(item)"
              @mouseenter="activeIndex = idx"
            >
              <div class="cp-item-icon">
                <i :class="item.icon"></i>
              </div>
              <div class="cp-item-body">
                <strong>{{ item.label }}</strong>
                <span>{{ item.description }}</span>
              </div>
              <div v-if="activeIndex === idx" class="cp-item-enter">
                <kbd>↵</kbd>
              </div>
            </div>
          </div>
          <div v-else class="cp-empty">
            <i class="fa-regular fa-face-sad-tear"></i>
            <span>Sin resultados para "{{ query }}"</span>
          </div>

          <!-- Footer -->
          <div class="cp-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navegar</span>
            <span><kbd>↵</kbd> Ejecutar</span>
            <span><kbd>ESC</kbd> Cerrar</span>
            <div class="cp-footer-brand">
              <i class="fa-solid fa-feather-pointed"></i> Fiax Command
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'CommandPalette',
  props: {
    state: { type: Object, default: null }
  },
  data() {
    return {
      isOpen: false,
      query: '',
      activeIndex: 0,
    };
  },
  computed: {
    allActions() {
      const nav = this.state?.config?.navigation || [];
      const actions = [];

      // Add nav actions
      for (const item of nav) {
        if (item.type === 'section') continue;
        if (item.path) {
          actions.push({
            key: `nav-${item.id}`,
            label: item.label,
            description: 'Navegar al módulo',
            icon: item.icon || 'fa-solid fa-arrow-right',
            href: item.path,
          });
        }
        if (item.children) {
          for (const sub of item.children) {
            actions.push({
              key: `nav-${sub.id}`,
              label: sub.label,
              description: item.label,
              icon: item.icon || 'fa-solid fa-arrow-right',
              href: sub.path,
            });
          }
        }
      }

      // Add quick actions
      actions.unshift(
        { key: 'new-invoice', label: 'Nueva Factura', description: 'Crear un nuevo CFDI de Ingreso', icon: 'fa-solid fa-plus', href: '/cfdi/ingresos/new' },
        { key: 'new-client', label: 'Nuevo Cliente', description: 'Registrar un cliente en el catálogo', icon: 'fa-solid fa-user-plus', href: '/clients/new' },
      );

      return actions;
    },
    filteredResults() {
      if (!this.query.trim()) return this.allActions.slice(0, 8);
      const q = this.query.toLowerCase();
      return this.allActions
        .filter(a => a.label.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q))
        .slice(0, 8);
    },
  },
  watch: {
    query() { this.activeIndex = 0; }
  },
  mounted() {
    document.addEventListener('keydown', this.handleGlobalKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKey);
  },
  methods: {
    handleGlobalKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.isOpen ? this.close() : this.open();
      }
    },
    open() {
      this.isOpen = true;
      this.query = '';
      this.activeIndex = 0;
      this.$nextTick(() => this.$refs.inputRef?.focus());
    },
    close() { this.isOpen = false; },
    moveDown() { if (this.activeIndex < this.filteredResults.length - 1) this.activeIndex++; },
    moveUp() { if (this.activeIndex > 0) this.activeIndex--; },
    executeActive() {
      const item = this.filteredResults[this.activeIndex];
      if (item) this.executeItem(item);
    },
    executeItem(item) {
      if (item.href) {
        // Use Vue Router if available via state, otherwise hash-navigate
        const router = window.fiax?._router;
        if (router) router.push(item.href).catch(() => {});
        else window.location.hash = '#' + item.href;
      } else if (item.action && typeof item.action === 'function') {
        item.action();
      }
      this.close();
    },
  },
};
</script>

<style>
.cp-fade-enter-active, .cp-fade-leave-active { transition: opacity 0.18s ease; }
.cp-fade-enter-from, .cp-fade-leave-to { opacity: 0; }
.cp-fade-enter-active .cp-modal, .cp-fade-leave-active .cp-modal { transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.cp-fade-enter-from .cp-modal, .cp-fade-leave-to .cp-modal { transform: scale(0.96) translateY(-10px); }

.cp-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(2, 6, 16, 0.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 12vh;
}

.cp-modal {
  width: min(640px, 92vw);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(180deg, rgba(10, 19, 38, 0.99) 0%, rgba(6, 12, 24, 0.99) 100%);
  box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05);
  overflow: hidden;
}

.cp-search-bar {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.cp-search-icon {
  color: var(--app-primary); font-size: 16px;
  filter: drop-shadow(0 0 8px rgba(59,130,246,0.6));
  flex-shrink: 0;
}

.cp-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #f0f6ff; font-size: 16px; font-weight: 500;
  font-family: var(--app-font-main);
  caret-color: var(--app-primary);
}
.cp-input::placeholder { color: var(--app-text-muted); }

.cp-esc-key {
  font-size: 10px; font-weight: 700;
  color: var(--app-text-muted);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px; padding: 3px 7px;
}

.cp-results { max-height: 360px; overflow-y: auto; padding: 8px; }
.cp-results::-webkit-scrollbar { width: 4px; }
.cp-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

.cp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px;
  cursor: pointer; transition: background 0.12s ease;
}
.cp-item.is-active { background: rgba(var(--app-primary-rgb), 0.12); }

.cp-item-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--app-text-secondary);
}
.cp-item.is-active .cp-item-icon {
  background: rgba(var(--app-primary-rgb), 0.18);
  color: var(--app-primary);
}

.cp-item-body { flex: 1; overflow: hidden; }
.cp-item-body strong { display: block; font-size: 13px; color: #f0f6ff; font-weight: 700; }
.cp-item-body span { font-size: 11px; color: var(--app-text-muted); }

.cp-item-enter kbd {
  font-size: 10px; color: var(--app-primary);
  background: rgba(var(--app-primary-rgb), 0.1);
  border: 1px solid rgba(var(--app-primary-rgb), 0.25);
  border-radius: 5px; padding: 2px 6px;
}

.cp-empty {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 40px 20px;
  color: var(--app-text-muted); font-size: 13px; font-weight: 600;
}

.cp-footer {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  font-size: 10px; font-weight: 600; color: var(--app-text-muted);
}
.cp-footer kbd {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px; padding: 1px 5px; margin-right: 4px;
}
.cp-footer-brand { margin-left: auto; color: rgba(var(--app-primary-rgb), 0.5); font-size: 10px; display: flex; align-items: center; gap: 5px; }
</style>
