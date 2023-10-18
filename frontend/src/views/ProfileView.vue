<template>
  <div v-if="user">
    <n-form :model="user" label-placement="left" label-width="auto">
      <n-form-item label="用户ID">
        <n-tag :bordered="true">{{ user.id }}</n-tag>
      </n-form-item>
      <n-form-item label="用户名">
        <n-tag :bordered="true">{{ user.name }}</n-tag>
      </n-form-item>
      <n-form-item label="邮箱">
        <n-tag :bordered="true">{{ user.email }}</n-tag>
      </n-form-item>
    </n-form>
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

import { onMounted, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { NSkeleton, NButton, NPopconfirm, NForm, NFormItem, NTag } from 'naive-ui';

const router = useRouter();
const $http = inject('$http');
const $session = inject('$session');
const $token = inject('$token');

const user = ref(null);


onMounted(() => {
  $token.value = $cookies.get('cbo_short_session');
  $http.get('/api/user/me')
    .then((res) => {
      user.value = res.data;
    });
});

const handleLogout = () => {
  $session.logout()
    .then(async () => {
      await router.push('/');
    })
    .catch(err => console.log(err))
};

</script>