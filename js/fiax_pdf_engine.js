/**
 * FIAX High-Fidelity PDF Engine
 * Converts UDTS assembled templates into premium PDF documents.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    FIAX.pdf = {
        /**
         * Generates a PDF from a target HTML element.
         * @param {HTMLElement} element - The root element of the template to capture.
         * @param {Object} options - Custom overrides for the export.
         */
        async generate(element, filename = 'CFDI_Document.pdf') {
            if (!window.html2pdf) {
                console.error('[Fiax PDF] html2pdf library not loaded.');
                return;
            }

            // Read specific PDF rules from the engine
            const pdfRules = FIAX.rules?.resolve('pdf_config', {
                margin: [10, 10, 10, 10],
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter',
                precision: 2 // High Density
            }).value;

            console.log('[Fiax PDF] Using rules:', pdfRules);

            const opt = {
                margin: pdfRules.margin,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: pdfRules.precision || 2, 
                    useCORS: true,
                    letterRendering: true,
                    dpi: 192,
                    backgroundColor: '#ffffff',
                    // Force logging to debug if needed
                    logging: false
                },
                jsPDF: { 
                    unit: pdfRules.unit, 
                    format: pdfRules.format, 
                    orientation: pdfRules.orientation 
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
                // Pre-process element: Force white background and light-theme text for print
                // We create a temporary non-displayed wrapper to ensure "Light Theme" context
                const wrapper = document.createElement('div');
                wrapper.id = 'fiax-pdf-capture-wrapper';
                wrapper.style.position = 'absolute';
                wrapper.style.left = '-9999px';
                wrapper.style.top = '-9999px';
                wrapper.setAttribute('data-theme', 'light');
                wrapper.classList.add('light', 'theme-light'); 
                
                const clone = element.cloneNode(true);
                clone.style.background = '#ffffff';
                clone.style.width = '1000px'; // Standardize width for capture resolution
                clone.classList.add('fiax-pdf-export-mode');

                // Strip all 'dark:' classes from the clone to aggressively force Light Theme
                // This prevents Tailwind's .dark ancestor from triggering dark styles on the clone
                [clone, ...clone.querySelectorAll('*')].forEach(el => {
                    if (el.classList) {
                        const darkClasses = Array.from(el.classList).filter(c => c.startsWith('dark:'));
                        if (darkClasses.length > 0) {
                            el.classList.remove(...darkClasses);
                        }
                    }
                });

                wrapper.appendChild(clone);
                document.body.appendChild(wrapper);

                // Wait for any images or renders to stabilize (simulated)
                await new Promise(r => setTimeout(r, 300));

                // Generate PDF from the CLONE which is forced to light mode
                const result = await html2pdf().set(opt).from(clone).save();
                
                // Cleanup
                document.body.removeChild(wrapper);
                return result;
            } catch (err) {
                console.error('[Fiax PDF] Failed to generate:', err);
            }
        }
    };
})();
