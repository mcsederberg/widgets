<template>
  <div class="recipe-list">
    <h2>{{ showMyRecipes ? 'My' : 'Public' }} Recipes</h2>
    <!-- Toggle button -->
    <button @click="toggleView">
      {{ showMyRecipes ? "Show All Public Recipes" : "Show My Recipes" }}
    </button>
    <div v-if="loading">Loading recipes...</div>
    <div v-else-if="filteredRecipes.length === 0">No recipes found.</div>


    <ul v-else>
      <li v-for="recipe in filteredRecipes" :key="recipe.id">
        <router-link :to="`/recipes/${recipe.id}`">
          {{ recipe.title }} - by {{ recipe.contributor }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted, computed, } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "RecipeList",
  setup() {
    const recipes = ref([]);
    const loading = ref(true);
    const showMyRecipes = ref(false); // State to toggle between all and my recipes
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

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

    // Filter recipes based on the toggle
    const filteredRecipes = computed(() => {
      if (showMyRecipes.value) {
        return recipes.value.filter(
          (recipe) => recipe.userId === currentUser?.uid
        );
      } else {
        return recipes.value.filter((recipe) => recipe.public || recipe.userId === currentUser?.uid);
      }
    });

    const toggleView = () => {
      showMyRecipes.value = !showMyRecipes.value;
    };

    onMounted(fetchRecipes);

    return { recipes, loading, showMyRecipes, filteredRecipes, toggleView };
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

button {
  padding: 8px 16px;
  margin-bottom: 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
