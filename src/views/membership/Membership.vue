<template>
  <div>
    <h1>Manage Members</h1>
    <nav>
      <template v-if="isAdmin">
        <router-link to="/membership/clubs">Clubs</router-link>
        <!-- | -->
      </template>
      <!-- <router-link to="/membership">Membership</router-link>  -->
      <!-- | -->
      <!-- <router-link to="/membership/">View Members</router-link> | -->
      <!-- <router-link to="/membership/create-order">Create Order</router-link> -->
    </nav>
    <div class="row">
      <button class="my-4 mr-4" @click="openCreatePopup">Add Member</button>
      <!-- active only / all toggle -->
      <button @click="showAll = !showAll" class="btn-secondary">
        {{ showAll ? 'Show Active Only' : 'Show All' }}
      </button>
    </div>

    <div class="member-list">
    <div v-if="!currentClubID">
      <h3>No club selected</h3>
    </div>
      <div v-for="member in filteredMembers" :key="member.id" class="member-card card" @click="openEditPopup(member)">
        <h3>{{ member.firstName }} {{ member.lastName }}</h3>
        <p>Join Date: {{ prettyDate(member.joinDate) }}</p>
        <p>Has paid this month: {{ hasPaid(member) ? '✅' : '❌' }}</p>
        <p>Belt: {{ member.belt }}</p>
        <div class="row">
          <!-- edit and delete buttons -->
          <!-- <button @click.stop="openEditPopup(member)" class="mr-4 btn-secondary">✏️</button> -->
          <button v-if="member.active" @click.stop="deactivate(member)" class="mr-4 btn-secondary">🔒</button>
          <button v-else @click.stop="activate(member)" class="mr-4 btn-secondary"> 🔓 </button>
          <button @click.stop="confirmDelete(member)" class="btn-secondary">🗑️</button>
        </div>
      </div>
    </div>


    <!-- View popup -->
    <div class="popupBackground" v-if="viewMemberID" @click="viewMemberID = null"></div>
    <div v-if="viewMemberID" class="popup " @click="viewMemberID = null">
      <div class="popup-content popup-content-wide" @click.stop>
        <h3>Member Details</h3>
        <p><b>Name:</b> {{ viewMember.name }}</p>
        <p><b>Join Date:</b> {{ prettyDate(viewMember.joinDate) }}</p>
        <p><b>Belt:</b> {{ viewMember.belt }} <button class="btn-secondary"
            @click.stop="advanceBelt(viewMember)">Advance</button></p>
        <div class="align-center row">
          <b class="mr-4">Payments</b>
          <button @click.stop="newPayment">New</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Items</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Delivered</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentMemberPayments" :key="item.name">
              <td class="nameCell">{{ item.types.length }}
                <button class="btn-secondary" @click="viewPayment(item)">🔍</button>
              </td>
              <td class="amount">{{ getAmount(item) }}</td>
              <td>{{ prettyDate(item.date) }}</td>
              <td>
                {{ item.delivered ? 'Yes' : 'No' }}
                <button v-if="!item.delivered" class="btn-secondary" @click="markAsDelivered(item)">✅</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="viewMemberID = null">Close</button>
      </div>
    </div>

    <!-- Delete Confirmation Popup -->
    <div v-if="deletingMemberId" class="popup">
      <div class="popup-content">
        <p>Are you sure you want to delete <b>{{ deletingMember.firstName }}</b>?</p>
        <div class="row">
          <button class="mr-4" @click="deleteMember">Yes, Delete</button>
          <button @click="deletingMemberId = null">Cancel</button>
        </div>
      </div>
    </div>
    <MemberPopup v-if="showPopup" :member="selectedMember" :users="users" @close="closePopup" @save="saveMember" />
    <NewPaymentPopup v-if="showPaymentPopup" :payment="memberPayment" :member="viewMember" @close="closePaymentPopup"
      @save="savePayment" />
  </div>
</template>

<script>
import { ref, onMounted, computed, } from "vue";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

import { useMembershipStore } from "@/stores/membershipStore";
import MemberPopup from "@/components/membership/MemberPopup.vue";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import NewPaymentPopup from "@/components/membership/NewPaymentPopup.vue";

