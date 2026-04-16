
<template>
  <div
    :class="[
      'app-glass rounded-2xl p-6 transition-all duration-300 border border-white/5',
      hover ? 'hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] hover:shadow-2xl' : '',
      interactive ? 'cursor-pointer active:scale-[0.98]' : ''
    ]"
    @click="interactive && $emit('click')"
  >
    <div v-if="$slots.header || title" class="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
      <slot name="header">
        <div>
          <h3 class="font-black text-xl text-white italic tracking-tighter" v-if="title">{{ title }}</h3>
          <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest" v-if="subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>
    
    <div :class="{ 'space-y-4': !tight }">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="mt-6 pt-6 border-t border-white/5">
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
