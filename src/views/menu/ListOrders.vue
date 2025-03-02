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
            {{ item.name }} - ${{ item.price.toFixed(2) }}
            <button @click="updateQuantity(order, item, 1)">+</button>
            <button @click="updateQuantity(order, item, -1)">-</button>
            <span>x{{ item.quantity }}</span>
            <span>(${{ (item.price * item.quantity).toFixed(2) }})</span>
          </li>
        </ul>

        <p><strong>Total: ${{ order.totalPrice.toFixed(2) }}</strong></p>

        <button @click="saveOrder(order)" v-if="order.modified">Save Changes</button>
        <button @click="deleteOrder(order.id)">Delete Order</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  setup() {
    const orders = ref([]);

    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      orders.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const totalPrice = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { id: doc.id, ...data, totalPrice, modified: false };
      });
    };

    const updateQuantity = (order, item, change) => {
      const targetItem = order.items.find(i => i.name === item.name);
      if (targetItem) {
        targetItem.quantity += change;
        if (targetItem.quantity < 1) targetItem.quantity = 1; // Prevents 0 or negative quantities
        order.totalPrice = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        order.modified = true;
      }
    };

    const saveOrder = async (order) => {
      await updateDoc(doc(db, 'orders', order.id), {
        items: order.items
      });
      order.modified = false;
    };

    const deleteOrder = async (orderId) => {
      if (confirm("Are you sure you want to delete this order?")) {
        await deleteDoc(doc(db, 'orders', orderId));
        orders.value = orders.value.filter(order => order.id !== orderId);
      }
    };

    onMounted(fetchOrders);

    return { orders, updateQuantity, saveOrder, deleteOrder };
  }
};
</script>