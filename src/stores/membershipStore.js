import { defineStore } from "pinia";
import { db } from "@/services/firebase"; // Adjust import as needed
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useUserStore } from "@/stores/userStore";

export const useMembershipStore = defineStore({
  id: "membershipStore",
  state: () => ({
    clubs: [],
    members: [],
    currentClubID: null,
    memberPayments: [],
    paymentTypes: [
      { value: "membership", text: "Monthly Fee", price: 700 },
      { value: "lateMembership", text: "Late Fee", price: 50 },
      { value: "chestPiece", text: "Chest Piece", price: 250 },
      { value: "faceMask", text: "Face Mask", price: 250 },
      { value: "gloves", text: "Gloves", price: 250 },
      { value: "tshirt", text: "T-Shirt", price: 250 },
      { value: "belt", text: "Belt", price: 250 },
      { value: "sparringGear", text: "Sparring Gear", price: 250 },
      { value: "uniform", text: "Uniform", price: 250 },
      { value: "other", text: "Other", price: 250 },
    ],
  }),
  getters: {
    userClubs() {
      const user = useUserStore();
      const currentUser = user.currentUser;
      const userID = currentUser.uid;
      return this.clubs.filter((club) => club.userIDs.includes(userID));
    },
    currentClub() {
      return this.clubs.find((club) => club.id === this.currentClubID);
    },
    clubMembers() {
      return this.members.filter(
        (member) => member.clubID === this.currentClubID
      );
    },
  },
  actions: {
    async getMembers() {
      const user = useUserStore();
      const querySnapshot = await getDocs(collection(db, "members"));
      this.members = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async getClubs() {
      const querySnapshot = await getDocs(collection(db, "clubs"));
      this.clubs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (this.userClubs.length == 1) {
        this.currentClubID = this.userClubs[0].id;
      }
    },
    async getMemberPayments() {
      const querySnapshot = await getDocs(collection(db, "memberPayments"));
      this.memberPayments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    init() {
      this.getClubs();
      this.getMembers();
      this.getMemberPayments();
    },
  },
});
