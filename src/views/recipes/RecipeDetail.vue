<template>
  <div class="recipe-detail">
    <h2>{{ recipe?.title || "Loading..." }}</h2>
    <p><strong>Contributor:</strong> {{ recipe?.contributor || "Unknown" }}</p>

    <div v-if="loading">Loading recipe...</div>
    <div v-else-if="!recipe">Recipe not found.</div>
    <div v-else>
      <h3>Ingredients:</h3>
      <ul>
        <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
          {{ ingredient }}
        </li>
      </ul>

      <h3>Instructions:</h3>
      <p v-if="recipe.instructions">{{ recipe.instructions }}</p>
      <p v-else>No instructions provided.</p>
    </div>

    <router-link to="/recipes">Back to Recipes</router-link>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default {
  name: "RecipeDetail",
  setup() {
    const route = useRoute();
    const recipe = ref(null);
    const loading = ref(true);
    const db = getFirestore();

    const fetchRecipe = async () => {
      const recipeId = route.params.id;
      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          recipe.value = docSnap.data();
        } else {
          recipe.value = null;
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchRecipe);

    return { recipe, loading };
  },
};
</script>

<style scoped>
.recipe-detail {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

h3 {
  margin-top: 15px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 5px 0;
}

p {
  white-space: pre-line;
}

a {
  display: block;
  margin-top: 20px;
  text-decoration: none;
  color: #007bff;
}

a:hover {
  text-decoration: underline;
}
</style>
