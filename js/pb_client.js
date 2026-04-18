/**
 * PocketBase Client Initialization for FIAX
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    // Check if PocketBase is loaded (from CDN)
    if (typeof PocketBase === 'undefined') {
        console.error('[Fiax] PocketBase library NOT loaded. Make sure the script is included in index.html.');
        return;
    }

    // Initialize PocketBase
    // Default to localhost:8090 if no URL provided in config
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
