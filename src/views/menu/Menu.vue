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
    <form @submit.prevent="addItem">
      <input v-model="newItem.name" placeholder="Item Name" required />
      <input v-model.number="newItem.price" type="number" placeholder="Price" required />
      <button type="submit">Add Item</button>
    </form>
    <ul>
      <li v-for="item in menuItems" :key="item.id">
        {{ item.name }} - ${{ item.price.toFixed(2) }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase'; // Adjust import as needed
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth } from "@/services/firebase";

import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const menuItems = ref([]);
    const newItem = ref({ name: '', price: 0 });
    const userStore = useUserStore();
    const { 
      currentUser,
      isAdmin,
   } = storeToRefs(userStore);

    const fetchMenuItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      menuItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addItem = async () => {
      if (!newItem.value.name || newItem.value.price <= 0) return;
      await addDoc(collection(db, 'menuItems'), { ...newItem.value });
      newItem.value = { name: '', price: 0 };
      fetchMenuItems();
    };

    onMounted(fetchMenuItems);

    return { 
      menuItems, 
      newItem, 
      addItem,
      currentUser,
      isAdmin,
     };
  }
};
</script>