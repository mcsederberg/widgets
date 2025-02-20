<template>
  <div class="recipe-create">
    <h2>Create a Recipe</h2>
    <form @submit.prevent="addRecipe">
      <div>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="title" required />
      </div>

      <div>
        <label for="contributor">Contributor Name:</label>
        <input type="text" id="contributor" v-model="contributor" required />
      </div>

      <div>
        <label for="ingredients">Ingredients:</label>
        <textarea id="ingredients" v-model="ingredients" placeholder="One ingredient per line" required></textarea>
      </div>

      <div>
        <label for="instructions">Instructions:</label>
        <textarea id="instructions" v-model="instructions" placeholder="Step-by-step instructions" required></textarea>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Saving..." : "Add Recipe" }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export default {
  name: "RecipeCreate",
  setup() {
    const title = ref("");
    const contributor = ref("");
    const ingredients = ref("");
    const instructions = ref("");
    const loading = ref(false);
    const db = getFirestore();

    const addRecipe = async () => {
      if (!title.value || !ingredients.value || !instructions.value) return;

      loading.value = true;
      try {
        await addDoc(collection(db, "recipes"), {
          title: title.value,
          contributor: contributor.value || "Anonymous",
          ingredients: ingredients.value.split("\n").map((item) => item.trim()).filter(Boolean),
          instructions: instructions.value.trim(),
        });

        title.value = "";
        contributor.value = "";
        ingredients.value = "";
        instructions.value = "";
        alert("Recipe added!");
      } catch (error) {
        console.error("Error adding recipe:", error);
        alert("Failed to add recipe.");
      } finally {
        loading.value = false;
      }
    };

    return { title, contributor, ingredients, instructions, loading, addRecipe };
  },
};
</script>

<style scoped>
.recipe-create {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: #28a745;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

button:disabled {
  background-color: #ccc;
}

button:hover:not(:disabled) {
  background-color: #218838;
}
</style>
