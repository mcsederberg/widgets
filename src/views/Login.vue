<template>
  <div>
    <h1>{{ isLogin ? "Login" : "Sign Up" }}</h1>
    <!-- <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">{{ isLogin ? "Login" : "Sign Up" }}</button>
    </form>
    <p @click="toggleAuthMode" style="cursor: pointer; color: blue;">
      {{ isLogin ? "Need an account? Sign up" : "Already have an account? Login" }}
    </p> -->
    <button @click="signInWithGoogle">Log in with Google</button>
  </div>
</template>

<script>
import { ref } from "vue";
import { auth, db } from "@/services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

export default {
  name: "Auth",
  setup() {
    const email = ref("");
    const password = ref("");
    const isLogin = ref(true);
    const router = useRouter();
    const userStore = useUserStore();

    const { currentUser } = storeToRefs(userStore);

    const saveUserToFirestore = async (user) => {
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      currentUser.value = userSnapshot.data();

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          userID: user.uid,
          email: user.email,
          name: user.displayName || "",
          restaurantID: null, // Admin will assign later
          role: "user", // Default role
        });
      }
    };

    const handleAuth = async () => {
      try {
        let userCredential;
        if (isLogin.value) {
          userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        } else {
          userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        }

        const user = userCredential.user;
        await saveUserToFirestore(user);

        // alert(isLogin.value ? "Logged in!" : "Account created!");
        router.push("/");
      } catch (error) {
        console.error("Auth error:", error.message);
      }
    };

    const signInWithGoogle = async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await saveUserToFirestore(result.user);

        // alert("Logged in with Google!");
        router.push("/");
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
