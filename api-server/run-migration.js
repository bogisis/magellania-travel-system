const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'data/magellania.db')

// Создаем директорию для данных, если её нет
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message)
    process.exit(1)
  } else {
    console.log('✅ Подключение к SQLite базе данных установлено')
  }
})

// Включаем foreign keys
db.run('PRAGMA foreign_keys = ON')

// Функция для выполнения SQL
function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this)
      }
    })
  })
}

// Функция для выполнения запроса
function querySQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Миграция 003: Добавление полей для рейсов и данных сметы
async function runMigration003() {
  try {
    console.log('🔄 Запуск миграции 003: Добавление полей для рейсов и данных сметы...')

    // Проверяем, существуют ли уже новые поля
    const tableInfo = await querySQL('PRAGMA table_info(estimates)')
    const existingColumns = tableInfo.map((col) => col.name)

    const newColumns = [
      'flights',
      'hotels',
      'tourDays',
      'optionalServices',
      'location',
      'tourDates',
      'groupData',
      'markup',
      'currency',
    ]

    for (const column of newColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`📝 Добавляем поле: ${column}`)

        if (column === 'markup') {
          await runSQL(`ALTER TABLE estimates ADD COLUMN ${column} REAL DEFAULT 0`)
        } else if (column === 'currency') {
          await runSQL(`ALTER TABLE estimates ADD COLUMN ${column} TEXT DEFAULT 'USD'`)
        } else {
          await runSQL(`ALTER TABLE estimates ADD COLUMN ${column} TEXT DEFAULT '[]'`)
        }
      } else {
        console.log(`✅ Поле ${column} уже существует`)
      }
    }

    // Обновляем существующие записи
    console.log('🔄 Обновляем существующие записи...')
    await runSQL(`
      UPDATE estimates SET
        flights = '[]',
        hotels = '[]',
        tourDays = '[]',
        optionalServices = '[]',
        location = '{}',
        tourDates = '{}',
        groupData = '{}',
        markup = 0,
        currency = 'USD'
      WHERE flights IS NULL OR flights = ''
    `)

    console.log('✅ Миграция 003 завершена успешно!')
  } catch (error) {
    console.error('❌ Ошибка выполнения миграции:', error)
    throw error
  }
}

// Запускаем миграцию
async function main() {
  try {
    await runMigration003()
    console.log('🎉 Все миграции выполнены успешно!')
  } catch (error) {
    console.error('💥 Ошибка выполнения миграций:', error)
    process.exit(1)
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Ошибка закрытия базы данных:', err.message)
      } else {
        console.log('✅ Соединение с базой данных закрыто')
      }
    })
  }
}

main()
