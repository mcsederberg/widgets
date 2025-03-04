import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    currentUser: null
  }),
  getters: {
    isAdmin() {
      return this.currentUser?.uid === "zt20uL7Ra5SOvy2AfSfkwaup3Lv1";
    },
  },
  actions: {
    
  },
});
