
// Fiax AI Service - Minimal Browser implementation of geminiService.ts
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    const AI = FIAX.ai || (FIAX.ai = {});

    const legacyKey = localStorage.getItem('fiax-ai-key');
    if (legacyKey) localStorage.removeItem('fiax-ai-key');

    // Keep user-provided AI keys only for the browser session.
    let apiKey = sessionStorage.getItem('fiax-ai-key') || legacyKey || '';

    AI.setApiKey = (key) => {
        apiKey = key;
        if (key) sessionStorage.setItem('fiax-ai-key', key);
        else sessionStorage.removeItem('fiax-ai-key');
    };

    AI.hasKey = () => !!apiKey;

    AI.callGemini = async (prompt, systemInstruction = '', schema = null) => {
        if (!apiKey) throw new Error("API Key for Gemini missing.");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        if (schema) {
            payload.generationConfig.responseMimeType = "application/json";
            // Note: Schema mapping might be needed if using specific GenAI schema format
        }

        if (systemInstruction) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "AI Call Failed");
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        return schema ? JSON.parse(text) : text;
    };

    // Ported from geminiService.ts
    AI.suggestCfdiCodes = async (description) => {
        const prompt = `Analiza la siguiente descripción de concepto de factura y sugiere: 
        1. ClaveProdServ (8 dígitos)
        2. ClaveUnidad (ej. E48, H87)
        3. ObjetoImp (01, 02, 03)
        
        Descripción: "${description}"
        Responde estrictamente en formato JSON.`;

        const schema = {
            productCode: "string",
            unitCode: "string",
            objetoImp: "string"
        };

        return await AI.callGemini(prompt, "Eres un experto fiscal mexicano en CFDI 4.0.", schema);
    };

    AI.generateDashboardPlan = async (userPrompt, availableData) => {
        const prompt = `El usuario quiere un widget para su dashboard: "${userPrompt}".
        Datos disponibles: ${JSON.stringify(availableData)}
        Crea un plan JSON que incluya: title, type (bar, pie, summary), dataKey, xAxis, yAxis, aggregation.`;

        return await AI.callGemini(prompt, "Eres un experto en visualización de datos de negocio.", true);
    };
})();
