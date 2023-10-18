<script setup>
import { useRouter } from 'vue-router';
import { h, inject } from 'vue';
import { routes } from '../router/index.js'
import { NDropdown, NButton, NIcon, NButtonGroup, NSpace } from 'naive-ui';
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon
} from "@vicons/ionicons5";

const router = useRouter();
const $session = inject('$session');

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
        $session.logout().then(async () => {
          await router.push('/auth');
        })
          .catch(err => console.log(err));
      }
    }
  }
]
</script>

<template>
  <n-space justify="space-between">
    <n-button-group>
      <n-button v-for="route in routes.filter((route) => !route.meta.hideNav)" @click="router.push(route.path)" exact>
        {{ route.meta.title }}
      </n-button>
    </n-button-group>
    <n-dropdown :options="options">
      <n-button>用户资料</n-button>
    </n-dropdown>
  </n-space>
</template>

<style scoped></style>