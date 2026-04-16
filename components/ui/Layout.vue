
<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset transition-colors',
      variantClasses[variant] || variantClasses.default
    ]"
  >
    <i v-if="icon" :class="[icon, 'mr-1']"></i>
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
      default: 'bg-slate-800 text-slate-400 ring-slate-700',
      success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
      danger: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
      info: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
      glass: 'bg-white/5 text-white ring-white/10'
    };

    return { variantClasses };
  }
}
</script>
<!-- slide -->
<template>
  <div
    :class="[
      'app-glass rounded-2xl p-6 transition-all duration-300',
      hover ? 'hover:bg-white/10 hover:border-white/20' : '',
      interactive ? 'cursor-pointer active:scale-[0.98]' : ''
    ]"
    @click="interactive && $emit('click')"
  >
    <div v-if="$slots.header || title" class="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
      <slot name="header">
        <h3 class="font-bold text-lg text-white" v-if="title">{{ title }}</h3>
        <p class="text-xs text-slate-500" v-if="subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    
    <div :class="{ 'space-y-4': !tight }">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-white/5">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    title: String,
    subtitle: String,
    hover: Boolean,
    interactive: Boolean,
    tight: Boolean
  }
}
</script>
