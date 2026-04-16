
<template>
  <teleport to="body">
    <transition name="ai-slide">
      <div v-if="isOpen" class="ai-panel-overlay" @click.self="close">
        <div class="ai-panel">
          <!-- Header -->
          <div class="ai-panel-head">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="ai-panel-avatar">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div>
                <div style="font-size:13px;font-weight:800;color:#fff;">Fiax AI</div>
                <div style="font-size:10px;color:rgba(var(--app-primary-rgb),0.7);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Asistente Fiscal</div>
              </div>
              <div class="ai-live-dot"></div>
            </div>
            <button class="ai-close-btn" @click="close"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <!-- Messages -->
          <div class="ai-messages" ref="messagesEl">
            <!-- Welcome if no messages -->
            <div v-if="!messages.length" class="ai-welcome">
              <div class="ai-welcome-icon"><i class="fa-solid fa-sparkles"></i></div>
              <p style="font-weight:700;color:#fff;font-size:14px;margin-bottom:6px;">Hola, soy tu asistente fiscal.</p>
              <p style="font-size:12px;color:var(--app-text-secondary);line-height:1.6;">Puedo ayudarte a interpretar tus facturas, sugerir claves del SAT, o responder preguntas sobre CFDI 4.0.</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">
                <button v-for="s in suggestions" :key="s" class="ai-suggestion-chip" @click="sendMessage(s)">{{ s }}</button>
              </div>
            </div>

            <!-- Message bubbles -->
            <div v-for="msg in messages" :key="msg.id" :class="['ai-msg', msg.role]">
              <div v-if="msg.role === 'ai'" class="ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
              <div class="ai-msg-bubble">
                <div class="ai-msg-text" v-html="renderText(msg.content)"></div>
                <div class="ai-msg-time">{{ msg.time }}</div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="loading" class="ai-msg ai">
              <div class="ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
              <div class="ai-msg-bubble ai-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <!-- Composer -->
          <div class="ai-composer">
            <textarea
              v-model="draft"
              class="ai-textarea"
              placeholder="Pregunta algo sobre tus facturas o el SAT..."
              rows="1"
              @keydown.enter.exact.prevent="sendDraft"
              @input="autoResize"
              ref="textareaEl"
            ></textarea>
            <button class="ai-send-btn" :disabled="!draft.trim() || loading" @click="sendDraft">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>

          <div style="text-align:center;padding:6px 0;font-size:9px;color:var(--app-text-muted);letter-spacing:0.05em;border-top:1px solid rgba(255,255,255,0.04);">
            Impulsado por Gemini · Revisa los datos importantes con un contador
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
const { ref, reactive, nextTick } = Vue;

export default {
  name: 'AIChatPanel',
  props: {
    state: { type: Object, default: null }
  },
  setup(props) {
    const isOpen = ref(false);
    const draft = ref('');
    const loading = ref(false);
    const messages = reactive([]);
    const messagesEl = ref(null);
    const textareaEl = ref(null);
    let msgId = 1;

    const suggestions = [
      '¿Cuánto he facturado este mes?',
      '¿Cuál es la clave SAT para consultoría?',
      'Explícame CFDI 4.0',
      '¿Mis facturas están al corriente?',
    ];

    function open() { isOpen.value = true; }
    function close() { isOpen.value = false; }

    function renderText(text) {
      return String(text || '')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    function timestamp() {
      return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }

    async function sendMessage(text) {
      if (!text.trim() || loading.value) return;
      draft.value = '';

      messages.push({ id: msgId++, role: 'user', content: text, time: timestamp() });
      scrollToBottom();

      loading.value = true;
      try {
        const ai = window.fiax?.ai;
        if (!ai?.hasKey()) {
          // Demo mode — generic response
          await fakeSleep(900);
          const invoices = props.state?.data?.invoices || [];
          const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
          const demo = `**Modo demo activo** (configura tu API Key de Gemini para respuestas reales).\n\nEn tu cuenta hay **${invoices.length} facturas** con un total acumulado de **$${totalInvoiced.toLocaleString('es-MX')}**.`;
          messages.push({ id: msgId++, role: 'ai', content: demo, time: timestamp() });
        } else {
          const context = `El usuario tiene ${props.state?.data?.invoices?.length || 0} facturas en su cuenta. Usuario: ${props.state?.user?.name || 'usuario'}.`;
          const result = await ai.callGemini(
            `${text}\n\nContexto: ${context}`,
            'Eres Fiax AI, un asistente fiscal mexicano experto en CFDI 4.0. Responde en español, de forma concisa y práctica.'
          );
          messages.push({ id: msgId++, role: 'ai', content: result, time: timestamp() });
        }
      } catch (err) {
        messages.push({ id: msgId++, role: 'ai', content: `**Error:** ${err?.message || 'No se pudo conectar con la IA.'}`, time: timestamp() });
      } finally {
        loading.value = false;
        scrollToBottom();
      }
    }

    function sendDraft() {
      sendMessage(draft.value);
    }

    function fakeSleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    function scrollToBottom() {
      nextTick(() => {
        if (messagesEl.value) {
          messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
        }
      });
    }

    function autoResize(e) {
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    return { isOpen, draft, loading, messages, messagesEl, textareaEl, suggestions, open, close, renderText, sendMessage, sendDraft, autoResize };
  }
};
</script>

<style>
.ai-slide-enter-active, .ai-slide-leave-active { transition: opacity 0.2s ease; }
.ai-slide-enter-from, .ai-slide-leave-to { opacity: 0; }
.ai-slide-enter-active .ai-panel, .ai-slide-leave-active .ai-panel { transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.ai-slide-enter-from .ai-panel, .ai-slide-leave-to .ai-panel { transform: translateX(100%); }

.ai-panel-overlay {
  position: fixed; inset: 0; z-index: 8500;
  background: rgba(2, 6, 16, 0.4);
  display: flex; justify-content: flex-end;
}

.ai-panel {
  width: min(420px, 100vw);
  height: 100vh;
  display: flex; flex-direction: column;
  background: linear-gradient(180deg, rgba(8, 16, 32, 0.99) 0%, rgba(4, 10, 20, 0.99) 100%);
  border-left: 1px solid rgba(255,255,255,0.06);
  box-shadow: -24px 0 60px rgba(0,0,0,0.6);
}

.ai-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.ai-panel-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, rgba(59,130,246,0.4), rgba(129,140,248,0.4));
  border: 1px solid rgba(59,130,246,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; color: #93c5fd;
}

.ai-live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--app-primary);
  animation: app-pulse 2s infinite;
  margin-left: 4px;
}

