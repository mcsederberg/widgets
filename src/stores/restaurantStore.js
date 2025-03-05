import { defineStore } from "pinia";
import { db } from "@/services/firebase"; // Adjust import as needed
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useUserStore } from "@/stores/userStore";

export const useRestaurantStore = defineStore({
  id: "restaurantStore",
  state: () => ({
    restaurants: [],
    userRestaurants: [],
    currentRestaurantID: null,

    menuItems: [],
    orders: [],
  }),
  getters: {
    currentRestaurant() {
      return this.restaurants.find(
        (restaurant) => restaurant.id === this.currentRestaurantID
      );
    },
    currentRestaurantMenuItems() {
      return this.menuItems.filter(
        (menuItem) => menuItem.restaurantID === this.currentRestaurantID
      );
    },
    currentRestaurantOrders() {
      return this.orders.filter(
        (order) => order.restaurantID === this.currentRestaurantID
      );
    },
  },
  actions: {
    async getRestaurants() {
      const user = useUserStore();
      const querySnapshot = await getDocs(collection(db, "restaurants"));
      this.restaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const currentUser = user.currentUser;

      const userID = currentUser.uid;

      this.userRestaurants = this.restaurants.filter((restaurant) =>
        restaurant.userIDs.includes(userID)
      );
      if (this.userRestaurants.length == 1) {
        this.currentRestaurantID = this.userRestaurants[0].id;
      }
    },
    async getMenuItems() {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      this.menuItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async getOrders() {
      const querySnapshot = await getDocs(collection(db, "orders"));
      this.orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, totalPrice: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
      });
    },
    init() {
      this.getRestaurants();
      this.getMenuItems();
      this.getOrders();
    },
  },
});
