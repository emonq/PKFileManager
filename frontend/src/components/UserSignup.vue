<template>
  <n-form ref="formRef" :model="user" :rules="rules" :show-require-mark="true">
    <n-form-item label="邮箱" path="email">
      <n-input v-model:value="user.email" />
    </n-form-item>
    <n-form-item label="用户名" path="username">
      <n-input v-model:value="user.username" />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="register">注册</n-button>
    </n-form-item>
  </n-form>
</template>
<script setup>
import { NForm, NFormItem, NInput, NButton, useMessage } from "naive-ui";
import { ref, inject } from 'vue';
import router from "@/router";

const message = useMessage();

const $pkFileManager = inject('$pkFileManager');


const formRef = ref(null);
const user = ref({
  username: null,
  email: null
});

const rules = {
  username: [
    {
      required: true,
      message: '用户名不能为空',
      trigger: ['blur', 'input'],
    },
    {
      min: 1,
      max: 64,
      message: '用户名长度在 1 到 64 个字符',
      trigger: ['blur', 'input'],
    }
  ],
  email: [
    {
      required: true,
      message: '邮箱不能为空',
      trigger: ['blur', 'input'],
    },
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur'],
    }
  ]
}

const register = (e) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      $pkFileManager.signUp(user.value.username, user.value.email)
        .then(() => {
          message.success('注册成功');
          router.push('/');
        })
        .catch((err) => {
          console.log(err);
          if (err.response?.data.error) {
            message.error(`注册失败：${err.response.data.error}`);
          }
          else if (err.name === 'NotAllowedError') {
            message.error("注册失败：用户已取消");
          }
          else {
            message.error("注册失败");
          }
        });
    } else {
      message.error("注册失败，请检查输入");
    }
  });

}
</script>