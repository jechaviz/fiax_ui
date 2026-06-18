<template>
  <div
    v-if="open"
    class="app-row-context-menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <button class="app-context-item" type="button" @click="$emit('action', 'open')"><i class="fa-solid fa-eye"></i><span>{{ i18n.actionOpen || 'Abrir' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'edit')"><i class="fa-solid fa-pen"></i><span>{{ i18n.actionEdit || 'Editar' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'send')"><i class="fa-solid fa-paper-plane"></i><span>{{ i18n.actionSend || 'Enviar' }}</span></button>
    <button v-if="showDownloads" class="app-context-item" type="button" @click="$emit('action', 'download-xml')"><i class="fa-solid fa-file-code"></i><span>{{ i18n.actionDownloadXml || 'Descargar XML' }}</span></button>
    <button v-if="showDownloads" class="app-context-item" type="button" @click="$emit('action', 'download-pdf')"><i class="fa-solid fa-file-pdf"></i><span>{{ i18n.actionDownloadPdf || 'Descargar PDF' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'copy-id')"><i class="fa-solid fa-copy"></i><span>{{ i18n.actionCopyId || 'Copiar ID' }}</span></button>
  </div>
</template>

<script>
export default {
  name: 'DataTableContextMenu',
  props: {
    open: { type: Boolean, default: false },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    i18n: { type: Object, default: () => ({}) },
    showDownloads: { type: Boolean, default: false },
  },
  emits: ['action'],
};
</script>
