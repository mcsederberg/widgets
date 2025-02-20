<template>
  <div class="recipes-container">
    <h1>Recipes</h1>
    <nav>
      <router-link to="/recipes">View Recipes</router-link>
      <router-link to="/recipes/create">Create a Recipe</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "Recipes",
};
</script>

<style scoped>
.recipes-container {
  text-align: center;
  padding: 20px;
  margin-left: auto;
  margin-right: auto;
}

nav {
  margin-top: 20px;
}

nav a {
  display: block;
  margin: 10px 0;
  font-size: 18px;
  text-decoration: none;
  color: #007bff;
}

nav a:hover {
  text-decoration: underline;
}
</style>
