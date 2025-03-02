<template>
  <div>
    <h2>Create Order</h2>
    <input v-model="customerName" placeholder="Customer Name" required />
    <ul>
      <li v-for="item in menuItems" :key="item.id">
        {{ item.name }} - ${{ item.price.toFixed(2) }}
        <button @click="addItem(item)">+</button>
        <button @click="removeItem(item)">-</button>
        <span v-if="orderItems[item.id]">x{{ orderItems[item.id] }}</span>
      </li>
    </ul>
    <button @click="createOrder" :disabled="!customerName || Object.keys(orderItems).length === 0">Create Order</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default {
  setup() {
    const customerName = ref('');
    const menuItems = ref([]);
    const orderItems = ref({});

    const fetchMenuItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      menuItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addItem = (item) => {
      orderItems.value[item.id] = (orderItems.value[item.id] || 0) + 1;
    };

    const removeItem = (item) => {
      if (orderItems.value[item.id]) {
        orderItems.value[item.id]--;
        if (orderItems.value[item.id] === 0) delete orderItems.value[item.id];
      }
    };

    const createOrder = async () => {
      const itemsArray = Object.keys(orderItems.value).map(id => ({
        name: menuItems.value.find(item => item.id === id).name,
        quantity: orderItems.value[id],
      }));

      await addDoc(collection(db, 'orders'), {
        customer: customerName.value,
        items: itemsArray
      });

      customerName.value = '';
      orderItems.value = {};
    };

    onMounted(fetchMenuItems);

    return { customerName, menuItems, orderItems, addItem, removeItem, createOrder };
  }
};
</script>