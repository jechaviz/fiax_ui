/**
 * FIAX Auth Layer
 * Odoo mode  → POST /fiax/auth/login  (HttpOnly cookie + localStorage mirror)
 * Proxy mode → POST /fiax/api/auth/login  (JWT in localStorage)
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    function isOdoo() {
        return !!(window.__FIAX_ODOO_MODE__ || FIAX.config?.odoo_mode);
    }

    function _store(user, company, token) {
        if (token) localStorage.setItem('fiax_token', token);
        if (user)    localStorage.setItem('fiax_user', JSON.stringify(user));
        if (company) localStorage.setItem('fiax_company', JSON.stringify(company));
    }

    function _clear() {
        localStorage.removeItem('fiax_token');
        localStorage.removeItem('fiax_user');
        localStorage.removeItem('fiax_company');
    }

    FIAX.auth = {

        async login(email, password, companyId) {
            if (isOdoo()) {
                const res = await fetch('/fiax/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password, company_id: companyId || undefined }),
                });
                const data = await res.json().catch(() => ({}));
                if (data.ok) {
                    _store(data.user, data.company, data.token);
                    return { success: true, user: data.user, company: data.company, companies: data.companies };
                }
                return { success: false, message: data.message || 'Credenciales inválidas.' };
            }
            // Proxy / local dev mode
            const res = await fetch('/fiax/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (data.ok && data.token) {
                _store(data.user, null, data.token);
                return { success: true };
            }
            return { success: false, message: data.message || 'Credenciales inválidas.' };
        },

        async logout() {
            if (isOdoo()) {
                await fetch('/fiax/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
            }
            _clear();
        },

        async silentRefresh() {
            if (!isOdoo()) return false;
            try {
                const res = await fetch('/fiax/auth/session', { credentials: 'include' });
                const data = await res.json().catch(() => ({}));
                if (data.ok) {
                    _store(data.user, data.company, data.token || null);
                    return true;
                }
            } catch {}
            return false;
        },

        getCurrentUser() {
            try { return JSON.parse(localStorage.getItem('fiax_user') || 'null'); } catch { return null; }
        },

        getCurrentCompany() {
            try { return JSON.parse(localStorage.getItem('fiax_company') || 'null'); } catch { return null; }
        },

        isAuthenticated() {
            return !!(this.getCurrentUser() || localStorage.getItem('fiax_token'));
        },

        getToken() {
            return localStorage.getItem('fiax_token');
        },
    };
})();
