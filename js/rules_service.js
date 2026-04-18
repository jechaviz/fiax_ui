/**
 * Rules Service: Handles the loading and parsing of YAML rule files.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    FIAX.rulesService = {
        /**
         * Fetches a YAML file based on the RFC and returns a parsed object.
         * Default fallback to a basic rule set if the file is not found.
         */
        async loadRulesForRfc(rfc) {
            if (!rfc) return null;

            const url = `/rules/${rfc}.yml`;
            console.log(`[Fiax] Attempting to load rules from: ${url}`);

            try {
                const response = await fetch(url, { cache: 'no-store' });
                
                if (!response.ok) {
                    console.warn(`[Fiax] No specific rules found for RFC ${rfc} (Status: ${response.status})`);
                    return null;
                }

                const yamlText = await response.text();
                
                // Robustness check: Some servers return HTML (404 pages) with 200 OK
                if (yamlText.trim().startsWith('<!DOCTYPE') || yamlText.trim().startsWith('<html')) {
                    console.warn(`[Fiax] Ignored HTML response for rules of RFC ${rfc} (Likely a 404 error page).`);
                    return null;
                }

                // jsyaml is loaded in index.html
                const rules = jsyaml.load(yamlText);
                
                console.log(`[Fiax] Rules loaded successfully for ${rfc}`, rules);
                return rules;
            } catch (err) {
                console.error(`[Fiax] Failed to parse rules for ${rfc}:`, err);
                return null;
            }
        },

        /**
         * Simulates a list of available rules on the server (for UI selection/admin)
         */
        async listAvailableRuleFiles() {
            // In a real scenario, this would be an API call to the server
            // For now, we might return a list from constants or demo data
            return FIAX.demo_data?.availableRules || [];
        }
    };
})();
