/**
 * PocketBase Client Initialization for FIAX
 * When odoo_mode is true, uses the Fiax proxy (/fiax/api/*) instead of PocketBase.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    // ── Odoo mode auth ────────────────────────────────────────────────────────
    if (FIAX.config?.odoo_mode) {
        const _CREDS_KEY = 'fiax_creds';

        function _saveCreds(email, password) {
            try { localStorage.setItem(_CREDS_KEY, btoa(JSON.stringify({ e: email, p: password }))); }
            catch (_) {}
        }
        function _loadCreds() {
            try { return JSON.parse(atob(localStorage.getItem(_CREDS_KEY) || '')); }
            catch (_) { return null; }
        }

        async function _doLogin(email, password) {
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
        }

        FIAX.auth = {
            async login(email, password) {
                try {
                    const result = await _doLogin(email, password);
                    if (result.success) _saveCreds(email, password);
                    return result;
                } catch (err) {
                    return { success: false, error: err?.message || 'Error de conexión.' };
                }
            },

            // Silent token renewal using stored credentials — called automatically on 401
            async silentRefresh() {
                const creds = _loadCreds();
                if (!creds?.e || !creds?.p) return false;
                try {
                    const result = await _doLogin(creds.e, creds.p);
                    return result.success;
                } catch (_) {
                    return false;
                }
            },

            logout() {
                localStorage.removeItem('fiax_token');
                localStorage.removeItem('fiax_user');
                localStorage.removeItem(_CREDS_KEY);
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
