
// Fiax Navigation Configuration - Ported from facturamx-saas/App.tsx
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.config = {
        navigation: [
            // ── Overview ────────────────────────────────────────
            { id: 'sec-overview', type: 'section', label: 'Overview' },
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house-chimney', path: '/' },

            // ── Facturación ──────────────────────────────────────
            { id: 'sec-billing', type: 'section', label: 'Facturación' },
            { 
                id: 'billing', 
                label: 'CFDI', 
                icon: 'fa-solid fa-file-invoice-dollar',
                children: [
                    { id: 'ingresos',  label: 'Ingresos',     path: '/cfdi/ingresos' },
                    { id: 'egresos',   label: 'Egresos',       path: '/cfdi/egresos' },
                    { id: 'traslados', label: 'Traslados',     path: '/cfdi/traslado' },
                    { id: 'pagos',     label: 'Pagos (REP)',   path: '/cfdi/pagos' },
                    { id: 'nomina',    label: 'Nómina CFDI',   path: '/cfdi/nomina' },
                ]
            },

            // ── Ventas (CRM) ──────────────────────────────────────
            { id: 'sec-sales', type: 'section', label: 'Ventas y CRM' },
            { id: 'leads',     label: 'Prospectos', icon: 'fa-solid fa-layer-group', path: '/leads' },
            { id: 'estimates', label: 'Cotizaciones', icon: 'fa-solid fa-file-signature', path: '/estimates' },

            // ── Operaciones ──────────────────────────────────────
            { id: 'sec-ops', type: 'section', label: 'Operación' },
            { id: 'projects',  label: 'Proyectos',   icon: 'fa-solid fa-kanban', path: '/projects' },
            { id: 'contracts', label: 'Contratos',   icon: 'fa-solid fa-file-contract', path: '/contracts' },

            // ── Finanzas ──────────────────────────────────────
            { id: 'sec-finance', type: 'section', label: 'Finanzas' },
            { id: 'expenses', label: 'Gastos', icon: 'fa-solid fa-receipt', path: '/expenses' },
            { id: 'transactions', label: 'Bancos', icon: 'fa-solid fa-university', path: '/transactions' },

            // ── Catálogos ────────────────────────────────────────
            { id: 'sec-catalogs', type: 'section', label: 'Catálogos' },
            { 
                id: 'catalogs', 
                label: 'Directorio', 
                icon: 'fa-solid fa-address-book',
                children: [
                    { id: 'clients',   label: 'Clientes',      path: '/clients' },
                    { id: 'products',  label: 'Productos',     path: '/products' },
                    { id: 'employees', label: 'Empleados',     path: '/employees' },
                ]
            },

            // ── Admin ────────────────────────────────────────────
            { id: 'sec-admin', type: 'section', label: 'Administración' },
            { id: 'settings', label: 'Emisores', icon: 'fa-solid fa-building-columns', path: '/admin/issuers' },
        ]
    };
})();
