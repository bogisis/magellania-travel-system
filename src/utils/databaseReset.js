// Утилита для полной очистки и пересоздания базы данных
export const forceResetDatabase = async () => {
  console.log('🚨 Принудительная очистка базы данных...')

  try {
    // 1. Закрываем все соединения с базой данных
    if (window.db && typeof window.db.close === 'function') {
      await window.db.close()
      console.log('✅ Соединение с базой данных закрыто')
    }

    // 2. Получаем список всех баз данных
    const databases = await indexedDB.databases()
    console.log(
      '📋 Найденные базы данных:',
      databases.map((db) => db.name),
    )

    // 3. Удаляем все базы данных, связанные с Magellania
    const magellaniaDBs = databases.filter(
      (db) =>
        db.name.toLowerCase().includes('magellania') ||
        db.name.toLowerCase().includes('travel') ||
        db.name.toLowerCase().includes('dexie'),
    )

    console.log(
      '🗑️ Удаляем базы данных:',
      magellaniaDBs.map((db) => db.name),
    )

    for (const db of magellaniaDBs) {
      try {
        await indexedDB.deleteDatabase(db.name)
        console.log(`✅ Удалена база данных: ${db.name}`)
      } catch (error) {
        console.warn(`⚠️ Не удалось удалить ${db.name}:`, error.message)
      }
    }

    // 4. Очищаем localStorage и sessionStorage
    try {
      localStorage.clear()
      sessionStorage.clear()
      console.log('✅ Очищены localStorage и sessionStorage')
    } catch (error) {
      console.warn('⚠️ Не удалось очистить storage:', error.message)
    }

    // 5. Принудительная очистка кэша
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          if (cacheName.includes('magellania') || cacheName.includes('vite')) {
            await caches.delete(cacheName)
            console.log(`✅ Удален кэш: ${cacheName}`)
          }
        }
      } catch (error) {
        console.warn('⚠️ Не удалось очистить кэш:', error.message)
      }
    }

    console.log('✅ Полная очистка завершена')
    console.log('🔄 Перезагрузка страницы через 2 секунды...')

    // 6. Перезагружаем страницу
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error)

    // Принудительная перезагрузка даже при ошибке
    console.log('🔄 Принудительная перезагрузка...')
    window.location.reload()
  }
}

// Функция для проверки состояния базы данных
export const checkDatabaseHealth = async () => {
  console.log('🔍 Проверка состояния базы данных...')

  try {
    const databases = await indexedDB.databases()
    const magellaniaDBs = databases.filter(
      (db) =>
        db.name.toLowerCase().includes('magellania') || db.name.toLowerCase().includes('travel'),
    )

    console.log('📊 Найдено баз данных Magellania:', magellaniaDBs.length)
    magellaniaDBs.forEach((db) => {
      console.log(`  - ${db.name} (версия: ${db.version})`)
    })

    return magellaniaDBs.length === 0
  } catch (error) {
    console.error('❌ Ошибка проверки:', error)
    return false
  }
}
