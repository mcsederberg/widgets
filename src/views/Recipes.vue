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
  setup() {
    const wakeCheck = async () => {
      // Create a reference for the Wake Lock.
      let wakeLock = null;

      // create an async function to request a wake lock
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        window.alert("Wake Lock is active!");
      } catch (err) {
        // The Wake Lock request has failed - usually system related, such as battery.
        console.error(`${err.name}, ${err.message}`);
      }
    };
    wakeCheck();

    return {};
  },
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
