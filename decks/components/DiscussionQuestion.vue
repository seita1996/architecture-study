<template>
  <section class="discussion-question">
    <p class="label">今回の問い</p>
    <slot />
  </section>
</template>

<style scoped>
.discussion-question {
  border: 1px solid #cbd5e1;
  border-left: 5px solid #0f766e;
  border-radius: 8px;
  padding: 1rem 1.15rem;
  background: #fff;
}

.label {
  margin: 0 0 0.45rem;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 700;
}

:deep(p) {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.55;
}
</style>
