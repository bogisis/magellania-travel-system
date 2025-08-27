<template>
  <div class="space-y-6">
    <div class="bg-white shadow-soft rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">Редактирование сметы</h1>
      <p class="text-gray-600 mt-2">Смета {{ $route.params.id }}</p>

      <div class="mt-8">
        <BaseButton variant="outline" @click="$router.go(-1)"> Назад </BaseButton>
        <BaseButton variant="success" class="ml-3"> Сохранить изменения </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
</script>
