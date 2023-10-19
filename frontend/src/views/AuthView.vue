<template>
  <n-tabs
      class="card-tabs"
      default-value="signin"
      size="large"
      animated
      pane-wrapper-style="margin: 0 -4px"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
  >
    <n-tab-pane name="signin" tab="登录">
      <UserSignIn/>
    </n-tab-pane>
    <n-tab-pane name="signup" tab="注册">
      <UserSignup/>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import UserSignup from "@/components/UserSignup.vue";

import {onMounted, ref, inject} from 'vue'
import {useRouter, useRoute} from 'vue-router';
import UserSignIn from "@/components/UserSignIn.vue";
import {NTabs, NTabPane} from "naive-ui";

const router = useRouter();
const route = useRoute();
const $pkFileManager = inject('$pkFileManager');

onMounted(() => {
  if ($pkFileManager.user.value) {
    router.push('/');
  }
})


</script>