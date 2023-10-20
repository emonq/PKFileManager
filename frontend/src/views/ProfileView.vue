<template>
  <div v-if="$pkFileManager.user.value">
    <n-form :model="$pkFileManager.user.value" label-placement="left" label-width="auto">
      <n-form-item label="用户ID">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.id }}</n-tag>
      </n-form-item>
      <n-form-item label="用户名">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.username }}</n-tag>
      </n-form-item>
      <n-form-item label="邮箱">
        <n-tag :bordered="true">{{ $pkFileManager.user.value.email }}</n-tag>
      </n-form-item>
      <n-form-item label="用户凭证">
        <n-data-table
            :bordered="false"
            :single-line="false"
            :columns="credentialsColumns"
            :data="$pkFileManager.user.value.credentials"
            :pagination="{ pageSize: 5 }"
        />
      </n-form-item>
      <n-form-item>
        <n-button @click="registerNewKey">
          注册新密钥
        </n-button>
      </n-form-item>
    </n-form>
    <n-popconfirm @positive-click="handleLogout" :positive-button-props="{ type: 'error' }" :negative-text="null">
      <template #trigger>
        <n-button type="error">退出登录</n-button>
      </template>
      确定退出登录吗？
    </n-popconfirm>
    <n-modal
        v-model:show="showModal"
        preset="dialog"
        title="凭证删除确认"
        :content="`确认删除凭证${deletingKeyId}吗？`"
        type="warning"
        positive-text="确认"
        negative-text="算了"
        @positive-click="deleteConfirm"
    />
  </div>
  <div v-else>
    <n-skeleton text :repeat="2"/>
  </div>
</template>

<script setup>

import {onMounted, h, inject, ref} from 'vue';
import {useRouter} from 'vue-router';
import {
  NSkeleton,
  NButton,
  NPopconfirm,
  NForm,
  NFormItem,
  NTag,
  NDataTable,
  NTime,
  NModal,
  useMessage,
  NIcon
} from 'naive-ui';
import {TrashBin} from '@vicons/ionicons5'

const message = useMessage();
const router = useRouter();
const showModal = ref(false);
const deletingKeyId = ref('');
const $pkFileManager = inject('$pkFileManager');

const credentialsColumns = [
  {
    title: '凭证ID',
    key: 'id',
  },
  {
    title: '凭证类型',
    key: 'type',
  },
  {
    title: '上次使用',
    key: 'updatedAt',
    render(row) {
      return h(NTime, {time: new Date(row.updatedAt)})
    },
    sorter: (row1, row2) => {
      return new Date(row1.updatedAt) - new Date(row2.updatedAt);
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    render(row) {
      return h(NTime, {time: new Date(row.createdAt)})
    },
    sorter: (row1, row2) => {
      return new Date(row1.createdAt) - new Date(row2.createdAt);
    },
    defaultSortOrder: 'descend'
  },
  {
    title: '操作',
    key: 'operations',
    render(row) {
      return h(
          NButton,
          {
            onClick: () => {
              deletingKeyId.value = row.id;
              showModal.value = true;
            },
            type: "error",
            renderIcon: () => h(NIcon, null, {default: () => h(TrashBin)})
          }
      )
    }
  }
]

onMounted(() => {
  if ($pkFileManager.user.value === null) {
    $pkFileManager.getMe();
  }
});

const handleLogout = () => {
  $pkFileManager.logout();
};

const registerNewKey = () => {
  $pkFileManager.registerNewKey()
      .then(() => {
        message.success('已成功添加新密钥');
        $pkFileManager.getMe();
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          message.error(`添加新密钥失败：${err.response.data.error}`);
        } else if (err.message) {
          message.error(`添加新密钥失败`);
        }
      })
}

const deleteConfirm = () => {
  $pkFileManager.removeKey(deletingKeyId.value)
      .then(() => {
        message.success('删除成功');
        $pkFileManager.getMe();
      })
      .catch((err) => {
        console.log(err);
        message.error(`删除失败：${err.response.data.error}`);
      })
};

</script>