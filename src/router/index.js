import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Home from "@/views/Home.vue";
import MessageTemplate from "@/views/MessageTemplate.vue";

import Recipes from "@/views/Recipes.vue";
import RecipeList from "@/views/recipes/RecipeList.vue";
import RecipeDetail from "@/views/recipes/RecipeDetail.vue";
import RecipeCreate from "@/views/recipes/RecipeCreate.vue";

import Login from "@/views/Login.vue";

import PricesList from "@/views/prices/PricesList.vue";

import Menu from "@/views/menu/Menu.vue";
import CreateOrder from "@/views/menu/CreateOrder.vue";
import ListOrders from "@/views/menu/ListOrders.vue";
import Restaurants from "@/views/menu/Restaurants.vue";

import Membership from "@/views/membership/Membership.vue";
import Clubs from "@/views/membership/Clubs.vue";

const requireAuth = (to, from, next) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      next();
    } else {
      next("/login");
    }
  });
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/messagetemplate",
    name: "MessageTemplate",
    component: MessageTemplate,
  },
  {
    path: "/recipes",
    component: Recipes,
    beforeEnter: requireAuth,
    children: [
      {
        path: "",
        name: "RecipeList",
        component: RecipeList,
      },
      {
        path: "create",
        name: "RecipeCreate",
        component: RecipeCreate,
      },
      {
        path: ":id",
        name: "RecipeDetail",
        component: RecipeDetail,
      },
    ],
  },
  {
    path: "/prices",
    component: PricesList,
    beforeEnter: requireAuth,
    children: [],
  },
  {
    path: "/menu",
    beforeEnter: requireAuth,
    children: [
      {
        path: "",
        name: "Menu",
        component: Menu,
      },
      {
        path: "create-order",
        name: "CreateOrder",
        component: CreateOrder,
      },
      {
        path: "orders",
        name: "ListOrders",
        component: ListOrders,
      },
      {
        path: "restaurants",
        name: "Restaurants",
        component: Restaurants,
      }
    ],
  },
  {
    path: '/membership',
    beforeEnter: requireAuth,
    children: [
      {
        path: "",
        name: "Membership",
        component: Membership,
      },
      {
        path: 'clubs',
        name: 'Clubs',
        component: Clubs,
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;