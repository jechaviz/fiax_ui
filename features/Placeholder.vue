
<template>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:500px;text-align:center;gap:20px;" class="app-animate-in">
    <!-- Icon -->
    <div :style="`width:64px;height:64px;border-radius:18px;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:26px;color:${iconColor};box-shadow:0 8px 32px ${iconGlow};`">
      <i :class="icon"></i>
    </div>

    <!-- Text -->
    <div>
      <h2 style="font-size:22px;font-weight:900;color:#fff;margin-bottom:8px;letter-spacing:-0.03em;">
        {{ title }}
      </h2>
      <p style="font-size:13px;color:var(--app-text-secondary);max-width:340px;line-height:1.6;">
        {{ description }}
      </p>
    </div>

    <!-- CTA -->
    <button
      style="margin-top:8px;height:38px;padding:0 22px;border-radius:10px;background:var(--app-primary);border:none;color:#fff;font-size:13px;font-weight:700;font-family:var(--app-font-main);cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s ease;box-shadow:0 4px 16px rgba(59,130,246,0.3);"
      onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(59,130,246,0.4)'"
      onmouseleave="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(59,130,246,0.3)'"
    >
      <i class="fa-solid fa-bell"></i>
      Avisar cuando esté listo
    </button>

    <!-- Badge -->
    <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;color:var(--app-text-muted);text-transform:uppercase;">
      En desarrollo — Próximamente
    </div>
  </div>
</template>

<script>
export default {
  name: 'Placeholder',
  props: {
    state: { type: Object, default: null },
    moduleKey: { type: String, default: '' }
  },
  setup(props) {
    const moduleConfigs = {
      nomina:    { title: 'Nómina',             icon: 'fa-solid fa-wallet',          color: '#14b8a6', description: 'Gestiona el timbrado de nómina ordinaria y extraordinaria con validación SAT en tiempo real.' },
      gastos:    { title: 'Gastos',             icon: 'fa-solid fa-receipt',         color: '#f59e0b', description: 'Registra y controla los gastos de tu operación con clasificación automática.' },
      gigs:      { title: 'Gigs / Proyectos',   icon: 'fa-solid fa-briefcase',       color: '#818cf8', description: 'Administra proyectos freelance, presupuestos y entregas con tu equipo.' },
      pagos:     { title: 'Complemento Pagos',  icon: 'fa-solid fa-money-bill-wave', color: '#10b981', description: 'Emite complementos de pago CFDI 4.0 para registrar cobros parciales o totales.' },
      employees: { title: 'Empleados',          icon: 'fa-solid fa-users-gear',      color: '#3b82f6', description: 'Directorio de empleados, puestos y configuración de esquema de nómina.' },
      issuers:   { title: 'Emisores',           icon: 'fa-solid fa-building-columns',color: '#e879f9', description: 'Configura tus razones sociales, sellos digitales y sucursales de emisión.' },
    };

    const route = window.location?.pathname?.split('/').pop() || '';
    const key = props.moduleKey || route;
    const cfg = moduleConfigs[key] || { title: 'Módulo en construcción', icon: 'fa-solid fa-tools', color: '#94a3b8', description: 'Este módulo está siendo desarrollado y pronto estará disponible.' };

    return {
      title: cfg.title,
      description: cfg.description,
      icon: cfg.icon,
      iconColor: cfg.color,
      iconBg: `${cfg.color}18`,
      iconGlow: `${cfg.color}40`,
    };
  }
}
</script>
