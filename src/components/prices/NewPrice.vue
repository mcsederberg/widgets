<template>
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup">
      <h2>Nuevo Precio</h2>
      <form @submit.prevent="savePrice">
        <label>Nombre:
          <input  v-model.number="name" required />
        </label>

        <label>Precio:
          <input type="number" v-model.number="price" required />
        </label>

        <label>Cantidad:
          <input type="number" v-model.number="quantity" required class="quantityInput" />
          <select v-model="unit">
            <option v-for="option in units" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label>Tienda:
          <input type="text" v-model="store" list="store-list" required />
          <datalist id="store-list">
            <option v-for="store in previousStores" :key="store" :value="store" />
          </datalist>
        </label>

        <label>Marca:
          <input type="text" v-model="brand" />
        </label>

        <label>Fecha (opcional):
          <input type="date" v-model="date" />
        </label>

        <label>Categoría:
          <select class="soloSelect" v-model="category" required>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </label>

        <button type="submit">Guardar</button>
        <button type="button" @click="closePopup">Cancelar</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { emitter } from '@/services/emitter';

export default {
  props: { showPopup: Boolean },
  setup(props, { emit }) {
    const price = ref(null);
    const quantity = ref(null);
    const unit = ref('unit');
    const store = ref('');
    const date = ref('');
    const brand = ref('');
    const category = ref('');
    const units = ['unit', 'ml', 'L', 'g', 'kg', 'oz', 'lb'];
    const categories = ['Lácteos', 'Carnes', 'Cereal', 'Verduras', 'Frutas', 'Bebidas', 'Pan', 'Dulces', 'Snacks', 'Jabones', 'Limpieza', 'Otros'];
    const previousStores = ref([]);
    const name = ref('');

    const fetchStores = async () => {
      const querySnapshot = await getDocs(collection(db, 'stores'));
      previousStores.value = querySnapshot.docs.map(doc => doc.data().name);
    };

    const savePrice = async () => {
      await addDoc(collection(db, 'prices'), {
        price: price.value,
        quantity: quantity.value,
        unit: unit.value,
        store: store.value,
        name: name.value,
        brand: brand.value || null,
        date: date.value || null,
        category: category.value,
        timestamp: new Date()
      });
      emitter.emit('price-added');
      emit('close');
    };

    const closePopup = () => {
      emit('close');
    };

    onMounted(fetchStores);

    return {
      price, quantity, unit, store, date, category,
      units, categories, previousStores, brand, name,
      savePrice, closePopup
    };
  }
};
</script>

<style>
.popup-overlay {
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

form {
  display: flex;
  flex-direction: column;
}

button {
  margin-bottom: 4px;
}

input, .soloSelect {
  margin-left: auto;
  width: 60%;
}

.quantityInput {
  width: 45%;
}

label {
  margin-bottom: 8px;
  display: flex;
}

.popup {
  background: white;
  color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}
</style>
