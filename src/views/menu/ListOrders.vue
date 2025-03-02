<template>
  <div>
    <h2>Orders</h2>
    
    <nav>
      <router-link to="/menu">Menu</router-link> |
      <router-link to="/menu/create-order">Create Order</router-link>
    </nav>

    <ul>
      <li v-for="order in orders" :key="order.id">
        <strong>{{ order.customer }}</strong>
        <ul>
          <li v-for="item in order.items" :key="item.name">
            {{ item.name }} x{{ item.quantity }} - ${{ (item.price * item.quantity).toFixed(2) }}
          </li>
        </ul>
        <p><strong>Total: ${{ order.totalPrice.toFixed(2) }}</strong></p>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default {
  setup() {
    const orders = ref([]);

    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      orders.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const totalPrice = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { id: doc.id, ...data, totalPrice };
      });
    };

    onMounted(fetchOrders);

    return { orders };
  }
};
</script>