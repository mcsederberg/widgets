<template>
  <div>
    <h1>Manage Clubs</h1>
    <nav>
      <template v-if="isAdmin">
        <router-link to="/membership/clubs">Clubs</router-link> |
      </template>
      <router-link to="/membership">Membership</router-link> |
      <router-link to="/membership/">View Members</router-link> |
      <!-- <router-link to="/membership/create-order">Create Order</router-link> -->
    </nav>
    <button class="my-4" @click="openCreatePopup">Add Club</button>
    
    <div class="club-list">
      <div v-for="club in clubs" :key="club.id" class="club-card card" @click="openEditPopup(club)">
        <h3>{{ club.name }}</h3>
        <p>Owner: {{ getUserName(club.ownerID) }}</p>
      </div>
    </div>

    <ClubPopup 
      v-if="showPopup" 
      :club="selectedClub" 
      :users="users" 
      @close="closePopup" 
      @save="saveClub" 
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import ClubPopup from "@/components/membership/ClubPopup.vue";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

export default {
  components: { ClubPopup },
  setup() {
    const userStore = useUserStore();
    const {
      currentUser,
      isAdmin,
    } = storeToRefs(userStore);
    const clubs = ref([]);
    const users = ref([]);
    const showPopup = ref(false);
    const selectedClub = ref(null);

    const fetchClubs = async () => {
      const querySnapshot = await getDocs(collection(db, "clubs"));
      clubs.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const openEditPopup = (club) => {
      selectedClub.value = { ...club };
      showPopup.value = true;
    };

    const openCreatePopup = () => {
      selectedClub.value = { name: "", ownerID: "", userIDs: [] };
      showPopup.value = true;
    };

    const closePopup = () => {
      showPopup.value = false;
      selectedClub.value = null;
    };

    const saveClub = async (club) => {
      if (club.id) {
        await updateDoc(doc(db, "clubs", club.id), club);
      } else {
        await addDoc(collection(db, "clubs"), club);
      }
      closePopup();
      fetchClubs();
    };

    const getUserName = (userID) => {
      const user = users.value.find(user => user.id === userID);
      return user ? user.name : "Unknown";
    };

    onMounted(() => {
      fetchClubs();
      fetchUsers();
    });

    return {
      clubs,
      users,
      showPopup,
      selectedClub,
      isAdmin,
      openEditPopup,
      openCreatePopup,
      closePopup,
      saveClub,
      getUserName
    };
  }
};
</script>

<style>
.club-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.club-card {
  border: 1px solid #ccc;
  padding: 10px;
  cursor: pointer;
}
</style>
