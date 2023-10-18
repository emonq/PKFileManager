<template>
  <div v-if="user">
    <h1>欢迎 {{ user.name }}</h1>
  </div>
  <div v-else>
    <n-skeleton text :repeat="2" />
  </div>
</template>

<script setup>

import Corbado from '@corbado/webcomponent';
import { onMounted, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { NSkeleton, NButton } from 'naive-ui';

const router = useRouter();
const $http = inject('$http');

const user = ref(null);
const corbadoProjectID = ref(import.meta.env.VITE_CORBADO_PROJECT_ID);
const session = new Corbado.Session(corbadoProjectID.value);

onMounted(() => {
  $http.get('/api/user/me')
    .then((res) => {
      user.value = res.data;
    });
});

const handleLogout = () => {
  session.logout()
    .then(async () => {
      await router.push('/');
    })
    .catch(err => console.log(err))
};

</script>