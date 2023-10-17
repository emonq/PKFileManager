<template>
  <corbado-auth :project-id="corbadoProjectID" conditional="yes">
    <input id="corbado-username" autocomplete="webauthn" name="username" required />
  </corbado-auth>
</template>

<script setup>
import '@corbado/webcomponent'
import "@corbado/webcomponent/pkg/auth_cui.css"

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';
import Corbado from "@corbado/webcomponent";

const corbadoProjectID = ref(import.meta.env.VITE_CORBADO_PROJECT_ID);

const router = useRouter();
const session = new Corbado.Session(corbadoProjectID.value);

onMounted(() => {
  session.refresh(u => {
    console.log(u);
    if (u) {
      router.push('/profile');
    }
  });
})


</script>