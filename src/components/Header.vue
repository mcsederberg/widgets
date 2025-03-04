<template>
  <header class="wiki-header">
    <router-link to="/"><h1>Widgets</h1></router-link>
    <nav>
      <ul>
        <li><button @click="logout">Logout</button></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";

export default {
  name: "Header",
  methods: {
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push("/login");
      });
    },
  },
};
</script>

<style scoped>
.wiki-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  height: var(--header-height);
  position: fixed;
  top: 0;
  background-color: #242424;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.wiki-header nav ul li button {
  background: none;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  font-size: 16px;
}

.wiki-header nav ul li button:hover {
  text-decoration: underline;
}

nav {
  margin-right: 20px;
}
</style>
