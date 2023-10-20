<script setup>
import {RouterView} from 'vue-router'
import {
  NCard,
  NConfigProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  NSpace,
  NLayout
} from 'naive-ui'
import {zhCN, dateZhCN} from 'naive-ui'

import SiteHeader from "./components/SiteHeader.vue";

</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <n-space vertical>
              <n-layout class="root-layout" embedded content-style="padding: 24px;">
                <SiteHeader/>
                <n-card>
                  <router-view v-slot="{ Component, route }">
                    <transition :name="route.meta.transition">
                      <component :is="Component" :key="route.path"/>
                    </transition>
                  </router-view>
                </n-card>
              </n-layout>
            </n-space>
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>