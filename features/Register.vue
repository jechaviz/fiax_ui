<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950 overflow-y-auto">
    <!-- Animated background -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="relative w-full max-w-lg my-8 p-10 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6">
          <i class="fa-solid fa-user-plus text-white text-2xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight mb-2 uppercase">Crear <span class="text-primary">Cuenta</span></h1>
        <p class="text-slate-400 text-sm font-medium">Configura tu acceso a Fiax en segundos</p>
      </div>

      <!-- Step indicators -->
      <div class="flex items-center justify-center gap-3 mb-10">
        <div v-for="s in 2" :key="s"
          class="flex items-center gap-3">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all',
            step >= s ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10 text-slate-500']">
            <i v-if="step > s" class="fa-solid fa-check text-xs"></i>
            <span v-else>{{ s }}</span>
          </div>
          <div v-if="s < 2" class="w-12 h-px" :class="step > s ? 'bg-primary' : 'bg-white/10'"></div>
        </div>
      </div>

      <!-- Step 1: Personal data -->
      <form v-if="step === 1" @submit.prevent="goStep2" class="space-y-5">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tus datos personales</p>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Nombre completo</label>
          <div class="relative group">
            <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input v-model="form.name" type="text" required placeholder="Juan Pérez López"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Correo electrónico</label>
          <div class="relative group">
            <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input v-model="form.email" type="email" required placeholder="juan@empresa.mx"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Contraseña</label>
          <div class="relative group">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" required placeholder="Mín. 8 caracteres"
              class="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" />
            <button type="button" @click="showPwd = !showPwd"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <i :class="showPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
          <p v-if="form.password && form.password.length < 8" class="text-xs text-amber-400 px-1">Mínimo 8 caracteres</p>
        </div>

        <button type="submit" :disabled="!step1Valid"
          class="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 mt-4">
          Continuar <i class="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </form>

      <!-- Step 2: Company data -->
      <form v-if="step === 2" @submit.prevent="handleRegister" class="space-y-5">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Datos de tu empresa emisora</p>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Razón social</label>
          <div class="relative group">
            <i class="fa-solid fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input v-model="form.companyName" type="text" required placeholder="Mi Empresa SA de CV"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">RFC <span class="text-slate-600">(opcional — puedes configurarlo después)</span></label>
          <div class="relative group">
            <i class="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"></i>
            <input v-model="form.rfc" type="text" maxlength="13" placeholder="XAXX010101000"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all uppercase" />
          </div>
        </div>

        <div class="flex gap-3 mt-4">
          <button type="button" @click="step = 1"
            class="flex-1 py-4 bg-white/5 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all border border-white/10">
            <i class="fa-solid fa-arrow-left mr-2"></i> Atrás
          </button>
          <button type="submit" :disabled="loading || !form.companyName"
            class="flex-2 flex-grow py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch animate-spin"></i> Creando cuenta...
            </span>
            <span v-else>Crear cuenta <i class="fa-solid fa-rocket ml-2"></i></span>
          </button>
        </div>
      </form>

      <!-- Error -->
      <div v-if="error" class="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
        {{ error }}
      </div>

      <!-- Link to login -->
      <div class="pt-6 border-t border-white/5 flex items-center justify-center mt-6">
        <button type="button" @click="goLogin"
          class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-left"></i> Ya tengo cuenta — Iniciar sesión
        </button>
      </div>
    </div>

    <div class="absolute bottom-10 text-center">
      <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Fiax · CFDI 4.0 Powered by Odoo</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const router = VueRouter.useRouter();
    const step = Vue.ref(1);
    const showPwd = Vue.ref(false);
    const loading = Vue.ref(false);
    const error = Vue.ref(null);

    const form = Vue.reactive({
      name: '',
      email: '',
      password: '',
      companyName: '',
      rfc: '',
    });

    const step1Valid = Vue.computed(() =>
      form.name.trim() && form.email.trim() && form.password.length >= 8
    );

    const goStep2 = () => {
      if (!step1Valid.value) return;
      error.value = null;
      step.value = 2;
    };

    const goLogin = () => router.push('/login');

    const handleRegister = async () => {
      if (!form.companyName.trim()) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await fetch('/fiax/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            companyName: form.companyName.trim(),
            rfc: form.rfc.trim().toUpperCase(),
          }),
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem('fiax_token', data.token);
          localStorage.setItem('fiax_user', JSON.stringify(data.user));
          localStorage.removeItem('fiax_demo_mode');
          window.location.reload();
        } else {
          error.value = data.message || 'No se pudo crear la cuenta.';
        }
      } catch (err) {
        error.value = 'Error de conexión. ¿Está el servidor disponible?';
      } finally {
        loading.value = false;
      }
    };

    return { step, showPwd, loading, error, form, step1Valid, goStep2, goLogin, handleRegister };
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
</style>
