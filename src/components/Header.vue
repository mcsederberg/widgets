<template>
  <header class="wiki-header">
    <router-link to="/"><h1>Widgets</h1></router-link>
    <nav>
      <ul>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.wiki-header {
  /* background-color: #f8f9fa; */
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  height: var(--header-height);
  position: fixed;
  top:  0;
  background-color: #242424;
  width: 100vw;
}

.wiki-header h1 {
  margin: 0;
  font-size: 24px;
}

.wiki-header nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 15px;
}

.wiki-header nav ul li {
  display: inline;
}

.wiki-header nav ul li a {
  text-decoration: none;
  color: #007bff;
}

.wiki-header nav ul li a:hover {
  text-decoration: underline;
}
</style>