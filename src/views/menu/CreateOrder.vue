<template>
  <div>
    <h2>Create Order</h2>

    <nav>
      <template v-if="isAdmin">
        <router-link to="/menu/restaurants">Restaurants</router-link> |
      </template>
      <router-link to="/menu">Menu</router-link> |
      <router-link to="/menu/orders">View Orders</router-link>
    </nav>

    <input class="mt-4" v-model="customerName" placeholder="Customer Name" required />

    <ul>
      <li v-for="item in menuItems" :key="item.id" class="mb-4">
        <button  @click="removeItem(item)">-</button>
        <button class="mx-4 " @click="addItem(item)">+</button>
        {{ item.name }} - ${{ item.price.toFixed(2) }}
        <b class="ml-4">x{{ orderItems[item.id]?.quantity ? orderItems[item.id]?.quantity : 0 }}</b>
      </li>
    </ul>

    <p><strong>Total: ${{ totalPrice.toFixed(2) }}</strong></p>

    <button @click="createOrder" :disabled="!customerName || Object.keys(orderItems).length === 0">
      Create Order
    </button>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

import { useUserStore } from "@/stores/userStore";
import { useRestaurantStore } from '@/stores/restaurantStore';
import { storeToRefs } from "pinia";

export default {
  setup() {
    const customerName = ref('');
    const menuItems = ref([]);
    const orderItems = ref({});
    const restaurantStore = useRestaurantStore();
    const userStore = useUserStore();
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);
    const {
      currentRestaurantMenuItems,
      currentRestaurant,
      currentRestaurantID,
    } = storeToRefs(restaurantStore);

    const fetchMenuItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      menuItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addItem = (item) => {
      if (!orderItems.value[item.id]) {
        orderItems.value[item.id] = { name: item.name, price: item.price, quantity: 1 };
      } else {
        orderItems.value[item.id].quantity++;
      }
    };

    const removeItem = (item) => {
      if (orderItems.value[item.id]) {
        orderItems.value[item.id].quantity--;
        if (orderItems.value[item.id].quantity === 0) delete orderItems.value[item.id];
      }
    };

    const totalPrice = computed(() => {
      return Object.values(orderItems.value).reduce((sum, item) => sum + item.price * item.quantity, 0);
    });

    const createOrder = async () => {
      const itemsArray = Object.values(orderItems.value);

      await addDoc(collection(db, 'orders'), {
        customer: customerName.value,
        items: itemsArray,
        date: new Date().toISOString(),
        restaurantID: currentRestaurantID.value,
      });

      customerName.value = '';
      orderItems.value = {};
    };

    onMounted(fetchMenuItems);

    return {
      customerName,
      isAdmin,
      menuItems,
      orderItems,
      addItem,
      removeItem,
      createOrder,
      totalPrice
    };
  }
};
</script>

<style lang="scss" scoped>
  li {
    list-style-type: none;
  }
</style>