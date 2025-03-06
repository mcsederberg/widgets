<template>
  <header class="wiki-header">
    <router-link to="/">
      <h1>Widgets</h1>
    </router-link>

    <div v-if="isMenu">
      <b class="mr-4">Current Restaurant:</b>
      <select v-model="currentRestaurantID">
        <option v-for="restaurant in userRestaurants" :key="restaurant.id" :value="restaurant.id">
          {{ restaurant.name }}
        </option>
      </select>
    </div>
    <div v-else-if="isMembership">
      <b class="mr-4">Current Club:</b>
      <select v-model="currentClubID">
        <option v-for="club in userClubs" :key="club.id" :value="club.id">
          {{ club.name }}
        </option>
      </select>
    </div>

    <nav>
      <ul>
        <li><button @click="logout">Logout</button></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";
import { useRoute, useRouter } from "vue-router";
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useMembershipStore } from '@/stores/membershipStore';
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";
export default {
  name: "Header",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();

    const restaurantStore = useRestaurantStore();
    const {
      userRestaurants,
      currentRestaurantID,
    } = storeToRefs(restaurantStore);
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);

    const membershipStore = useMembershipStore();
    const {
      userClubs,
      currentClubID,
    } = storeToRefs(membershipStore);


    const logout = () => {
      const auth = getAuth();
      signOut(auth).then(() => {
        router.push("/login");
      });
    };

    const isMenu = computed(() => {
      return route.path.includes("menu");
    })

    const isMembership = computed(() => {
      return route.path.includes("membership");
    })

    return {
      currentClubID,
      currentRestaurantID,
      isMembership,
      isMenu,
      logout,
      route,
      router,
      userClubs,
      userRestaurants,
    };
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
