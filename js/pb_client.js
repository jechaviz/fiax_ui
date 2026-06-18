/**
 * PocketBase Client Initialization for FIAX
 * When odoo_mode is true, uses the Fiax proxy (/fiax/api/*) instead of PocketBase.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    // ── Odoo mode auth ────────────────────────────────────────────────────────
    if (FIAX.config?.odoo_mode) {
        FIAX.auth = {
            async login(email, password) {
                try {
                    const res = await fetch('/fiax/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await res.json();
                    if (data.ok) {
                        localStorage.setItem('fiax_token', data.token);
                        localStorage.setItem('fiax_user', JSON.stringify(data.user));
                        return { success: true, user: data.user };
                    }
                    return { success: false, error: data.message || 'Credenciales inválidas.' };
                } catch (err) {
                    return { success: false, error: err?.message || 'Error de conexión.' };
                }
            },
            logout() {
                localStorage.removeItem('fiax_token');
                localStorage.removeItem('fiax_user');
                localStorage.setItem('fiax_demo_mode', 'true');
                window.location.reload();
            },
            isAuthenticated() {
                return !!localStorage.getItem('fiax_token');
            },
            getCurrentUser() {
                try { return JSON.parse(localStorage.getItem('fiax_user') || 'null'); }
                catch { return null; }
            },
        };
        console.log('[Fiax] Auth: Odoo proxy mode');
        return;
    }

    // ── PocketBase mode ───────────────────────────────────────────────────────
    if (typeof PocketBase === 'undefined') {
        console.error('[Fiax] PocketBase library NOT loaded. Make sure the script is included in index.html.');
        return;
    }

    const pbUrl = FIAX.config?.pocketbase_url || 'http://127.0.0.1:8090';
    const pb = new PocketBase(pbUrl);

    // Attach to global FIAX object
    FIAX.pb = pb;

    console.log(`[Fiax] PocketBase initialized at ${pbUrl}`);

    /**
     * Helper for authentication
     */
    FIAX.auth = {
        async login(email, password) {
            try {
                const authData = await pb.collection('users').authWithPassword(email, password);
                console.log('[Fiax] Auth success:', pb.authStore.model);
                return { success: true, user: authData.record };
            } catch (err) {
                console.error('[Fiax] Auth error:', err);
                return { success: false, error: err.message };
            }
        },

        logout() {
            pb.authStore.clear();
            window.location.reload();
        },

        isAuthenticated() {
            return pb.authStore.isValid;
        },

        getCurrentUser() {
            return pb.authStore.model;
        }
    };
})();
