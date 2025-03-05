<template>
  <div>
    <h2>Menu</h2>
    <nav>
      <template v-if="isAdmin">
        <router-link to="/menu/restaurants">Restaurants</router-link> |
      </template>
      <router-link to="/menu/orders">View Orders</router-link> |
      <router-link to="/menu/create-order">Create Order</router-link>
    </nav>
    <div v-if="!currentRestaurant">
      <h3>No restaurant selected</h3>
    </div>
    <template v-else>
      <form @submit.prevent="addItem">
        <input v-model="newItem.name" placeholder="Item Name" required />
        <input class="my-4" v-model.number="newItem.price" type="number" placeholder="Price" required />
        <button :class="newItem.name && newItem.price ? 'btn-primary' : 'btn-secondary'" type="submit">Add Item</button>
      </form>
      <ul>
        <li v-for="item in currentRestaurantMenuItems" :key="item.id">
          {{ item.name }} - ${{ item.price.toFixed(2) }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase'; // Adjust import as needed
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth } from "@/services/firebase";

import { useUserStore } from "@/stores/userStore";
import { useRestaurantStore } from '@/stores/restaurantStore';
import { storeToRefs } from "pinia";

export default {
  setup() {
    const newItem = ref({ name: '', price: null });
    const userStore = useUserStore();
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);

    const restaurantStore = useRestaurantStore();
    const {
      currentRestaurantMenuItems,
      currentRestaurant,
    } = storeToRefs(restaurantStore);
    restaurantStore.init();

    const addItem = async () => {
      if (!newItem.value.name || newItem.value.price <= 0) return;
      await addDoc(collection(db, 'menuItems'), { ...newItem.value });
      newItem.value = { name: '', price: null };
      restaurantStore.getMenuItems();
    };


    return {
      currentRestaurantMenuItems,
      currentRestaurant,
      newItem,
      addItem,
      currentUser,
      isAdmin,
    };
  }
};
</script>

<style scoped>
nav {
  margin-bottom: 1rem;
}

form {
  display: flex;
  flex-direction: column;
}
</style>