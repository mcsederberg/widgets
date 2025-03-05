<template>
  <div>
    <h1>Manage Restaurants</h1>
    <nav>
      <router-link to="/menu">Menu</router-link> |
      <router-link to="/menu/orders">View Orders</router-link> |
      <router-link to="/menu/create-order">Create Order</router-link>
    </nav>
    <button class="my-4" @click="openCreatePopup">Add Restaurant</button>
    
    <div class="restaurant-list">
      <div v-for="restaurant in restaurants" :key="restaurant.id" class="restaurant-card card" @click="openEditPopup(restaurant)">
        <h3>{{ restaurant.name }}</h3>
        <p>Owner: {{ getUserName(restaurant.ownerID) }}</p>
      </div>
    </div>

    <RestaurantPopup 
      v-if="showPopup" 
      :restaurant="selectedRestaurant" 
      :users="users" 
      @close="closePopup" 
      @save="saveRestaurant" 
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import RestaurantPopup from "@/components/RestaurantPopup.vue";

export default {
  components: { RestaurantPopup },
  setup() {
    const restaurants = ref([]);
    const users = ref([]);
    const showPopup = ref(false);
    const selectedRestaurant = ref(null);

    const fetchRestaurants = async () => {
      const querySnapshot = await getDocs(collection(db, "restaurants"));
      restaurants.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const openEditPopup = (restaurant) => {
      selectedRestaurant.value = { ...restaurant };
      showPopup.value = true;
    };

    const openCreatePopup = () => {
      selectedRestaurant.value = { name: "", ownerID: "", userIDs: [] };
      showPopup.value = true;
    };

    const closePopup = () => {
      showPopup.value = false;
      selectedRestaurant.value = null;
    };

    const saveRestaurant = async (restaurant) => {
      if (restaurant.id) {
        await updateDoc(doc(db, "restaurants", restaurant.id), restaurant);
      } else {
        await addDoc(collection(db, "restaurants"), restaurant);
      }
      closePopup();
      fetchRestaurants();
    };

    const getUserName = (userID) => {
      const user = users.value.find(user => user.id === userID);
      return user ? user.name : "Unknown";
    };

    onMounted(() => {
      fetchRestaurants();
      fetchUsers();
    });

    return {
      restaurants,
      users,
      showPopup,
      selectedRestaurant,
      openEditPopup,
      openCreatePopup,
      closePopup,
      saveRestaurant,
      getUserName
    };
  }
};
</script>

<style>
.restaurant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.restaurant-card {
  border: 1px solid #ccc;
  padding: 10px;
  cursor: pointer;
}
</style>
