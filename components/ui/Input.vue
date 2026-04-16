
<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <div v-if="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
        <i :class="icon"></i>
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'app-input-glass w-full outline-none transition-all duration-300',
          icon ? 'pl-11' : 'pl-4',
          error ? 'border-rose-500/50 bg-rose-500/5' : 'focus:border-blue-500/50 focus:bg-blue-500/5'
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <div v-if="error" class="text-[10px] text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppInput',
  props: {
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    icon: String,
    type: { type: String, default: 'text' },
    id: { type: String, default: () => 'input-' + Math.random().toString(36).substr(2, 9) },
    disabled: Boolean,
    error: String
  },
  emits: ['update:modelValue']
}
</script>