.ai-close-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent; color: var(--app-text-muted);
  cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; font-size: 12px;
}
.ai-close-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }

.ai-messages {
  flex: 1; overflow-y: auto; padding: 20px 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.ai-messages::-webkit-scrollbar { width: 4px; }
.ai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }

.ai-welcome { text-align: center; padding: 20px 10px; }
.ai-welcome-icon { font-size: 32px; color: var(--app-primary); margin-bottom: 14px; filter: drop-shadow(0 0 16px rgba(59,130,246,0.5)); }

.ai-suggestion-chip {
  padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700;
  background: rgba(var(--app-primary-rgb),0.1); border: 1px solid rgba(var(--app-primary-rgb),0.2);
  color: rgba(var(--app-primary-rgb),0.9); cursor: pointer; transition: all 0.15s ease;
  font-family: var(--app-font-main);
}
.ai-suggestion-chip:hover { background: rgba(var(--app-primary-rgb),0.18); border-color: rgba(var(--app-primary-rgb),0.4); }

.ai-msg { display: flex; align-items: flex-end; gap: 8px; }
.ai-msg.user { flex-direction: row-reverse; }

.ai-msg-avatar {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(var(--app-primary-rgb),0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: var(--app-primary);
}

.ai-msg-bubble {
  max-width: 80%; padding: 10px 14px; border-radius: 14px;
}
.ai-msg.ai .ai-msg-bubble {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
  border-bottom-left-radius: 4px;
}
.ai-msg.user .ai-msg-bubble {
  background: rgba(var(--app-primary-rgb), 0.18); border: 1px solid rgba(var(--app-primary-rgb), 0.25);
  border-bottom-right-radius: 4px;
}

.ai-msg-text { font-size: 12px; color: var(--app-text-primary); line-height: 1.6; }
.ai-msg-time { font-size: 9px; color: var(--app-text-muted); margin-top: 4px; text-align: right; }

/* Typing dots */
.ai-typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.ai-typing span {
  width: 6px; height: 6px; border-radius: 50%; background: var(--app-primary); opacity: 0.5;
  animation: ai-blink 1.2s infinite ease-in-out;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ai-blink { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.9); } 40% { opacity: 1; transform: scale(1.15); } }

.ai-composer {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.ai-textarea {
  flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; color: #f0f6ff; font-size: 13px; line-height: 1.5;
  padding: 10px 14px; resize: none; outline: none; font-family: var(--app-font-main);
  min-height: 42px; max-height: 120px;
  transition: border-color 0.15s ease;
}
.ai-textarea:focus { border-color: rgba(var(--app-primary-rgb),0.4); }
.ai-textarea::placeholder { color: var(--app-text-muted); }

.ai-send-btn {
  width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px;
  background: var(--app-primary); border: none; color: #fff; font-size: 14px;
  cursor: pointer; transition: all 0.18s ease; display: flex; align-items: center; justify-content: center;
}
.ai-send-btn:hover:not(:disabled) { background: var(--app-primary-hover); transform: scale(1.05); }
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
