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

const requireAuth = (to, from, next) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      next();
    } else {
      next("/login"); // Redirect to home or a login page
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
    children: [
      
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
