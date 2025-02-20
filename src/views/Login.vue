<template>
  <div>
    <h1>{{ isLogin ? "Login" : "Sign Up" }}</h1>
    <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">{{ isLogin ? "Login" : "Sign Up" }}</button>
    </form>
    <p @click="toggleAuthMode" style="cursor: pointer; color: blue;">
      {{ isLogin ? "Need an account? Sign up" : "Already have an account? Login" }}
    </p>
    <button @click="signInWithGoogle">Login with Google</button>
  </div>
</template>

<script>
import { ref } from "vue";
import { auth } from "@/services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export default {
  name: "Auth",
  setup() {
    const email = ref("");
    const password = ref("");
    const isLogin = ref(true);

    const handleAuth = async () => {
      try {
        if (isLogin.value) {
          await signInWithEmailAndPassword(auth, email.value, password.value);
          alert("Logged in!");
        } else {
          await createUserWithEmailAndPassword(auth, email.value, password.value);
          alert("Account created!");
        }
      } catch (error) {
        console.error("Auth error:", error.message);
      }
    };

    const signInWithGoogle = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        alert("Logged in with Google!");
      } catch (error) {
        console.error("Google sign-in error:", error.message);
      }
    };

    const toggleAuthMode = () => {
      isLogin.value = !isLogin.value;
    };

    return {
      email,
      password,
      isLogin,
      handleAuth,
      signInWithGoogle,
      toggleAuthMode,
    };
  },
};
</script>
