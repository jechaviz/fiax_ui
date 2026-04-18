
<template>
  <aside :class="['app-sidebar', state.sidebarCollapsed ? 'is-collapsed' : '']">
    <!-- Brand -->
    <div class="app-sidebar-brand" @click="$router.push('/')">
      <div class="app-sidebar-logo">
        <i class="fa-solid fa-feather-pointed"></i>
      </div>
      <div class="app-sidebar-brand-text" v-show="!state.sidebarCollapsed">
        <h1>FIAX</h1>
        <p>Enterprise</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="app-sidebar-nav">
      <div v-for="item in navigation" :key="item.id">

        <!-- Section label -->
        <div v-if="item.type === 'section'" class="app-nav-label" v-show="!state.sidebarCollapsed">
          {{ item.label }}
        </div>

        <!-- Direct link -->
        <router-link
          v-else-if="!item.children"
          :to="item.path"
          class="app-nav-link"
          active-class="is-active"
        >
          <div class="app-nav-icon">
            <i :class="item.icon"></i>
          </div>
          <span v-show="!state.sidebarCollapsed">{{ item.label }}</span>
        </router-link>

        <!-- Group with children -->
        <div v-else>
          <button
            class="app-nav-group-trigger"
            :class="{ 'is-open': expandedGroups.includes(item.id) }"
            @click="toggleGroup(item.id)"
          >
            <div class="app-nav-icon">
              <i :class="item.icon"></i>
            </div>
            <span v-show="!state.sidebarCollapsed">{{ item.label }}</span>
            <i v-show="!state.sidebarCollapsed" class="fa-solid fa-chevron-down app-nav-chevron"></i>
          </button>

          <div
            class="app-nav-sub"
            :class="{ 'is-open': expandedGroups.includes(item.id) && !state.sidebarCollapsed }"
          >
            <router-link
              v-for="sub in item.children"
              :key="sub.id"
              :to="sub.path"
              class="app-nav-sub-link"
              active-class="is-active"
            >
              {{ sub.label }}
            </router-link>
          </div>
        </div>

      </div>
    </nav>

    <!-- Profile footer -->
    <div class="app-sidebar-footer">
      <div class="app-sidebar-profile">
        <div class="app-profile-avatar">
          {{ state.user?.name?.charAt(0) || 'U' }}
        </div>
        <div class="app-profile-info" v-show="!state.sidebarCollapsed">
          <div class="app-profile-name">{{ state.user?.name || 'Usuario' }}</div>
          <div class="app-profile-rfc">{{ state.user?.rfc || '—' }}</div>
        </div>
        <i v-show="!state.sidebarCollapsed" class="fa-solid fa-right-from-bracket" style="font-size:10px;color:var(--app-text-muted);margin-left:auto;flex-shrink:0;"></i>
      </div>

      <!-- Sidebar Footer (Theme / Demo Toggle) -->
      <footer class="sidebar-footer" v-show="!state.sidebarCollapsed">
        <div v-if="state.demoMode" class="demo-badge">
           <div class="demo-pulse"></div>
           <span>Modo Demo Activo</span>
        </div>
        
        <button 
          class="footer-toggle-btn mb-2" 
          @click="state.toggleTheme()"
          title="Cambiar Tema"
        >
          <i :class="state.activeTheme === 'dark' ? 'fa-solid fa-moon text-indigo-400' : 'fa-solid fa-sun text-amber-400'"></i>
          <span>{{ state.activeTheme === 'dark' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>

        <button 
          class="footer-toggle-btn" 
          @click="state.toggleDemoMode()"
          :title="state.demoMode ? 'Pasar a Producción' : 'Regresar a Demo'"
        >
          <i :class="state.demoMode ? 'fa-solid fa-toggle-on text-primary' : 'fa-solid fa-toggle-off'"></i>
          <span>{{ state.demoMode ? 'Live Mode' : 'Demo Mode' }}</span>
        </button>
      </footer>
    </div>

    <!-- Collapse toggle -->
    <button class="app-sidebar-toggle" @click="state.sidebarCollapsed = !state.sidebarCollapsed">
      <i :class="['fa-solid', state.sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
    </button>
  </aside>
</template>

<script>
const { ref, computed } = Vue;

export default {
  name: 'Sidebar',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const navigation = computed(() => props.state.config?.navigation || []);
    const expandedGroups = ref(['billing', 'catalogs']);

    function toggleGroup(id) {
      if (props.state.sidebarCollapsed) {
        props.state.sidebarCollapsed = false;
        if (!expandedGroups.value.includes(id)) expandedGroups.value.push(id);
        return;
      }
      const idx = expandedGroups.value.indexOf(id);
      if (idx > -1) expandedGroups.value.splice(idx, 1);
      else expandedGroups.value.push(id);
    }

    return { navigation, expandedGroups, toggleGroup };
  }
}
</script>
