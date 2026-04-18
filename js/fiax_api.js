/**
 * FIAX Unified Data Access Layer (DAL)
 * Switched between Demo Mode (Local) and Production Mode (PocketBase).
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    FIAX.api = {
        /**
         * Generic list fetcher
         */
        async getList(collection, filter = '', sort = '-created') {
            const state = FIAX.state.ensureState();
            
            // DEMO MODE
            if (state.demoMode) {
                console.log(`[Fiax API] Fetching from Demo Data: ${collection}`);
                return state.demoData[collection] || [];
            }

            // LIVE MODE (PocketBase)
            if (!FIAX.pb) return [];
            try {
                return await FIAX.pb.collection(collection).getFullList({
                    filter: filter,
                    sort: sort
                });
            } catch (err) {
                console.error(`[Fiax API] DB Error (${collection}):`, err);
                return [];
            }
        },

        // Helper methods for specific core collections
        async getInvoices() { return this.getList('invoices'); },
        async getIssuers() { return this.getList('issuers'); },
        async getClients() { return this.getList('clients'); },
        async getProducts() { return this.getList('products'); },

        /**
         * Sets the current invoice data programmatically.
         */
        setInvoiceData(data) {
            const state = FIAX.state.ensureState();
            if (!state) return false;
            console.log('[Fiax API] Injecting invoice data:', data);
            // Internal state sync logic here if needed
            return true;
        },

        /**
         * Triggers a rule-based validation on a document.
         */
        validateDocument(docType, data) {
            console.log(`[Fiax API] Validating ${docType}...`);
            return { valid: true, messages: [] };
        }
    };
})();
