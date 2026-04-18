/**
 * FIAX Admin Utility: Database Wipe
 * Purges all operational records from PocketBase for a fresh start.
 * Usage: Load in an admin context or run via Node/Deno.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    FIAX.admin = {
        async wipeDatabase() {
            if (!FIAX.pb) {
                console.error('[Fiax Admin] PocketBase client not found.');
                return;
            }

            if (!confirm('DANGER: This will delete ALL invoices, clients, and products from the LIVE database. Proceed?')) {
                return;
            }

            const collections = ['invoices', 'clients', 'products'];
            const pb = FIAX.pb;

            try {
                for (const col of collections) {
                    console.log(`[Fiax Admin] Wiping collection: ${col}...`);
                    const records = await pb.collection(col).getFullList({ requestKey: null });
                    
                    for (const record of records) {
                        await pb.collection(col).delete(record.id);
                    }
                    console.log(`[Fiax Admin] ${col} cleared.`);
                }
                alert('Database wiped successfully. Real data is now clean.');
                window.location.reload();
            } catch (err) {
                console.error('[Fiax Admin] Wipe failed:', err);
                alert('Fallo al limpiar la base de datos. Verifica permisos de admin.');
            }
        }
    };
})();
