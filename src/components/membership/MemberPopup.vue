<template>
  <div class="popup">
    <div class="popup-content">
      <h2>{{ member.id ? 'Edit' : 'Create' }} Member</h2>
      <label class="">
        First Names:
        <input v-model="member.firstName" type="text" class="wideInput" />
      </label>
      <label class="">
        Last Names:
        <input v-model="member.lastName" type="text" class="wideInput" />
      </label>

      <!-- join date -->
      <label>
        Join Date:
        <input v-model="member.joinDate" type="date" />
      </label>


      <div class="popup-actions">
        <button class="btn-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="saveMember">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  props: {
    member: Object,
    users: Array
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const member = ref({ ...props.member });

    watch(() => props.member, (newVal) => {
      member.value = { ...newVal };
    });

    const saveMember = () => {
      emit("save", member.value);
    };

    return { member, saveMember };
  }
};
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
   top: 0;
  left: 0; 
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
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