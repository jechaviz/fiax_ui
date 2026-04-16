
<template>
  <span
    :class="[
      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset transition-all duration-300',
      variantClasses[variant] || variantClasses.default
    ]"
  >
    <i v-if="icon" :class="[icon, 'mr-1.5 opacity-70']"></i>
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'AppBadge',
  props: {
    variant: { type: String, default: 'default' },
    icon: String
  },
  setup() {
    const variantClasses = {
      default: 'bg-slate-800 text-slate-400 ring-slate-700/50 shadow-lg',
      success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30 shadow-emerald-500/10',
      warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/30 shadow-amber-500/10',
      danger: 'bg-rose-500/10 text-rose-400 ring-rose-500/30 shadow-rose-500/10',
      info: 'bg-blue-500/10 text-blue-400 ring-blue-500/30 shadow-blue-500/10',
      glass: 'bg-white/5 text-white ring-white/10 backdrop-blur-md'
    };

    return { variantClasses };
  }
}
</script>
