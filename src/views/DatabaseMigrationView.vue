<template>
  <div class="database-migration-view">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Миграция базы данных</h1>
        <p class="text-gray-600">
          Перенос данных из IndexedDB в SQLite для повышения надежности и производительности
        </p>
      </div>

      <DatabaseMigration />
    </div>
  </div>
</template>

<script setup>
import DatabaseMigration from '@/components/common/DatabaseMigration.vue'
</script>
