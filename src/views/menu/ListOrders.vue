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

        <button @click="openEditPopup(order)">✏️</button>
        <button @click="confirmDelete(order.id)">🗑️</button>
      </li>
    </ul>

    <!-- Edit Order Popup -->
    <div v-if="editingOrder" class="popup">
      <div class="popup-content">
        <h3>Edit Order</h3>
        <p>Customer: {{ editingOrder.customer }}</p>

        <ul>
          <li v-for="item in editingOrder.items" :key="item.name">
            {{ item.name }} - ${{ item.price.toFixed(2) }}
            <button @click="updateQuantity(item, 1)">+</button>
            <button @click="updateQuantity(item, -1)">-</button>
            <span>x{{ item.quantity }}</span>
          </li>
        </ul>

        <p><strong>Total: ${{ editingOrder.totalPrice.toFixed(2) }}</strong></p>

        <button @click="saveOrder">Save</button>
        <button @click="editingOrder = null">Cancel</button>
      </div>
    </div>

    <!-- Delete Confirmation Popup -->
    <div v-if="deletingOrderId" class="popup">
      <div class="popup-content">
        <p>Are you sure you want to delete this order?</p>
        <button @click="deleteOrder">Yes, Delete</button>
        <button @click="deletingOrderId = null">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  setup() {
    const orders = ref([]);
    const editingOrder = ref(null);
    const deletingOrderId = ref(null);

    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      orders.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const totalPrice = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { id: doc.id, ...data, totalPrice };
      });
    };

    const openEditPopup = (order) => {
      editingOrder.value = JSON.parse(JSON.stringify(order)); // Clone to avoid modifying original data
    };

    const updateQuantity = (item, change) => {
      item.quantity += change;
      if (item.quantity < 1) item.quantity = 1; // Prevent negative quantities
      editingOrder.value.totalPrice = editingOrder.value.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
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

    onMounted(fetchOrders);

    return { orders, editingOrder, deletingOrderId, openEditPopup, updateQuantity, saveOrder, confirmDelete, deleteOrder };
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
</style>