<template>
  <div v-if="$pkFileManager.user.value">
    <h1>欢迎 {{ $pkFileManager.user.value.username }}</h1>
  </div>
  <div v-else>
    <n-skeleton text :repeat="2"/>
  </div>
</template>
<script setup>

import {onMounted, ref, inject} from 'vue';
import {useRouter} from 'vue-router';
import {NSkeleton, NButton} from 'naive-ui';

const router = useRouter();
const $pkFileManager = inject('$pkFileManager');

onMounted(() => {
  if ($pkFileManager.user.value === null) {
    $pkFileManager.getMe();
  }
  console.log($pkFileManager.user.value)
});

</script>