const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Путь к базе данных
const dbPath = path.join(__dirname, 'api-server', 'data', 'magellania.db')

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath)

// Функция для очистки базы данных
function clearDatabase() {
  console.log('🗄️ Очистка базы данных...')

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    try {
      // Удаляем все данные из таблиц
      db.run('DELETE FROM estimates', (err) => {
        if (err) {
          console.error('❌ Ошибка очистки смет:', err.message)
        } else {
          console.log('✅ Сметы очищены')
        }
      })

      db.run('DELETE FROM clients', (err) => {
        if (err) {
          console.error('❌ Ошибка очистки клиентов:', err.message)
        } else {
          console.log('✅ Клиенты очищены')
        }
      })

      db.run('DELETE FROM suppliers', (err) => {
        if (err) {
          console.error('❌ Ошибка очистки поставщиков:', err.message)
        } else {
          console.log('✅ Поставщики очищены')
        }
      })

      // Подтверждаем транзакцию
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ Ошибка при очистке базы данных:', err.message)
        } else {
          console.log('✅ База данных успешно очищена!')
        }

        // Закрываем соединение
        db.close()
      })
    } catch (error) {
      console.error('❌ Ошибка при очистке базы данных:', error.message)
      db.run('ROLLBACK')
      db.close()
    }
  })
}

// Запускаем очистку
clearDatabase()
