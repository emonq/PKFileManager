<template>
  <corbado-auth :project-id="corbadoProjectID" conditional="yes">
    <input id="corbado-username" autocomplete="webauthn" name="username" required />
  </corbado-auth>
</template>

<script setup>
import '@corbado/webcomponent'
import "@corbado/webcomponent/pkg/auth_cui.css"

import { onMounted, ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import Corbado from "@corbado/webcomponent";

const corbadoProjectID = ref(import.meta.env.VITE_CORBADO_PROJECT_ID);

const router = useRouter();
const route = useRoute();
const session = new Corbado.Session(corbadoProjectID.value);
const $pkFileManager=inject('$pkFileManager');

onMounted(() => {
  if ($pkFileManager.user.value) {
    router.push('/');
  }
})


</script>