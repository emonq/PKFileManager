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
      <n-button attr-type="button" type="primary" @click="signIn">登录</n-button>
    </n-form-item>
  </n-form>
  <n-modal
      v-model:show="requireEmailCode"
      preset="dialog"
      :show-icon="false"
      title="请输入验证码"
      positive-text="确认"
      :auto-focus="true"
      :closable="false"
      :mask-closable="false"
      @positive-click="signInEmailFinish"
  >
    <template #default>
      <n-form
          ref="emailCodeFormRef"
          :model="emailCode"
          :rules="emailCodeRules"
      >
        <n-form-item label="邮箱验证码" path="code">
          <n-input v-model:value="emailCode.code" placeholder="输入验证码"/>
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>
<script setup>
import {NForm, NFormItem, NInput, NButton, NModal, useMessage} from "naive-ui";
import {ref, inject} from 'vue';
import {useRouter} from "vue-router";

const emailCodeFormRef = ref(null);
const emailCode = ref({
  code: null
});
const requireEmailCode = ref(false);
const $pkFileManager = inject('$pkFileManager');
const message = useMessage();
const router = useRouter();
let sendingEmailMessage = null;

const formRef = ref(null);

const emailCodeRules = {
  code: [
    {
      required: true,
      message: '验证码不能为空',
      trigger: ['blur', 'input'],
    },
    {
      min: 1,
      max: 10,
      message: '验证码长度在 1 到 10 个字符',
      trigger: ['blur', 'input'],
    }
  ],
}

const user = ref({
  username: null,
});
const rules = {
  username: [
    {
      required: true,
      message: '用户名不能为空',
      trigger: ['blur', 'input'],
    },
    {
      min: 3,
      max: 64,
      message: '用户名长度在 3 到 64 个字符',
      trigger: ['blur', 'input'],
    }
  ],
}

const signInEmail = () => {
  $pkFileManager.signInEmailStart(user.value.username)
      .then(() => {
        message.success('登录邮件已发送，请检查邮箱');
        requireEmailCode.value = true;
      })
      .catch((err) => {
        if (err.response) {
          message.error(`登录失败：${err.response.data.error}`);
          return;
        }
        message.error('登录邮件发送失败');
      })
      .finally(() => {
        sendingEmailMessage?.destroy();
        sendingEmailMessage = null;
      })
}

const signInEmailFinish = (e) => {
  emailCodeFormRef.value.validate((errors) => {
    if (!errors) {
      $pkFileManager.signInEmailFinish(emailCode.value.code)
          .then(() => {
            message.success('登录成功');
            router.push('/profile');
          })
          .catch((err) => {
            message.error(`登录失败：${err.response.data.error}`);
            emailCode.value.code = '';
            if (err.response.status === 400) {
              requireEmailCode.value = true;
              return false;
            }
            requireEmailCode.value = false;
            return true;
          });
    } else {
      console.log(errors);
      message.error("请检查输入");
    }
  })
  return false;
}
const signIn = (e) => {
  e.preventDefault();
  formRef.value.validate((errors) => {
    if (!errors) {
      $pkFileManager.signInPasskey(user.value.username)
          .then(() => {
            message.success('登录成功');
            router.push('/profile');
          })
          .catch((err) => {
            if (err.response) {
              message.error(`登录失败：${err.response.data.error}`);
              return;
            }
            sendingEmailMessage = message.loading('使用Passkey登录失败，正在尝试使用邮箱登录');
            signInEmail();
          });
    } else {
      message.error("请检查输入");
    }
  })


}
</script>