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
          <input type="checkbox" v-model="checkedIngredients[index]" />
          <span :class="{ checked: checkedIngredients[index] }">{{ ingredient }}</span>
        </li>
      </ul>

      <h3>Instructions:</h3>
      <ul>
        <li v-for="(step, index) in formattedInstructions" :key="index">
          <input type="checkbox" v-model="checkedInstructions[index]" />
          <span :class="{ checked: checkedInstructions[index] }">{{ step }}</span>
        </li>
      </ul>
    </div>

    <router-link to="/recipes">Back to Recipes</router-link>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRecipesStore } from "@/stores/recipesStore";
import { storeToRefs } from "pinia";

export default {
  name: "RecipeDetail",
  setup() {
    const route = useRoute();
    const recipe = ref(null);
    const loading = ref(true);
    const db = getFirestore();
    const checkedIngredients = ref([]);
    const checkedInstructions = ref([]);

    const recipesStore = useRecipesStore();
    const { useImperial } = storeToRefs(recipesStore);

    const fetchRecipe = async () => {
      const recipeId = route.params.id;
      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          recipe.value = docSnap.data();
          checkedIngredients.value = new Array(recipe.value.ingredients.length).fill(false);
          checkedInstructions.value = new Array(recipe.value.instructions.split("\n").length).fill(false);
        } else {
          recipe.value = null;
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        loading.value = false;
      }
    };

    const formattedInstructions = computed(() => {
      return recipe.value?.instructions ? recipe.value.instructions.split("\n").filter(line => line.trim()) : [];
    });

    onMounted(fetchRecipe);

    return {
      recipe,
      loading,
      useImperial,
      checkedIngredients,
      checkedInstructions,
      formattedInstructions,
    };
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
  display: flex;
  align-items: center;
}

input[type="checkbox"] {
  margin-right: 10px;
}

.checked {
  text-decoration: line-through;
  color: gray;
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
