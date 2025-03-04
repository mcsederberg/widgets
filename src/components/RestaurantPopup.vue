<template>
  <div class="popup">
    <div class="popup-content">
      <h2>{{ restaurant.id ? 'Edit' : 'Create' }} Restaurant</h2>
      <label>
        Name:
        <input v-model="restaurant.name" type="text" />
      </label>

      <label>
        Owner:
        <select v-model="restaurant.ownerID">
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </label>

      <label>
        Users:
        <ul>
          <li v-for="user in users" :key="user.id" class="user-option">
            <label>
              <input 
                type="checkbox" 
                :value="user.id" 
                v-model="restaurant.userIDs" 
              />
              {{ user.name }}
            </label>
          </li>
        </ul>
      </label>

      <div class="popup-actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="saveRestaurant">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  props: {
    restaurant: Object,
    users: Array
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const restaurant = ref({ ...props.restaurant });

    watch(() => props.restaurant, (newVal) => {
      restaurant.value = { ...newVal };
    });

    const saveRestaurant = () => {
      emit("save", restaurant.value);
    };

    return { restaurant, saveRestaurant };
  }
};
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
  /* top: 0;
  left: 0; */
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}
.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
select {
  margin-left: auto;
}
.user-option {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  margin-right: auto;
  input {
    width: 15px;
  }
}
</style>