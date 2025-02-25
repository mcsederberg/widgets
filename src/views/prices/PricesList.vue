<template>
  <div>
    <h2>Lista de Precios</h2>
    <button @click="showNewPricePopup = true" class="btn-primary">
      Agregar Nuevo Precio
    </button>

    <div class="filters">
      <label for="category">Categoría:</label>
      <select id="category" v-model="selectedCategory">
        <option value="">Todas</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <label for="store">Tienda:</label>
      <select id="store" v-model="selectedStore">
        <option value="">Todas</option>
        <option v-for="store in stores" :key="store" :value="store">{{ store }}</option>
      </select>
    </div>

    <div class="card-container">
      <div v-for="price in filteredPrices" :key="price.id" class="price-card" @click="openModal(price)">
        <h3>{{ price.name }}</h3>
        <p><strong>Categoría:</strong> {{ price.category }}</p>
        <p><strong>Tienda:</strong> {{ price.store }}</p>
        <p><strong>Marca:</strong> {{ price.brand }}</p>
        <p><strong>Precio:</strong> ${{ price.price }}</p>
        <p><strong>Cantidad:</strong> {{ price.quantity }} {{ price.unit }}</p>
        <button @click.stop="deletePrice(price.id)" class="btn-delete">Eliminar</button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Detalles de {{ selectedPrice?.name }}</h3>
        <p><strong>Categoría:</strong> {{ selectedPrice?.category }}</p>
        <p><strong>Tienda:</strong> {{ selectedPrice?.store }}</p>
        <p><strong>Marca:</strong> {{ selectedPrice?.brand }}</p>
        <p><strong>Precio:</strong> ${{ selectedPrice?.price }}</p>
        <p><strong>Cantidad:</strong> {{ selectedPrice?.quantity }} {{ selectedPrice?.unit }}</p>
        <button @click="closeModal" class="btn-secondary">Cerrar</button>
      </div>
    </div>

    <new-price :showPopup="showNewPricePopup" @close="showNewPricePopup = false" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import NewPrice from '@/components/prices/NewPrice.vue';
import { emitter } from '@/services/emitter';

export default {
  components: { NewPrice },
  setup() {
    const prices = ref([]);
    const categories = ['Lácteos', 'Carnes', 'Cereal', 'Verduras', 'Frutas', 'Bebidas'];
    const stores = ref([]);
    const selectedCategory = ref('');
    const selectedStore = ref('');
    const showNewPricePopup = ref(false);
    const showModal = ref(false);
    const selectedPrice = ref(null);

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

    const openModal = (price) => {
      selectedPrice.value = price;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      selectedPrice.value = null;
    };

    const filteredPrices = computed(() => {
      return prices.value.filter(
        p =>
          (!selectedCategory.value || p.category === selectedCategory.value) &&
          (!selectedStore.value || p.store === selectedStore.value)
      );
    });

    onMounted(fetchPrices);

    return {
      prices,
      categories,
      stores,
      selectedCategory,
      selectedStore,
      filteredPrices,
      showNewPricePopup,
      deletePrice,
      showModal,
      selectedPrice,
      openModal,
      closeModal,
    };
  },
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
</style>
