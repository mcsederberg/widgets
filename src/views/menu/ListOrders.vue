<template>
  <div>
    <h2 class="">Orders</h2>

    <nav>
      <template v-if="isAdmin">
        <router-link to="/menu/restaurants">Restaurants</router-link> |
      </template>
      <router-link to="/menu">Menu</router-link> |
      <router-link to="/menu/create-order">Create Order</router-link>
    </nav>
    <div v-if="!currentRestaurant">
      <h3>No restaurant selected</h3>
    </div>
    <template v-else>

      <p><strong>Total Earned: ${{ totalEarned.toFixed(2) }}</strong></p>

      <!-- Date Selector -->
      <label for="order-date" class="mr-4">Select Date:</label>
      <select id="order-date" v-model="selectedDate">
        <option v-for="date in uniqueDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>

      <div class="orders mt-4">
        <div v-for="order in filteredOrders" :key="order.id" class="card" @click="viewOrderID = order.id">
          <strong>{{ order.customer }}</strong>
          <p>Date: {{ formatDate(order.date) }}</p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.name">
                <td>{{ item.name }}</td>
                <td class="quantity">{{ item.quantity }}</td>
                <td>${{ item.price }}</td>
                <td>${{ (item.price * item.quantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Total: ${{ order.totalPrice?.toFixed(2) }}</strong></p>
          <button @click.stop="openEditPopup(order)" class="mr-4">✏️</button>
          <button @click.stop="confirmDelete(order.id)">🗑️</button>
          <!-- <div class="horizontalLine"></div> -->
        </div>
      </div>
      <!-- Edit Order Popup -->
      <div v-if="editingOrder" class="popup">
        <div class="popup-content">
          <h3>Edit Order</h3>
          <p><b>Customer:</b> {{ editingOrder.customer }}</p>

          <ul class="menuItems">
            <li v-for="item in currentRestaurantMenuItems" :key="item.id" class="mb-2">
              <b>{{ item.name }}</b>
              <br>
              ${{ item.price.toFixed(2) }}
              <button class="quantityButton" @click="updateQuantity(item, -1)">-</button>
              <button class="quantityButton mr-4 ml-2" @click="updateQuantity(item, 1)">+</button>
              <span><b>x{{ getItemQuantity(item.id) }}</b></span>
            </li>
          </ul>
          <div class="horizontalLine"></div>
          <p><strong>Total: ${{ editingOrder.totalPrice?.toFixed(2) }}</strong></p>

          <button class="mr-4" @click="saveOrder">Save</button>
          <button @click="editingOrder = null">Cancel</button>
        </div>
      </div>

      <!-- Delete Confirmation Popup -->
      <div v-if="deletingOrderId" class="popup">
        <div class="popup-content">
          <p>Are you sure you want to delete this order?</p>
          <button class="mr-4" @click="deleteOrder">Yes, Delete</button>
          <button @click="deletingOrderId = null">Cancel</button>
        </div>
      </div>

      <!-- View popup -->
      <div class="popupBackground" v-if="viewOrderID" @click="viewOrderID = null"></div>
      <div v-if="viewOrderID" class="popup">
        <div class="popup-content">
          <h3>Order Details</h3>
          <p><b>Customer:</b> {{ viewOrder.customer }}</p>
          <p><b>Date:</b> {{ formatDate(viewOrder.date) }}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in viewOrder.items" :key="item.name">
                <td class="nameCell">{{ item.name }}</td>
                <td class="quantity">{{ item.quantity }}</td>
                <td>${{ item.price }}</td>
                <td>${{ (item.price * item.quantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Total: ${{ viewOrder.totalPrice?.toFixed(2) }}</strong></p>
          <button @click="viewOrderID = null">Close</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

import { useUserStore } from "@/stores/userStore";
import { useRestaurantStore } from '@/stores/restaurantStore';
import { storeToRefs } from "pinia";

export default {
  setup() {
    const userStore = useUserStore();
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);
    const restaurantStore = useRestaurantStore();
    restaurantStore.init();
    const {
      currentRestaurantMenuItems,
      currentRestaurant,
      currentRestaurantOrders,
      orders,
    } = storeToRefs(restaurantStore);

    const editingOrder = ref(null);
    const deletingOrderId = ref(null);
    const selectedDate = ref(new Date().toISOString().split('T')[0]); // Default to today

    watch(currentRestaurant, () => {

      if (currentRestaurantOrders.value.length) {
        selectedDate.value = currentRestaurantOrders.value[0].date.split('T')[0];
      }
    })

    const totalEarned = computed(() => {
      return filteredOrders.value.reduce((sum, order) => sum + order.totalPrice, 0);
    });

    // Filter orders by selected date
    const filteredOrders = computed(() => {
      return currentRestaurantOrders.value.filter(order => order.date?.split('T')[0] === selectedDate.value);
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
      restaurantStore.getOrders(); // Refresh list
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

    // // Extract unique dates (formatted)
    const uniqueDates = computed(() => {
      return [...new Set(currentRestaurantOrders.value.map(order => order.date?.split('T')[0]))].sort();
    });

    const viewOrderID = ref(null);

    const viewOrder = computed(() => {
      return orders.value.find(order => order.id === viewOrderID.value);
    });

    // Format date to YYYY-MM-DD
    const formatDate = (isoDate) => {
      return isoDate.split('T')[0];
    };
    return {
      orders,
      currentRestaurantMenuItems,
      selectedDate,
      currentRestaurant,
      totalEarned,
      filteredOrders,
      editingOrder,
      deletingOrderId,
      openEditPopup,
      updateQuantity,
      getItemQuantity,
      isAdmin,
      saveOrder,
      confirmDelete,
      deleteOrder,
      viewOrder,
      formatDate,
      viewOrderID,
      uniqueDates,

    };
  }
};
</script>

<style scoped>
.orders {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
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

th {
  text-align: left;
}

.quantity {
  text-align: center;
}

</style>

<style>
.nameCell {
  text-align: left;
}

</style>