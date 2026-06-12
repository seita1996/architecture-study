<template>
  <div class="code-comparison">
    <section>
      <h3>{{ leftTitle }}</h3>
      <slot name="left" />
    </section>
    <section>
      <h3>{{ rightTitle }}</h3>
      <slot name="right" />
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  leftTitle: string
  rightTitle: string
}>()
</script>

<style scoped>
.code-comparison {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

section {
  min-width: 0;
}

h3 {
  margin: 0 0 0.5rem;
  color: #334155;
  font-size: 0.95rem;
}
</style>
