
<template>
  <div class="app-animate-in" style="padding-bottom:40px;">

    <!-- Hero KPI Band -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-bottom:28px;">
      <div v-for="kpi in kpis" :key="kpi.id" class="kpi-card" :style="`--kpi-color:${kpi.color};--kpi-glow:${kpi.glow};`">
        <div class="kpi-card__icon">
          <i :class="kpi.icon"></i>
        </div>
        <div class="kpi-card__body">
          <span class="kpi-card__label">{{ kpi.label }}</span>
          <span class="kpi-card__value">{{ kpi.value }}</span>
        </div>
        <div class="kpi-card__trend" :class="kpi.positive ? 'is-up' : 'is-down'">
          <i :class="kpi.positive ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
          {{ kpi.change }}
        </div>
        <div class="kpi-card__glow-orb"></div>
      </div>
    </div>

    <!-- Two-column layout: Activity + Quick Stats -->
    <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start;" class="dash-layout-grid">

      <!-- Recent Invoices Table -->
      <div class="dash-panel">
        <div class="dash-panel__head">
          <div>
            <h3 class="dash-panel__title">Actividad Reciente</h3>
            <p class="dash-panel__sub">Últimas facturas emitidas</p>
          </div>
          <router-link to="/cfdi/ingresos" class="dash-link-more">
            Ver todas <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i>
          </router-link>
        </div>
        <div style="overflow:auto;">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th style="text-align:right;">Total</th>
                <th style="text-align:center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in recentInvoices" :key="inv.id" class="dash-table-row">
                <td class="font-mono" style="font-size:11px;font-weight:700;color:var(--app-primary);">
                  {{ inv.serie }}-{{ inv.folio }}
                </td>
                <td style="font-weight:600;color:var(--app-text-primary);">{{ inv.clientName }}</td>
                <td style="color:var(--app-text-muted);font-size:11px;">{{ formatDate(inv.date) }}</td>
                <td style="text-align:right;font-weight:700;font-family:var(--app-font-mono);color:var(--app-text-primary);">
                  {{ formatCurrency(inv.total, inv.currency) }}
                </td>
                <td style="text-align:center;">
                  <span class="status-pill" :class="inv.status === 'Vigente' ? 'is-success' : 'is-danger'">
                    {{ inv.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="!recentInvoices.length">
                <td colspan="5" style="padding:32px;text-align:center;color:var(--app-text-muted);font-size:12px;">Sin facturas recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right column: Modules + Activity Feed -->
      <div style="display:flex;flex-direction:column;gap:16px;">

        <!-- Quick Access Modules -->
        <div class="dash-panel">
          <div class="dash-panel__head" style="margin-bottom:12px;">
            <h3 class="dash-panel__title">Módulos Rápidos</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px 20px;">
            <router-link v-for="mod in quickModules" :key="mod.path" :to="mod.path" class="mod-tile">
              <div class="mod-tile__icon" :style="`background:${mod.bg};color:${mod.color};`">
                <i :class="mod.icon"></i>
              </div>
              <span class="mod-tile__label">{{ mod.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- Activity feed -->
        <div class="dash-panel">
          <div class="dash-panel__head" style="margin-bottom:14px;">
            <h3 class="dash-panel__title">Línea de Tiempo</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:0;padding-bottom:10px;">
            <div v-for="(act, idx) in activity" :key="act.id" class="activity-item" :class="{ 'is-last': idx === activity.length - 1 }">
              <div class="activity-dot"></div>
              <div class="activity-body">
                <p class="activity-text">{{ act.text }}</p>
                <p class="activity-time">{{ act.time }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
const { computed } = Vue;

export default {
  name: 'Dashboard',
  props: {
    state: { type: Object, default: null }
  },
  setup(props) {
    const fallbackState = window.fiax?.state?.ensureState?.() || {};
    const st = computed(() => props.state || fallbackState);

    const kpis = computed(() => {
      const stats = st.value?.data?.dashboard?.stats || {};
      return [
        {
          id: 'invoiced', icon: 'fa-solid fa-file-invoice-dollar',
          label: 'Total Facturado', color: '#3b82f6', glow: 'rgba(59,130,246,0.15)',
          value: formatCurrency(stats.totalInvoiced, 'USD'), change: '+12.4%', positive: true,
        },
        {
          id: 'clients', icon: 'fa-solid fa-users',
          label: 'Clientes Activos', color: '#10b981', glow: 'rgba(16,185,129,0.15)',
          value: stats.activeClients || 0, change: '+3 nuevos', positive: true,
        },
        {
          id: 'pending', icon: 'fa-solid fa-clock-rotate-left',
          label: 'Por Cobrar', color: '#f59e0b', glow: 'rgba(245,158,11,0.15)',
          value: formatCurrency(stats.pendingPayments, 'MXN'), change: '4 facturas', positive: false,
        },
        {
          id: 'growth', icon: 'fa-solid fa-arrow-trend-up',
          label: 'Crecimiento', color: '#818cf8', glow: 'rgba(129,140,248,0.15)',
          value: `${stats.growth || 0}%`, change: 'vs ayer', positive: true,
        },
      ];
    });

    const recentInvoices = computed(() => {
      return (st.value?.data?.invoices || []).slice(0, 5);
    });

    const activity = computed(() => {
      return st.value?.data?.dashboard?.recentActivity || [];
    });

    const quickModules = [
      { label: 'Ingresos',  path: '/cfdi/ingresos', icon: 'fa-solid fa-file-invoice',      bg: 'rgba(59,130,246,0.10)',  color: '#3b82f6' },
      { label: 'Egresos',   path: '/cfdi/egresos',  icon: 'fa-solid fa-receipt',           bg: 'rgba(239,68,68,0.10)',   color: '#ef4444' },
      { label: 'Clientes',  path: '/clients',        icon: 'fa-solid fa-users',             bg: 'rgba(16,185,129,0.10)', color: '#10b981' },
      { label: 'Productos', path: '/products',       icon: 'fa-solid fa-box',               bg: 'rgba(129,140,248,0.10)',color: '#818cf8' },
      { label: 'Traslados', path: '/cfdi/traslado', icon: 'fa-solid fa-truck-fast',        bg: 'rgba(245,158,11,0.10)', color: '#f59e0b' },
      { label: 'Nómina',    path: '/cfdi/nomina',   icon: 'fa-solid fa-wallet',            bg: 'rgba(20,184,166,0.10)', color: '#14b8a6' },
    ];

    function formatCurrency(val, curr) {
      if (val == null) return '—';
      const c = curr || 'MXN';
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(val);
    }

    function formatDate(val) {
      if (!val) return '—';
      return new Date(val).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return { kpis, recentInvoices, activity, quickModules, formatCurrency, formatDate };
  }
}
</script>

<style scoped>
/* KPI cards */
.kpi-card {
  position: relative;
  overflow: hidden;
  background: var(--app-bg-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  gap: 4px 16px;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: var(--app-shadow-sm);
}
[data-theme="light"] .kpi-card { background: #fff; }

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: var(--kpi-color, #3b82f6);
  box-shadow: var(--app-shadow-lg);
}

.kpi-card__icon {
  grid-row: 1 / 3;
  align-self: center;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: var(--app-bg-hover);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  color: var(--kpi-color, #3b82f6);
}

.kpi-card__label { font-size: 11px; font-weight: 700; color: var(--app-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.kpi-card__value { font-size: 24px; font-weight: 900; color: var(--app-text-primary); letter-spacing: -0.04em; font-family: var(--app-font-mono); }
.kpi-card__trend { grid-column: 2; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.kpi-card__trend.is-up  { color: var(--app-success); }
.kpi-card__trend.is-down { color: var(--app-warning); }

.kpi-card__glow-orb {
  position: absolute; right: -25px; bottom: -25px;
  width: 100px; height: 100px;
  border-radius: 50%;
  background: var(--kpi-glow, rgba(59,130,246,0.2));
  filter: blur(40px);
  pointer-events: none;
  opacity: 0.6;
}

/* Dash panels */
.dash-panel {
  background: var(--app-bg-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-xl);
  box-shadow: var(--app-shadow-md);
  transition: all 0.3s ease;
}
[data-theme="light"] .dash-panel { background: #fff; }

.dash-panel__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--app-border);
}
.dash-panel__title { font-size: 15px; font-weight: 900; color: var(--app-text-primary); letter-spacing: -0.01em; }
.dash-panel__sub   { font-size: 12px; color: var(--app-text-muted); margin-top: 2px; }

.dash-table { width: 100%; border-collapse: collapse; }
.dash-table th { 
  text-align: left; padding: 12px 24px; color: var(--app-text-muted); 
  font-weight: 800; font-size: 10px; text-transform: uppercase; 
  letter-spacing: 0.1em; border-bottom: 1px solid var(--app-border); 
}
.dash-table-row:hover { background: var(--app-bg-hover); }

.dash-link-more {
    font-size: 12px; font-weight: 700; color: var(--app-primary);
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; transition: all 0.2s ease;
}
.dash-link-more:hover { color: var(--app-primary-hover); transform: translateX(2px); }

/* Module tiles */
.mod-tile {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 16px 12px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-bg-hover);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  cursor: pointer;
}
[data-theme="light"] .mod-tile { background: #fff; border-color: rgba(0,0,0,0.05); }

.mod-tile:hover { 
    background: var(--app-bg-surface); 
    border-color: var(--app-primary); 
    transform: translateY(-2px); 
    box-shadow: var(--app-shadow-sm);
}
.mod-tile__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.mod-tile__label { font-size: 12px; font-weight: 700; color: var(--app-text-secondary); text-align: center; }

/* Activity feed */
.activity-item { display: flex; position: relative; padding: 0 24px; min-height: 60px; }
.activity-item:not(.is-last)::before {
  content: ''; position: absolute; left: 29px; top: 22px; bottom: 0;
  width: 1px; background: var(--app-border);
}
.activity-dot {
  flex-shrink: 0; width: 12px; height: 12px; border-radius: 50%;
  background: var(--app-primary-glow);
  border: 2px solid var(--app-primary);
  margin-top: 8px;
  z-index: 2;
}
.activity-body { padding: 4px 0 20px 16px; flex: 1; }
.activity-text { font-size: 13px; font-weight: 600; color: var(--app-text-primary); line-height: 1.4; }
.activity-time { font-size: 11px; color: var(--app-text-muted); margin-top: 4px; }

@media (max-width: 1100px) {
    .dash-layout-grid { grid-template-columns: 1fr !important; }
}
</style>
