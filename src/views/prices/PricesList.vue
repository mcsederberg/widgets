<template>
  <div>
    <h2>Price List</h2>
    <button @click="showNewPricePopup = true" class="btn-primary">
      Add new Price
    </button>

    <div class="filters">
      <label for="category">Category:</label>
      <select id="category" v-model="selectedCategory">
        <option value="">All</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <label for="store">Store:</label>
      <select id="store" v-model="selectedStore">
        <option value="">All</option>
        <option v-for="store in stores" :key="store" :value="store">{{ store }}</option>
      </select>
    </div>

    <div class="card-container">
      <div v-for="price in filteredPrices" :key="price.id" class="price-card" @click="openDeleteModal(price.name)">
        <h3>{{ price.name }}</h3>
        <p><strong>Category:</strong> {{ price.category }}</p>
        <p><strong>Store:</strong> {{ price.store }}</p>
        <p><strong>Brand:</strong> {{ price.brand }}</p>
        <p><strong>Price:</strong> ${{ price.price }}</p>
        <p><strong>Quantity:</strong> {{ price.quantity }} {{ price.unit }}</p>
        <button @click.stop="deletePrice(price.id)" class="btn-delete">Delete</button>
        <button @click.stop="openModifyModal(price)" class="btn-secondary">Edit</button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal" @click.stop>
        <h3>Comparison of {{ selectedProductName }}</h3>
        <p v-for="product in comparedPrices" :key="product.id">
          <strong>{{ product.store }} ({{ product.brand }}):</strong>
          ${{ product.price }} for {{ product.quantity }} {{ product.unit }}
          <br>
          (Base price: ${{ product.comparablePrice.toFixed(2) }} for 1g/ml)
        </p>
        <div class="horizontalLine"></div>
        <p><strong>Best Price:</strong> {{ bestPrice?.store }} - ${{ bestPrice?.originalPrice }} for {{
          bestPrice?.originalQuantity }} {{ bestPrice?.originalUnit }}</p>
        <button @click="closeDeleteModal" class="btn-secondary">Close</button>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <h3>Edit Price of {{ selectedProduct.name }}</h3>
        <form @submit.prevent="modifyPrice(selectedProduct.id)">
          <label>Name:
            <input v-model="selectedProduct.name" required />
          </label>
          <label>Category:
            <select v-model="selectedProduct.category" required>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </label>
          <label>Store:
            <input type="text" v-model="selectedProduct.store" list="store-list" required />
            <datalist id="store-list">
              <option v-for="store in stores" :key="store" :value="store" />
            </datalist>
          </label>
          <label>Brand:
            <input type="text" v-model="selectedProduct.brand" />
          </label>
          <label>Price:
            <input type="number" v-model.number="selectedProduct.price" required />
          </label>
          <label>Quantity:
            <input type="number" v-model.number="selectedProduct.quantity" required class="quantityInput" />
            <select v-model="selectedProduct.unit">
              <option v-for="option in units" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <label>Date (optional):
            <input type="date" v-model="selectedProduct.date" />
          </label>
          <button type="submit">Save</button>
          <button type="button" @click="closeEditModal">Cancel</button>
        </form>

      </div>
    </div>
    <new-price :showPopup="showNewPricePopup" @close="showNewPricePopup = false" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, getDoc, deleteDoc, addDoc, doc } from 'firebase/firestore';
import NewPrice from '@/components/prices/NewPrice.vue';
import { emitter } from '@/services/emitter';

const unitConversions = {
  g: 1, kg: 1000, oz: 28.35, lb: 453.59,
  ml: 1, L: 1000,
};

export default {
  components: { NewPrice },
  setup() {
    const prices = ref([]);
    const categories = ['Dairy', 'Meat', 'Cereal', 'Vegetables', 'Fruits', 'Drinks', 'Bread', 'Sweets', 'Snacks', 'Soaps', 'Cleaning', 'Other'];
    const stores = ref([]);
    const selectedCategory = ref('');
    const units = ['unit', 'ml', 'L', 'g', 'kg', 'oz', 'lb'];
    const selectedStore = ref('');
    const showNewPricePopup = ref(false);
    const showDeleteModal = ref(false);
    const showEditModal = ref(false);
    const selectedProductName = ref('');
    const selectedProduct = ref(null);

    const fetchPrices = async () => {
      const querySnapshot = await getDocs(collection(db, 'prices'));
      prices.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      stores.value = [...new Set(prices.value.map(p => p.store))];
    };

    emitter.on('price-added', fetchPrices);

    const deletePrice = async (id) => {
      await deleteDoc(doc(db, 'prices', id));
      await fetchPrices();
    };

    const modifyPrice = async (id) => {
      await deleteDoc(doc(db, 'prices', id));
      await addDoc(collection(db, 'prices'), selectedProduct.value);
      await fetchPrices();
      closeEditModal();
    };

    const openDeleteModal = (productName) => {
      selectedProductName.value = productName;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedProductName.value = '';
    };

    const openModifyModal = (product) => {
      selectedProduct.value = product;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      selectedProductName.value = '';
    };

    const filteredPrices = computed(() => {
      return prices.value.filter(p =>
        (!selectedCategory.value || p.category === selectedCategory.value) &&
        (!selectedStore.value || p.store === selectedStore.value)
      );
    });

    const comparedPrices = computed(() => {
      return prices.value.filter(p => p.name.toLowerCase() === selectedProductName.value.toLowerCase()).map(p => {
        const baseUnit = unitConversions[p.unit] || 1;
        const comparablePrice = p.price / (p.quantity * baseUnit);
        return { ...p, comparablePrice, originalPrice: p.price, originalQuantity: p.quantity, originalUnit: p.unit };
      }).sort((a, b) => a.comparablePrice - b.comparablePrice);
    });

    const bestPrice = computed(() => comparedPrices.value[0] || null);

    onMounted(fetchPrices);

    return {
      bestPrice,
      categories,
      closeDeleteModal,
      closeEditModal,
      comparedPrices,
      deletePrice,
      filteredPrices,
      modifyPrice,
      units,
      openDeleteModal,
      openModifyModal,
      prices,
      selectedCategory,
      selectedProduct,
      selectedProductName,
      selectedStore,
      showDeleteModal,
      showEditModal,
      showNewPricePopup,
      stores,
    };
  }
};
</script>


<style>
body {
  /* background-color: #f8f9fa; */
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.price-card {
  background: #ffffff;
  color: #333;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.price-card:hover {
  transform: scale(1.03);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
  width: 320px;
}

.btn-primary,
.btn-delete,
.btn-secondary {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  margin-top: 10px;
  display: block;
}

.horizontalLine {
  border-top: 1px solid #ccc;
  margin: 10px 0;
}
</style>
