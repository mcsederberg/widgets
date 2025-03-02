<template>
  <div>
    <h2>Menu</h2>
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

export default {
  setup() {
    const menuItems = ref([]);
    const newItem = ref({ name: '', price: 0 });

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

    return { menuItems, newItem, addItem };
  }
};
</script>