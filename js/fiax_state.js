
// Fiax State Management - Ported from facturamx-saas/context and store
(() => {
    const { reactive, watch } = Vue;
    const FIAX = window.fiax || (window.fiax = {});
    
    let vueState = null;

    FIAX.state = {
        ensureState() {
            if (vueState) return vueState;

            const DATA = FIAX.demo_data || { users: [], invoices: [], products: [], dashboard: { stats: {}, recentActivity: [], widgets: [] } };
            const I18N = FIAX.i18n?.es || {};

            vueState = reactive({
                // Core Data
                user: (DATA.users || []).find(u => u.type !== 'Client') || DATA.users?.[0] || { name: 'Admin', rfc: 'FIAX123456XXX' }, 
                data: DATA,
                i18n: I18N,
                constants: FIAX.constants || {},
                config: FIAX.config || { navigation: [] },
                
                // UI State
                sidebarCollapsed: false,
                activeSurface: 'dashboard',
                activeTheme: 'dark', // Default
                notifications: [],
                loading: false,
                
                // Session
                currentIssuer: DATA.issuers?.[0] || null,
                
                // Helpers
                t(key) {
                    const keys = key.split('.');
                    let result = this.i18n;
                    for (const k of keys) {
                        result = result?.[k];
                        if (!result) break;
                    }
                    return result || key;
                },
                
                formatCurrency(value, currency = 'USD') {
                    return new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: currency,
                    }).format(value);
                },

                formatDate(dateStr) {
                    if (!dateStr) return '';
                    return new Intl.DateTimeFormat('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }).format(new Date(dateStr));
                },

                // Issuer Actions
                saveIssuer(issuer) {
                    const idx = this.data.issuers.findIndex(i => i.id === issuer.id);
                    if (idx !== -1) {
                        this.data.issuers[idx] = { ...this.data.issuers[idx], ...issuer };
                    } else {
                        this.data.issuers.push({ ...issuer });
                    }
                    if (this.currentIssuer?.id === issuer.id) {
                        this.currentIssuer = { ...this.data.issuers[idx] || issuer };
                    }
                },

                switchIssuer(id) {
                    const issuer = this.data.issuers.find(i => i.id === id);
                    if (issuer) {
                        this.currentIssuer = issuer;
                    }
                },

                setTheme(theme) {
                    this.activeTheme = theme;
                    document.documentElement.setAttribute('data-theme', theme);
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    localStorage.setItem('fiax-theme', theme);
                },

                toggleTheme() {
                    const newTheme = this.activeTheme === 'dark' ? 'light' : 'dark';
                    this.setTheme(newTheme);
                }
            });

            // Persist sidebar state
            const savedSidebar = localStorage.getItem('fiax-sidebar-collapsed');
            if (savedSidebar) vueState.sidebarCollapsed = savedSidebar === 'true';

            // Initial Theme Logic
            const savedTheme = localStorage.getItem('fiax-theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const initialTheme = savedTheme || systemTheme;
            vueState.activeTheme = initialTheme;
            document.documentElement.setAttribute('data-theme', initialTheme);
            if (initialTheme === 'dark') document.documentElement.classList.add('dark');

            watch(() => vueState.sidebarCollapsed, (val) => {
                localStorage.setItem('fiax-sidebar-collapsed', val);
            });

            return vueState;
        }
    };
})();
