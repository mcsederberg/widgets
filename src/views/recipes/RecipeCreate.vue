<template>
  <div class="recipe-create">
    <h2>Create a Recipe</h2>
    <form @submit.prevent="addRecipe">
      <div class="">
        <label for="public">Public:</label>
        <input type="checkbox" id="public" v-model="isPublic" />
      </div>
      <div>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="title" required />
      </div>
      <div>
        <label for="contributor">Contributor Name:</label>
        <input type="text" id="contributor" v-model="contributor" required />
      </div>

      <div class="textarea-container">
        <label for="ingredients">Ingredients:</label>
        <button type="button" class="scroll-btn up" @click="scrollTextarea('ingredients', -1)">&uarr;</button>
        <textarea id="ingredients" v-model="ingredients" placeholder="One ingredient per line" required></textarea>
        <button type="button" class="scroll-btn down" @click="scrollTextarea('ingredients', 1)">&darr;</button>
      </div>

      <div class="textarea-container">
        <label for="instructions">Instructions:</label>
        <button type="button" class="scroll-btn up" @click="scrollTextarea('instructions', -1)">&uarr;</button>
        <textarea id="instructions" v-model="instructions" placeholder="Step-by-step instructions" required></textarea>
        <button type="button" class="scroll-btn down" @click="scrollTextarea('instructions', 1)">&darr;</button>
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
import { auth } from "@/services/firebase";

export default {
  name: "RecipeCreate",
  setup() {
    console.log(auth);
    const title = ref("");
    const contributor = ref("");
    const ingredients = ref("");
    const instructions = ref("");
    const isPublic = ref(false);
    const loading = ref(false);
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const addRecipe = async () => {
      if (!title.value || !ingredients.value || !instructions.value) return;

      loading.value = true;
      try {
        await addDoc(collection(db, "recipes"), {
          title: title.value,
          contributor: contributor.value || "Anonymous",
          ingredients: ingredients.value.split("\n").map((item) => item.trim()).filter(Boolean),
          instructions: instructions.value.trim(),
          createdAt: new Date(),
          userId: currentUser.uid,
          public: isPublic.value,
          createdBy: currentUser.displayName,
        });

        title.value = "";
        contributor.value = "";
        ingredients.value = "";
        instructions.value = "";
        isPublic.value = false;
        alert("Recipe added!");
      } catch (error) {
        console.error("Error adding recipe:", error);
        alert("Failed to add recipe.");
      } finally {
        loading.value = false;
      }
    };

    const scrollTextarea = (id, direction) => {
      const textarea = document.getElementById(id);
      if (textarea) {
        textarea.scrollTop += direction * 20;
      }
    };

    return { title, contributor, ingredients, instructions, loading, addRecipe, scrollTextarea, isPublic, };
  },
};
</script>
<style scoped>
.recipe-create {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
  max-width: 95vw;
  width: 500px;
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

textarea {
  min-height: 10em;
  resize: vertical;
}

.textarea-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.scroll-btn {
  position: absolute;
  right: -30px;
  width: 30px;
  height: 30px;
  border: none;
  background: #ccc;
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  text-align: center;
}

.up {
  top: 0;
}

.down {
  bottom: 0;
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

/* Make .scroll-btn hidden on wide screen sizes */
@media (min-width: 768px) {
  .scroll-btn {
    display: none;
  }
}
</style>