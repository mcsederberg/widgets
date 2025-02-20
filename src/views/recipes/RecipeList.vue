<template>
  <div class="recipe-list">
    <h2>All Recipes</h2>
    <div v-if="loading">Loading recipes...</div>
    <div v-else-if="recipes.length === 0">No recipes found.</div>
    <ul v-else>
      <li v-for="recipe in recipes" :key="recipe.id">
        <router-link :to="`/recipes/${recipe.id}`">
          {{ recipe.title }} - by {{ recipe.contributor }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default {
  name: "RecipeList",
  setup() {
    const recipes = ref([]);
    const loading = ref(true);
    const db = getFirestore();

    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        recipes.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchRecipes);

    return { recipes, loading };
  },
};
</script>

<style scoped>
.recipe-list {
  text-align: center;
  padding: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

a {
  text-decoration: none;
  color: #007bff;
  font-size: 18px;
}

a:hover {
  text-decoration: underline;
}
</style>
