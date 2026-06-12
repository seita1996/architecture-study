<template>
  <main class="chapter-layout">
    <p class="kicker"><slot name="kicker" /></p>
    <h1><slot /></h1>
    <p class="subtitle"><slot name="subtitle" /></p>
  </main>
</template>

<style scoped>
.chapter-layout {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 5rem;
  background: linear-gradient(180deg, #f8fafc 0%, #eef6f4 100%);
}

.kicker {
  margin: 0 0 0.75rem;
  color: #0f766e;
  font-weight: 800;
}

h1 {
  max-width: 920px;
  margin: 0;
  color: #111827;
  font-size: 3rem;
  line-height: 1.18;
}

.subtitle {
  max-width: 760px;
  margin-top: 1rem;
  color: #4b5563;
  font-size: 1.25rem;
}
</style>
