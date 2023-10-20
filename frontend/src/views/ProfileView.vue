<template>
  <div v-if="$pkFileManager.user.value">
    <n-form :model="$pkFileManager.user.value" label-placement="left" label-width="auto">
      <n-form-item label="用户ID">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.id }}</n-tag>
      </n-form-item>
      <n-form-item label="用户名">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.username }}</n-tag>
      </n-form-item>
      <n-form-item label="邮箱">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.email }}</n-tag>
      </n-form-item>
      <n-form-item label="用户凭证">
        <n-data-table
            :bordered="false"
            :single-line="false"
            :columns="credentialsColumns"
            :data="$pkFileManager.user.value.credentials"
            :pagination="{ pageSize: 5 }"
        />
      </n-form-item>
    </n-form>
    <n-popconfirm @positive-click="handleLogout" :positive-button-props="{ type: 'error' }" :negative-text="null">
      <template #trigger>
        <n-button type="error">退出登录</n-button>
      </template>
      确定退出登录吗？
    </n-popconfirm>
    <n-button @click="$pkFileManager.registerNewKey">
      注册新密钥
    </n-button>
  </div>
  <div v-else>
    <n-skeleton text :repeat="2"/>
  </div>
</template>

<script setup>

import {onMounted, ref, inject} from 'vue';
import {useRouter} from 'vue-router';
import {NSkeleton, NButton, NPopconfirm, NForm, NFormItem, NTag, NDataTable} from 'naive-ui';

const router = useRouter();
const $pkFileManager = inject('$pkFileManager');

const credentialsColumns = [
  {
    title: '凭证ID',
    key: 'id',
  },
  {
    title: '凭证类型',
    key: 'type',
  }
]

onMounted(() => {
  if ($pkFileManager.user.value === null) {
    $pkFileManager.getMe();
  }
});

const handleLogout = () => {
  $pkFileManager.logout();
};

</script>