<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { globalForm, globalFormLoading } = useGlobalState();

const tableName = "user_definition";

const user = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

const { validate, getIncludeFields } = useSchema(tableName);

async function fetchUser() {
  globalFormLoading.value = true;

  const { data, error } = await useApiLazy(`/${tableName}`, {
    query: {
      fields: getIncludeFields(),
      filter: {
        id: { _eq: route.params.id },
      },
    },
  });

  globalFormLoading.value = false;

  const userData = data.value?.data?.[0];

  if (!userData) {
    toast.add({
      title: "Không tìm thấy người dùng",
      description: error.value?.message || "ID không hợp lệ",
      color: "error",
    });
    router.push("/users");
    return;
  }

  user.value = {
    ...userData,
    password: null, // để không hiển thị mật khẩu
  };
}

async function saveUser() {
  const payload = { ...user.value };
  if (!payload.password) delete payload.password; // để không ghi đè bằng null
  const { isValid, errors: validationErrors } = validate(payload);

  if (!isValid) {
    errors.value = validationErrors;
    toast.add({
      title: "Lỗi",
      description: "Vui lòng điền đầy đủ các trường bắt buộc.",
      color: "error",
    });
    return;
  }

  globalFormLoading.value = true;

  const { error } = await useApiLazy(`/${tableName}/${user.value.id}`, {
    method: "patch",
    body: payload,
  });

  globalFormLoading.value = false;

  if (error.value) {
    toast.add({
      title: "Lỗi khi lưu",
      description: error.value.message,
      color: "error",
    });
    return;
  }

  toast.add({ title: "Đã lưu thông tin", color: "primary" });
  errors.value = {};
}

async function deleteUser() {
  const ok = await useConfirm().confirm({
    content: `Bạn chắc chắn muốn xoá người dùng "${user.value.name}"?`,
  });
  if (!ok) return;

  globalFormLoading.value = true;

  const { error } = await useApiLazy(`/${tableName}/${user.value.id}`, {
    method: "delete",
  });

  globalFormLoading.value = false;

  if (error.value) {
    toast.add({
      title: "Lỗi khi xoá",
      description: error.value.message,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Đã xoá người dùng",
    color: "success",
  });
  await navigateTo("/settings/users");
}

onMounted(fetchUser);
</script>

<template>
  <UForm :state="user" ref="globalForm" @submit="saveUser">
    <UCard :loading="globalFormLoading" v-if="user">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UAvatar
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.name"
              size="xl"
            />
            <UAvatar v-else :alt="user.name" size="xl">
              {{ user.email?.charAt(0)?.toUpperCase() || "?" }}
            </UAvatar>
            <div>
              <div class="text-xl font-semibold">{{ user.name }}</div>
              <div class="text-sm text-muted-foreground">{{ user.email }}</div>
            </div>
          </div>

          <div>
            <UButton
              icon="lucide:trash"
              label="Xoá người dùng"
              color="error"
              variant="solid"
              :disabled="user.isSystem || user.isRootAdmin"
              :loading="globalFormLoading"
              @click="deleteUser"
            />
          </div>
        </div>
      </template>

      <DynamicFormEditor
        v-model="user"
        v-model:errors="errors"
        table-name="user_definition"
        :excluded="['id', 'isRootAdmin', 'isSystem']"
        class="mt-4"
      />
    </UCard>
  </UForm>
</template>
