<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
  record: Record<string, any>;
  tableName: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<template>
  <Teleport to="body">
    <UDrawer
      v-model:open="open"
      direction="right"
      class="min-w-xl"
      :ui="{
        header:
          'border-b border-muted text-muted pb-2 flex items-center justify-between',
      }"
    >
      <template #header>
        <h2>Chi tiết bản ghi</h2>
        <UButton
          icon="lucide:x"
          variant="ghost"
          color="error"
          @click="open = false"
        />
      </template>

      <template #body>
        <div class="p-2 max-h-[80vh] overflow-y-auto">
          <DynamicFormEditor
            :table-name="props.tableName"
            :model-value="props.record"
            :errors="{}"
            readonly
          />
        </div>
      </template>
    </UDrawer>
  </Teleport>
</template>
