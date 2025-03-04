<template>
  <div>
    <h2>Orders</h2>

    <nav>
      <router-link to="/menu">Menu</router-link> |
      <router-link to="/menu/create-order">Create Order</router-link>
    </nav>

    <p><strong>Total Earned: ${{ totalEarned.toFixed(2) }}</strong></p>

    <!-- Date Selector -->
    <label for="order-date">Select Date:</label>
    <select id="order-date" v-model="selectedDate">
      <option v-for="date in uniqueDates" :key="date" :value="date">
        {{ date }}
      </option>
    </select>

    <ul>
      <li v-for="order in filteredOrders" :key="order.id">
        <strong>{{ order.customer }}</strong>
        <p>Date: {{ order.date }}</p>

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
import { ref, onMounted, computed } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  setup() {
    const orders = ref([]);
    const menuItems = ref([]);
    const editingOrder = ref(null);
    const deletingOrderId = ref(null);
    const selectedDate = ref(new Date().toISOString().split('T')[0]); // Default to today
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      orders.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const totalPrice = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { id: doc.id, ...data, totalPrice };
      });
    };

    const fetchMenuItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      menuItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const totalEarned = computed(() => {
      return filteredOrders.value.reduce((sum, order) => sum + order.totalPrice, 0);
    });

    const filteredOrders = computed(() => {
      return orders.value.filter(order => order.date === selectedDate.value);
    });

    const openEditPopup = (order) => {
      editingOrder.value = { ...order, items: JSON.parse(JSON.stringify(order.items)) };
    };

    const updateQuantity = (item, change) => {
      const orderItem = editingOrder.value.items.find(i => i.id === item.id);
      if (!orderItem) {
        if (change > 0) {
          editingOrder.value.items.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
        }
      } else {
        orderItem.quantity += change;
        if (orderItem.quantity < 1) {
          editingOrder.value.items = editingOrder.value.items.filter(i => i.id !== item.id);
        }
      }
      editingOrder.value.totalPrice = editingOrder.value.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    };

    const getItemQuantity = (id) => {
      const item = editingOrder.value?.items.find(i => i.id === id);
      return item ? item.quantity : 0;
    };

    const saveOrder = async () => {
      const orderRef = doc(db, 'orders', editingOrder.value.id);
      await updateDoc(orderRef, { items: editingOrder.value.items });
      editingOrder.value = null;
      fetchOrders(); // Refresh list
    };

    const confirmDelete = (orderId) => {
      deletingOrderId.value = orderId;
    };

    const deleteOrder = async () => {
      if (deletingOrderId.value) {
        await deleteDoc(doc(db, 'orders', deletingOrderId.value));
        orders.value = orders.value.filter(order => order.id !== deletingOrderId.value);
        deletingOrderId.value = null;
      }
    };

// Extract unique dates
    const uniqueDates = computed(() => {
      return [...new Set(orders.value.map(order => order.date))].sort();
    });

    onMounted(async () => {
      await fetchOrders();
      await fetchMenuItems();
    });

    return {
      orders,
      menuItems,
      selectedDate,
      totalEarned,
      filteredOrders,
      editingOrder,
      deletingOrderId,
      openEditPopup,
      updateQuantity,
      getItemQuantity,
      saveOrder,
      confirmDelete,
      deleteOrder,
      fetchOrders,

      
      uniqueDates,
      
    };
  }
};
</script>

<style>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
.popup-content {
  text-align: center;
}

.menuItems {
  list-style: none;
  padding: 0;
  height: 600px;
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
</style>