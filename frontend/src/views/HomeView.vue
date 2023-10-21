<template>
  <div v-if="!$pkFileManager.user.value">
    <h1>欢迎使用PK File Manager</h1>
  </div>
  <div v-else>
    <FileUploader/>
  </div>
</template>
<script setup>

import {onMounted, ref, inject} from 'vue';
import {useRouter} from 'vue-router';
import {NSkeleton, NButton} from 'naive-ui';
import FileUploader from "@/components/FileManager.vue";

const router = useRouter();
const $pkFileManager = inject('$pkFileManager');

onMounted(() => {
  if ($pkFileManager.user.value === null) {
    $pkFileManager.getMe();
  }
});

</script>