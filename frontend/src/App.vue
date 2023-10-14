<script setup>
import {RouterView} from 'vue-router'
import {NLoadingBarProvider, NMessageProvider, NNotificationProvider, NDialogProvider, NSpace, NLayout} from 'naive-ui'
import SiteHeader from "@/SiteHeader.vue";
</script>

<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <n-space vertical>
            <n-layout class="root-layout">
              <SiteHeader/>
              <router-view v-slot="{ Component, route }">
                <transition :name="route.meta.transition">
                  <component :is="Component"/>
                </transition>
              </router-view>
            </n-layout>
          </n-space>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>