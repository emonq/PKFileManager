<template>
  <n-form
      ref="formRef"
      :model="user"
      :rules="rules"
  >
    <n-form-item label="用户名" path="username">
      <n-input v-model:value="user.username" placeholder="输入用户名"/>
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="signIn">登录</n-button>
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

const formRef = ref(null);
const user = ref({
  username: null,
});
const rules = {
  username: [
    {
      required: true,
      message: '用户名不能为空',
      trigger: ['blur'],
    },
    {
      min: 1,
      max: 64,
      message: '用户名长度在 1 到 64 个字符',
      trigger: ['blur'],
    }
  ]
}
const signIn = (e) => {
  e.preventDefault();
  formRef.value.validate((errors) => {
    if (!errors) {
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
    } else {
      message.error("请检查输入");
    }
  })


}
</script>