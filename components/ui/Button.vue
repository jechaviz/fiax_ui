
<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses[size],
      variantClasses[variant]
    ]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i>
    <i v-else-if="icon" :class="[icon, label ? 'mr-2' : '']"></i>
    <slot>{{ label }}</slot>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    label: String,
    icon: String,
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    type: { type: String, default: 'button' },
    disabled: Boolean,
    loading: Boolean
  },
  setup() {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base'
    };
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
      secondary: 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10',
      ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
      danger: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20',
      glass: 'app-glass hover:bg-white/10 text-white border-white/5'
    };

    return { sizeClasses, variantClasses };
  }
}
</script>
