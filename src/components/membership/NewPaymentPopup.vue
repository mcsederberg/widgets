<template>
  <div class="popup">
    <div class="popup-content popup-content-wide" @click.stop>
      <h2>{{ payment.id ? 'View' : 'Create' }} Payment for {{ member.firstName }}</h2>
      <div class="flex column">
        <div v-for="type in paymentTypes" :key="type.value">
          <label>
            <input v-if="!payment.id" type="checkbox" v-model="payment.types" :value="type.value" />
            <span v-if="payment.id && payment.types.includes(type.value)">✅</span>
            <span v-if="payment.id && !payment.types.includes(type.value)">❌</span>
            {{ type.text }} - ${{ type.price }}
          </label>
        </div>
      </div>

      <label>
        Total:
        <input disabled :value="totalPayment" type="number" />
      </label>


      <div class="popup-actions">
        <button @click="$emit('close')">{{ payment.id ? 'Close' : 'Cancel' }}</button>
        <button v-if="!payment.id" @click="savePayment">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, } from "vue";
import { useMembershipStore } from "@/stores/membershipStore";
import { storeToRefs } from "pinia";

export default {
  props: {
    payment: Object,
    users: Array,
    member: Object,
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const payment = ref({ ...props.payment });
    const membershipStore = useMembershipStore();
    const {
      paymentTypes,
    } = storeToRefs(membershipStore);

    watch(() => props.payment, (newVal) => {
      payment.value = { ...newVal };
    });

    const savePayment = () => {
      emit("save", payment.value);
    };


    const totalPayment = computed(() => {
      return payment.value.types.reduce((acc, type) => {
        const paymentType = paymentTypes.value.find((t) => t.value === type);
        return acc + paymentType.price;
      }, 0);
    })

    return {
      paymentTypes,
      payment,
      savePayment,
      totalPayment,
    };
  }
};
</script>

<style lang="scss" scoped>
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