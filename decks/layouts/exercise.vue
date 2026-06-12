<template>
  <main class="exercise-layout">
    <p class="kicker">Exercise</p>
    <h1><slot /></h1>
    <section class="body">
      <slot name="body" />
    </section>
  </main>
</template>

<style scoped>
.exercise-layout {
  min-height: 100%;
  padding: 3.2rem 4.5rem;
  background: #fff;
}

.kicker {
  margin: 0 0 0.5rem;
  color: #b45309;
  font-weight: 800;
}

h1 {
  margin: 0 0 1.25rem;
}

.body {
  font-size: 1.05rem;
}
</style>
