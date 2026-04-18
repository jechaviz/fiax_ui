
// Fiax State Management - Ported from facturamx-saas/context and store
(() => {
    const { reactive, watch, computed } = Vue;
    const FIAX = window.fiax || (window.fiax = {});
    
    let vueState = null;

    FIAX.state = {
        ensureState() {
            if (vueState) return vueState;

            const DEFAULT_SCHEMA = { 
                _v: '1.0', 
                users: [], issuers: [], invoices: [], products: [], 
                paymentReceipts: [], payrollReceipts: [],
                dashboard: { stats: {}, recentActivity: [] } 
            };
            const DATA = { ...DEFAULT_SCHEMA, ...(FIAX.demo_data || {}) };
            const I18N = FIAX.i18n?.es || {};
            const PB = FIAX.pb;

            // Load saved demo mode or default to true
            const savedDemoMode = localStorage.getItem('fiax_demo_mode') !== 'false';
            // Load saved demo data or default from file
            let demoData = DATA;
            try {
                const saved = localStorage.getItem('fiax_demo_data');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Reset if version mismatch
                    if (parsed._v === DATA._v) demoData = parsed;
                }
            } catch (e) { console.error('[Fiax State] demoData parse error', e); }

            vueState = reactive({
                // Environment
                demoMode: savedDemoMode,
                demoData: demoData,
                
                // Core Data
                pb: PB,
                user: null, // Populated below
                get data() { return this.demoMode ? this.demoData : { issuers: [], invoices: [], products: [] }; },
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
                currentIssuer: null,
                activeRules: computed(() => FIAX.rules?._state.activeRules),
                rulesLoading: computed(() => FIAX.rules?._state.loading),
                
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

                async switchIssuer(id) {
                    const issuer = this.data.issuers.find(i => i.id === id);
                    if (issuer) {
                        this.currentIssuer = issuer;
                        // Synchronize Rules for this issuer
                        if (FIAX.rules && issuer.rfc) {
                            await FIAX.rules.sync(issuer.rfc);
                        }
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

                toggleDemoMode() {
                    this.demoMode = !this.demoMode;
                    localStorage.setItem('fiax_demo_mode', this.demoMode);
                    window.location.reload(); // Force full app re-hydration
                },

                resetDemoData() {
                    this.demoData = FIAX.demo_data;
                    localStorage.setItem('fiax_demo_data', JSON.stringify(FIAX.demo_data));
                    if (this.demoMode) window.location.reload();
                }
            });

            // Identity Resolver
            if (vueState.demoMode) {
                // In demo, we use a fixed virtual user from the demo data
                vueState.user = (vueState.demoData.users || []).find(u => u.type === 'Freelancer') 
                              || (vueState.demoData.users || [])[0];
            } else {
                // In production, we use the PB session
                vueState.user = FIAX.auth?.getCurrentUser();
            }

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

            // Initial Issuer Load
            const issuers = vueState.demoMode ? vueState.demoData.issuers : [];
            if (issuers?.[0]) {
                vueState.switchIssuer(issuers[0].id);
            }

            return vueState;
        }
    };
})();
