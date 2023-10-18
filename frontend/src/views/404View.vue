<template>
    <n-result status="404" title="404 页面不存在" description="生活总归带点荒谬">
        <template #footer>
            <n-button @click="handleGoBack">回到上个页面</n-button>
        </template>
    </n-result>
</template>
<script setup>
import { NResult, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';
const router = useRouter();
const handleGoBack = () => {
    router.go(-1);
};
</script>