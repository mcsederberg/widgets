<template>
  <div>
    <h2>Orders</h2>
    <ul>
      <li v-for="order in orders" :key="order.id">
        <strong>{{ order.customer }}</strong>
        <ul>
          <li v-for="item in order.items" :key="item.name">
            {{ item.name }} x{{ item.quantity }}
          </li>
        </ul>
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
      orders.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    onMounted(fetchOrders);

    return { orders };
  }
};
</script>