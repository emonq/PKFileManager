<template>
  <div v-if="user">
    <p>欢迎{{ user.name }}</p>
    <p>{{ user.id }}</p>
    <p>{{ user.email }}</p>
    <n-popconfirm @positive-click="handleLogout" :positive-button-props="{ type: 'error' }" :negative-text="null">
      <template #trigger>
        <n-button type="error">退出登录</n-button>
      </template>
      确定退出登录吗？
    </n-popconfirm>
  </div>
  <div v-else>
    <n-skeleton text :repeat="2" />
  </div>
</template>

<script setup>

import Corbado from '@corbado/webcomponent';
import { onMounted, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { NSkeleton, NButton, NPopconfirm } from 'naive-ui';

const router = useRouter();
const $http = inject('$http');

const user = ref(null);
const corbadoProjectID = ref(import.meta.env.VITE_CORBADO_PROJECT_ID);
const session = new Corbado.Session(corbadoProjectID.value);

onMounted(() => {
  session.refresh((u) => { });
  const token = $cookies.get('cbo_short_session');
  $http.updateToken(token);
  $http.get('/api/user/me')
    .then((res) => {
      console.log(res.data);
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