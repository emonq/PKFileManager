<template>
  <div v-if="!$pkFileManager.user.value">
    <h1>欢迎使用PK File Manager</h1>
  </div>
  <div v-else>
    <h1>欢迎{{ $pkFileManager.user.value.username }}！</h1>
  </div>
</template>
<script setup>

import {onMounted, ref, inject} from 'vue';
import {useRouter} from 'vue-router';
import {NSkeleton, NButton} from 'naive-ui';

const router = useRouter();
const $pkFileManager = inject('$pkFileManager');

onMounted(() => {

});

</script>