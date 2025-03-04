<template>
  <Header></Header>
  <div id="body">
    <!-- <Sidebar>
    </Sidebar> -->
    <router-view></router-view>
  </div>
</template>
<script>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import { auth } from "@/services/firebase";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from 'vue-router'
export default {
  name: 'App',
  components: {
    Header,
    Sidebar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const { currentUser } = storeToRefs(userStore);

    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser.value = user;
      } else {
        currentUser.value = null;
        if (route.path !== '/login') {
          router.push('/login')
        }
      }
    });
  }
}
</script>

<style lang="scss">
:root {
  --header-height: 4em;
  --sidebar-width: 250px;
}

</style>

<style scoped>
#body {
  display: flex;
  gap: 1em;
  padding: 1em;
  margin-top: var(--header-height);
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
