<template>
  Welcome to my Widgets page!
  <ul>
    <li v-for="widget in widgets" :key="widget.id">
      <router-link :to="widget.url">
        {{ widget.name }}
      </router-link>
    </li>
  </ul>
</template>

<script>

import { ref, onUpdated, computed, } from 'vue'



export default {
  name: 'Home',

  setup(props, { emit }) {
    const widgets = ref([
      { id: 1, name: 'Recipes', url: '/recipes' },
      { id: 2, name: 'Prices', url: '/prices' },
      { id: 3, name: 'Restaurant', url: '/menu' },
      { id: 4, name: 'Membership', url: '/membership' },
    ]);
    return {
      widgets,
    };

  },
  components: {

  },
}
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

a {
  text-decoration: none;
  color: #42b983;
  font-size: 20px;
}

a:hover {
  color: #35495e;
}
</style>