<script setup>
import {useRouter, useRoute} from 'vue-router';
import {h, inject} from 'vue';
import {NDropdown, NButton, NIcon, NButtonGroup, NSpace} from 'naive-ui';
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon
} from "@vicons/ionicons5";

const router = useRouter();
const route = useRoute();

const $pkFileManager = inject('$pkFileManager');

const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};


const options = [
  {
    label: "用户资料",
    key: "profile",
    icon: renderIcon(UserIcon),
    props: {
      onClick: () => {
        router.push("/profile");
      }
    }
  },
  {
    label: "退出登录",
    key: "logout",
    icon: renderIcon(LogoutIcon),
    props: {
      onClick: () => {
        $pkFileManager.logout();
      }
    }
  }
]
</script>

<template>
  <n-space justify="space-between">
    <n-button-group>
      <n-button @click="router.push('/')">
        主页
      </n-button>
    </n-button-group>
    <n-dropdown :options="options" v-if="$pkFileManager.user.value">
      <n-button>用户资料</n-button>
    </n-dropdown>
    <n-button v-else @click="router.push('/auth')">
      登录
    </n-button>
  </n-space>
</template>

<style scoped></style>