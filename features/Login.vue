<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
    <!-- Animated background patterns -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md p-10 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6">
          <i class="fa-solid fa-file-invoice text-white text-3xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight mb-2 uppercase">Fiax <span class="text-primary">Live</span></h1>
        <p class="text-slate-400 text-sm font-medium">Ingresa tus credenciales de producción</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Email corporativo</label>
          <div class="relative group">
            <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input 
              v-model="email"
              type="email" 
              required
              placeholder="ejemplo@fiax.mx"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Contraseña</label>
          <div class="relative group">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input 
              v-model="password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="relative w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
             <i class="fa-solid fa-circle-notch animate-spin"></i> Autenticando...
          </span>
          <span v-else>Iniciar Sesión</span>
        </button>

        <!-- Mode Indicator / Back to Demo -->
        <div class="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
           <button
             type="button"
             @click="toggleDemo"
             class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
           >
             <i class="fa-solid fa-flask"></i> Modo Demo
           </button>
           <button
             type="button"
             @click="goRegister"
             class="text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors flex items-center gap-2"
           >
             <i class="fa-solid fa-user-plus"></i> Crear cuenta
           </button>
        </div>
      </form>

      <div v-if="error" class="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-shake">
        {{ error }}
      </div>
    </div>

    <!-- Footer Branding -->
    <div class="absolute bottom-10 text-center">
      <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Powered by Advanced Invoicing Engine v4.0</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const email = Vue.ref('');
    const password = Vue.ref('');
    const loading = Vue.ref(false);
    const error = Vue.ref(null);

    const handleLogin = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await window.fiax.auth.login(email.value, password.value);
            if (res.success) {
                // State is updated globally, we just route to dashboard
                window.location.hash = '/dashboard';
                window.location.reload(); // Refresh to hydrate PB data
            } else {
                error.value = "Credenciales inválidas. Verifica tu acceso.";
            }
        } finally {
            loading.value = false;
        }
    };

    const router = VueRouter.useRouter();
    const toggleDemo = () => { props.state.toggleDemoMode(); };
    const goRegister = () => router.push('/register');

    return { email, password, loading, error, handleLogin, toggleDemo, goRegister };
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake { animation: shake 0.4s ease-in-out infinite alternate; }
</style>
