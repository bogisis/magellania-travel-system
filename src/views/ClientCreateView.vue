<template>
  <div class="space-y-6">
    <div class="bg-white shadow-soft rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">Добавление клиента</h1>

      <form class="mt-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput v-model="client.name" label="Имя клиента" required />
          <BaseInput v-model="client.email" type="email" label="Email" required />
          <BaseInput v-model="client.phone" label="Телефон" />
          <BaseInput v-model="client.company" label="Компания" />
        </div>

        <div class="flex space-x-3">
          <BaseButton variant="outline" @click="$router.go(-1)"> Отмена </BaseButton>
          <BaseButton variant="primary" @click="saveClient"> Создать клиента </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useClientsStore } from '@/stores/clients'

const router = useRouter()
const clientsStore = useClientsStore()

const client = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'b2c',
})

async function saveClient() {
  try {
    await clientsStore.createClient(client.value)
    window.$toast?.success('Клиент создан', 'Новый клиент успешно добавлен')
    router.push('/clients')
  } catch (error) {
    window.$toast?.error('Ошибка', 'Не удалось создать клиента')
  }
}
</script>
