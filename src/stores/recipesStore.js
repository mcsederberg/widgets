import { defineStore } from "pinia";

export const useRecipesStore = defineStore({
  id: "recipesStore",
  state: () => ({
    useImperial: true,
  }),
  getters: {},
  actions: {
    toggleUseImperial() {
      this.useImperial = !this.useImperial;
    },
  },
});
