/**
 * Rules Engine: The reactive bridge between loaded YAML and Vue components.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    const { reactive, computed } = Vue;

    // The internal reactive store for rules
    const rulesState = reactive({
        activeRules: null,
        rfc: null,
        loading: false
    });

    FIAX.rules = {
        /**
         * Initializes and loads rules for a specific RFC.
         */
        async sync(rfc) {
            if (rulesState.rfc === rfc) return;
            
            rulesState.loading = true;
            rulesState.rfc = rfc;
            
            try {
                const rules = await FIAX.rulesService.loadRulesForRfc(rfc);
                rulesState.activeRules = rules;
            } finally {
                rulesState.loading = false;
            }
        },

        /**
         * Hook for components to query rule-based visibility and labels.
         * Usage: const { isVisible, label } = FIAX.rules.resolve('form.line_items.column.lote')
         */
        resolve(path, defaultValue = null) {
            if (!rulesState.activeRules) {
                return {
                    rulesExist: false,
                    value: defaultValue,
                    visible: true,
                    label: null
                };
            }

            // Path translation logic (simple lodash-style get)
            const parts = path.split('.');
            let current = rulesState.activeRules;
            for (const part of parts) {
                current = current?.[part];
                if (current === undefined) break;
            }

            // Robust Resolution
            const result = current !== undefined ? current : defaultValue;
            
            // Handle primitives, nulls, and config objects
            const value = (result !== null && typeof result === 'object') 
                          ? (result.value ?? result) 
                          : result;
            
            return {
                rulesExist: true,
                value: value,
                visible: result?.visible !== false,
                label: result?.label || null,
                required: result?.required === true
            };
        },

        /**
         * Resolves a bilingual pattern "~Spanish~English~" based on current language.
         */
        resolvePattern(pattern) {
            if (typeof pattern !== 'string') return pattern;
            
            // Safe Language Resolver Hierarchy
            const activeLanguage = FIAX.state?.activeInvoice?.idioma 
                                || FIAX.state?.activeIssuer?.default_lang 
                                || 'es';

            const langIndex = activeLanguage === 'en' ? 2 : 1;

            return pattern.replace(/~(.+?)~(.+?)~/g, (match, es, en) => {
                return (langIndex === 1) ? es : en;
            });
        },

        /**
         * Resolves a constant from global rule maps.
         */
        getConstant(mapName, key) {
            const result = this.resolve(`global.maps.${mapName}.${key}`);
            if (result.rulesExist && result.value) {
                if (typeof result.value === 'object' && result.value !== null) {
                    const activeLanguage = FIAX.state?.activeInvoice?.idioma 
                                        || FIAX.state?.activeIssuer?.default_lang 
                                        || 'es';
                    return result.value[activeLanguage] || result.value['es'] || key;
                }
                return result.value;
            }
            return key;
        },

        enrich(data, hookName) {
            const hookRules = this.resolve(`logic_rules.${hookName}`, []);
            const rawRules = Array.isArray(hookRules.value) ? hookRules.value : [];
            
            return rawRules.filter(rule => {
                if (!rule.condition) return true;
                try {
                    const check = (condition, context) => {
                        const match = condition.match(/([a-zA-Z0-9_\.]+)\s*==\s*['"]([^'"]+)['"]/);
                        if (!match) return false;
                        const path = match[1];
                        const expected = match[2];
                        const actual = path.split('.').reduce((obj, key) => obj?.[key], context);
                        return actual === expected;
                    };
                    return check(rule.condition, data);
                } catch (e) {
                    return false;
                }
            });
        },

        _state: rulesState
    };

    FIAX.useRules = (basePath) => {
        return {
            get(subPath, defaultVal) {
                return computed(() => FIAX.rules.resolve(`${basePath}.${subPath}`, defaultVal));
            }
        };
    };
})();