export default {
  name: "Membership",
  components: {
    MemberPopup,
    NewPaymentPopup,
  },
  setup() {
    const userStore = useUserStore();
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);
    const users = ref([]);
    const showPopup = ref(false);
    const selectedMember = ref(null);

    const membershipStore = useMembershipStore();

    const {
      currentClubID,
      paymentTypes,
      members,
      clubMembers,
      memberPayments,
    } = storeToRefs(membershipStore);


    const openCreatePopup = () => {
      selectedMember.value = {};
      showPopup.value = true;
    };

    const closePopup = () => {
      showPopup.value = false;
      selectedMember.value = null;
    };

    const saveMember = async (member) => {
      // add clubID to member
      member.clubID = member.clubID ? member.clubID : currentClubID.value;
      member.belt = 'White';
      member.active = true;
      if (member.id) {
        await updateDoc(doc(db, "members", member.id), member);
      } else {
        await addDoc(collection(db, "members"), member);
      }
      closePopup();
      membershipStore.getMembers();
    }


    const deletingMemberId = ref(null);
    const deletingMember = ref(null);
    const confirmDelete = (member) => {
      const memberID = member.id;
      deletingMember.value = member;
      deletingMemberId.value = memberID;
    };

    const deleteMember = async () => {
      await deleteDoc(doc(db, "members", deletingMemberId.value));
      deletingMemberId.value = null;
      membershipStore.getMembers();
    };

    const getUserName = (userID) => {
      const user = users.value.find(user => user.id === userID);
      return user ? user.name : "Unknown";
    };

    const viewMemberID = ref(null);
    const viewMember = ref(null);

    const openEditPopup = (member) => {
      viewMember.value = { ...member };
      viewMemberID.value = member.id;
    };

    const prettyDate = (date) => {
      return new Date(date + "T00:00:00").toLocaleDateString();
    }
    onMounted(() => {
      membershipStore.init();
    });

    const markAsDelivered = (item) => {
      item.delivered = true;
      updateDoc(doc(db, "memberPayments", item.id), item);
    }

    const showPaymentPopup = ref(false);
    const newPayment = () => {
      memberPayment.value = {
        memberID: viewMember.value.id,
        date: new Date().toISOString().split('T')[0],
        types: [],
        amount: 0,
        delivered: false,
      };
      showPaymentPopup.value = true;
    }

    const memberPayment = ref(null);
    const closePaymentPopup = () => {
      showPaymentPopup.value = false;
      memberPayment.value = null;
    }

    const savePayment = async (payment) => {
      if (payment.id) {
        await updateDoc(doc(db, "memberPayments", payment.id), payment);
      } else {
        await addDoc(collection(db, "memberPayments"), payment);
      }
      closePaymentPopup();
    }

    const currentMemberPayments = computed(() => {
      return memberPayments.value.filter(payment => payment.memberID === viewMember.value.id);
    })

    const getAmount = (payment) => {
      return payment.types.reduce((acc, type) => {
        const paymentType = paymentTypes.value.find((t) => t.value === type);
        return acc + paymentType.price;
      }, 0);
    }

    const viewPayment = (payment) => {
      memberPayment.value = payment;
      showPaymentPopup.value = true;
    }

    const hasPaid = (member) => {
      const thisMonth = new Date().toISOString().split('-').slice(0, 2).join('-');
      return memberPayments.value.some(payment => payment.memberID === member.id && payment.date.startsWith(thisMonth));
    }

    const deactivate = async (member) => {
      member.active = false;
      await updateDoc(doc(db, "members", member.id), member);
      membershipStore.getMembers();
    }

    const activate = async (member) => {
      member.active = true;
      await updateDoc(doc(db, "members", member.id), member);
      membershipStore.getMembers();
    }

    const showAll = ref(false);

    const filteredMembers = computed(() => {
      return clubMembers.value.filter(member => showAll.value ? true : member.active);
    });

    const advanceBelt = async (member) => {
      const belts = [
        'White',
        "Advanced White",
        'Yellow',
        "Advanced Yellow",
        'Orange',
        "Advanced Orange",
        'Green',
        'Advanced Green',
        'Blue',
        'Advanced Blue',
        'Purple',
        'Advanced Purple',
        'Brown',
        'Advanced Brown',
        'Black'];
      const currentBelt = member.belt;
      const currentIndex = belts.indexOf(currentBelt);
      if (currentIndex < belts.length - 1) {
        member.belt = belts[currentIndex + 1];
        await updateDoc(doc(db, "members", member.id), member);
        membershipStore.getMembers();
      }
    }

    return {
      showAll,
      filteredMembers,
      activate,
      advanceBelt,
      deactivate,
      hasPaid,
      closePaymentPopup,
      closePopup,
      clubMembers,
      confirmDelete,
      currentMemberPayments,
      currentClubID,
      deleteMember,
      deletingMember,
      deletingMemberId,
      getAmount,
      getUserName,
      isAdmin,
      markAsDelivered,
      memberPayment,
      memberPayments,
      members,
      newPayment,
      openCreatePopup,
      openEditPopup,
      paymentTypes,
      prettyDate,
      saveMember,
      savePayment,
      selectedMember,
      showPaymentPopup,
      showPopup,
      users,
      viewMember,
      viewMemberID,
      viewPayment,
    };
  }
};
</script>

<style>
.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.member-card {
  border: 1px solid #ccc;
  padding: 10px;
  cursor: pointer;
}
</style>
