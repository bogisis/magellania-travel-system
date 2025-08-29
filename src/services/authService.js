/**
 * Сервис аутентификации для работы с JWT токенами
 */

const API_BASE_URL = 'http://localhost:3001/api'

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token')
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null')
  }

  /**
   * Вход в систему
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка входа в систему')
      }

      // Сохраняем токен и данные пользователя
      this.token = data.token
      this.user = data.user
      localStorage.setItem('auth_token', this.token)
      localStorage.setItem('auth_user', JSON.stringify(this.user))

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Выход из системы
   */
  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  /**
   * Проверка аутентификации
   */
  isAuthenticated() {
    return !!this.token
  }

  /**
   * Получение токена
   */
  getToken() {
    return this.token
  }

  /**
   * Получение данных пользователя
   */
  getUser() {
    return this.user
  }

  /**
   * Проверка роли пользователя
   */
  hasRole(role) {
    return this.user?.role === role
  }

  /**
   * Проверка прав администратора
   */
  isAdmin() {
    return this.hasRole('admin')
  }

  /**
   * Обновление заголовков для API запросов
   */
  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Проверка срока действия токена
   */
  isTokenExpired() {
    if (!this.token) return true

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Token validation error:', error)
      return true
    }
  }

  /**
   * Автоматическое обновление токена (если необходимо)
   */
  async refreshTokenIfNeeded() {
    if (this.isTokenExpired()) {
      this.logout()
      throw new Error('Токен истек. Необходимо войти в систему заново.')
    }
  }
}

// Создаем единственный экземпляр сервиса
export const authService = new AuthService()

// Экспортируем класс для тестирования
export { AuthService }
