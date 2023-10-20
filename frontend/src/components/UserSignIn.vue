<template>
  <n-form :model="user">
    <n-form-item label="用户名" path="username">
      <n-input v-model:value="user.username" placeholder="输入用户名"/>
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="register">登录</n-button>
    </n-form-item>
  </n-form>
</template>
<script setup>
import {NForm, NFormItem, NInput, NButton, useMessage} from "naive-ui";
import {ref, inject} from 'vue';
import {useRouter} from "vue-router";

const $pkFileManager = inject('$pkFileManager');
const message = useMessage();
const router = useRouter();

const user = ref({
  username: null,
});

const register = () => {
  $pkFileManager.signIn(user.value.username)
      .then(() => {
        message.success('登录成功');
        router.push('/');
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error)
          message.error(`登录失败：${err.response.data.error}`);
      });
}
</script>