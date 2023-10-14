<template>
  <p>{{ loading }}</p>
  <div v-if="loading">

    <n-skeleton text :repeat="2"/>
  </div>
  <div v-else>
    <div v-if="user">
      <h1>Profile Page</h1>
      <p>
        User-ID: {{ user.userID }}
        <br/>
        Email: {{ user.email }}
      </p>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else>
      <p>你还没有登录{{ loading }}</p>
      <p>点击<a @click="redirectToAuth">此处</a>前往登录</p>
    </div>
  </div>

</template>
<script setup>
import Corbado from '@corbado/webcomponent';
import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {NSkeleton} from 'naive-ui';
import axios from 'axios';

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const corbadoProjectID = ref(import.meta.env.VITE_CORBADO_PROJECT_ID);
const session = new Corbado.Session(corbadoProjectID.value);
const backendUrl = import.meta.env.VITE_BACKEND_URL;

onMounted(() => {
  axios.get(`${backendUrl}/api/user/me`).then((res) => {
    console.log(res);
  })
  session.refresh(u => {
    if (u === null) {
      console.log("not logged in");
    }
    console.log(u);
    user.value = u;
    loading.value = false;
  });
  if (!session.isAuthed()) {
    loading.value = false;
  }
})
const handleLogout = () => {
  session.logout()
      .then(async () => {
        await router.push('/');
      })
      .catch(err => console.log(err))
};

const redirectToAuth = () => {
  router.push('/auth');
};


</script>