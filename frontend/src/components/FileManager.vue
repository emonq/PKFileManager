<script setup>
import {NIcon, NText, NUpload, NUploadDragger, useMessage} from "naive-ui";
import {ArchiveOutline} from "@vicons/ionicons5";
import {inject, onMounted, ref} from "vue";

const message = useMessage();
const $pkFileManager = inject('$pkFileManager');

const fileList = ref([]);
const cancelTokens = {};

const onFileUploadError = ({file, event}) => {
  console.log(file);
  message.error(`文件 ${file.name} 上传失败`);
}

const onFileUploadFinish = ({file, event}) => {
  message.success(`文件 ${file.name} 上传成功`);
}

const handleDownload = (file) => {
  message.success(`文件 ${file.name} 开始下载`);
}

const handleRemove = ({file, fileList}) => {
  if (file.status === 'finished') {
    $pkFileManager.deleteFile(file.url)
        .then((res) => {
          message.success(`文件 ${file.name} 删除成功`);
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status !== 404) {
            message.error(`文件 ${file.name} 删除失败`);
            return false;
          }
        });
  } else if (file.status === 'uploading') {
    cancelTokens[file.id].abort();
    message.warning(`已取消文件 ${file.name} 的上传`);
    cancelTokens[file.id] = null;
  }
}

const beforeUpload = ({file}) => {
  if (fileList.value.findIndex(item => item.name === file.name && item.id !== file.id) !== -1) {
    message.error(`文件 ${file.name} 已存在`);
    return false;
  }
  return true;
}

const uploadFile = (
    {
      file,
      data,
      headers,
      withCredentials,
      action,
      onFinish,
      onError,
      onProgress
    }
) => {
  cancelTokens[file.id] = new AbortController();
  $pkFileManager.uploadFile(file, onProgress, cancelTokens[file.id])
      .then((res) => {
        if (res.status === 'error') {
          onError();
          return false;
        } else {
          onFinish();
        }
      })
      .catch((error) => {
        // upload is canceled, not an error
        if (error?.name === 'CanceledError') {
          return;
        }

        console.log(error);
        onError();
      });
};

onMounted(() => {
  $pkFileManager.getFiles()
      .then((res) => {
        fileList.value = res;
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error)
          message.error(`获取文件列表失败`);
      });
});

</script>

<template>
  <n-upload
      multiple
      directory-dnd
      v-model:file-list="fileList"
      action="#"
      :custom-request="uploadFile"
      :with-credentials="true"
      :show-download-button="true"
      @download="handleDownload"
      @remove="handleRemove"
      @error="onFileUploadError"
      @finish="onFileUploadFinish"
      @before-upload="beforeUpload"
  >
    <n-upload-dragger>
      <div style="margin-bottom: 12px">
        <n-icon size="48" :depth="3">
          <ArchiveOutline/>
        </n-icon>
      </div>
      <n-text style="font-size: 16px">
        点击或者拖动文件到该区域来上传
      </n-text>
    </n-upload-dragger>
    <!--    <n-card>-->
    <!--      <n-upload-file-list/>-->
    <!--    </n-card>-->
  </n-upload>
</template>

<style scoped>

</style>