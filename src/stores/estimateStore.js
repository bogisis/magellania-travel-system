import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const useEstimateStore = defineStore('estimate', () => {
  // State
  const estimates = ref([])
  const currentEstimate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getEstimates = computed(() => estimates.value)

  const getEstimateById = computed(() => (id) => {
    return estimates.value.find((estimate) => estimate.id === id)
  })

  const getDrafts = computed(() => {
    return estimates.value.filter((estimate) => estimate.status === 'draft')
  })

  const getPublished = computed(() => {
    return estimates.value.filter((estimate) => estimate.status === 'published')
  })

  const getTotalCost = computed(() => (estimateId) => {
    const estimate = getEstimateById.value(estimateId)
    if (!estimate) return 0

    const hotelsCost =
      estimate.hotels
        ?.filter((hotel) => !hotel.isGuideHotel)
        .reduce((sum, hotel) => {
          const rooms =
            hotel.accommodationType === 'double' ? Math.ceil(hotel.paxCount / 2) : hotel.paxCount
          return sum + rooms * hotel.pricePerRoom * hotel.nights
        }, 0) || 0

    const activitiesCost =
      estimate.tourDays?.reduce((sum, day) => {
        return (
          sum +
          (day.activities?.reduce((daySum, activity) => daySum + (activity.cost || 0), 0) || 0)
        )
      }, 0) || 0

    const optionalServicesCost =
      estimate.optionalServices?.reduce((sum, service) => sum + service.price, 0) || 0

    const baseCost = hotelsCost + activitiesCost + optionalServicesCost
    const markupAmount = (baseCost * estimate.markup) / 100

    return baseCost + markupAmount
  })

  // Actions
  async function loadEstimates() {
    loading.value = true
    error.value = null

    try {
      // Здесь будет загрузка из API
      // Пока используем localStorage для демонстрации
      const stored = localStorage.getItem('estimates')
      if (stored) {
        estimates.value = JSON.parse(stored)
      }
    } catch (err) {
      error.value = 'Ошибка при загрузке смет'
      console.error('Error loading estimates:', err)
    } finally {
      loading.value = false
    }
  }

  async function getEstimate(id) {
    loading.value = true
    error.value = null

    try {
      // Сначала ищем в локальном состоянии
      let estimate = getEstimateById.value(id)

      if (!estimate) {
        // Если не найдено локально, загружаем из API
        try {
          const response = await fetch(`/api/estimates/${id}`)
          if (response.ok) {
            estimate = await response.json()
            // Добавляем в локальное состояние
            estimates.value.push(estimate)
          } else {
            throw new Error('Смета не найдена в API')
          }
        } catch (apiError) {
          throw new Error('Смета не найдена')
        }
      }

      currentEstimate.value = estimate
      return estimate
    } catch (err) {
      error.value = 'Ошибка при загрузке сметы'
      console.error('Error loading estimate:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveEstimate(estimateData) {
    loading.value = true
    error.value = null

    try {
      const estimate = {
        ...estimateData,
        id: estimateData.id || generateId(),
        status: 'published',
        createdAt: estimateData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Обновляем или добавляем смету
      const existingIndex = estimates.value.findIndex((e) => e.id === estimate.id)
      if (existingIndex !== -1) {
        estimates.value[existingIndex] = estimate
      } else {
        estimates.value.push(estimate)
      }

      // Сохраняем в localStorage
      localStorage.setItem('estimates', JSON.stringify(estimates.value))

      currentEstimate.value = estimate
      return estimate
    } catch (err) {
      error.value = 'Ошибка при сохранении сметы'
      console.error('Error saving estimate:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveDraft(estimateData) {
    loading.value = true
    error.value = null

    try {
      const estimate = {
        ...estimateData,
        id: estimateData.id || generateId(),
        status: 'draft',
        createdAt: estimateData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Обновляем или добавляем черновик
      const existingIndex = estimates.value.findIndex((e) => e.id === estimate.id)
      if (existingIndex !== -1) {
        estimates.value[existingIndex] = estimate
      } else {
        estimates.value.push(estimate)
      }

      // Сохраняем в localStorage
      localStorage.setItem('estimates', JSON.stringify(estimates.value))

      return estimate
    } catch (err) {
      error.value = 'Ошибка при сохранении черновика'
      console.error('Error saving draft:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEstimate(id) {
    loading.value = true
    error.value = null

    try {
      const index = estimates.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        estimates.value.splice(index, 1)
        localStorage.setItem('estimates', JSON.stringify(estimates.value))

        if (currentEstimate.value?.id === id) {
          currentEstimate.value = null
        }
      }
    } catch (err) {
      error.value = 'Ошибка при удалении сметы'
      console.error('Error deleting estimate:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function exportToCSV(estimateData) {
    try {
      // Подготавливаем данные для CSV
      const csvData = []

      // Заголовок
      csvData.push(['СМЕТА ДЛЯ КП'])
      csvData.push([
        `${estimateData.location.city}, ${estimateData.location.region}, ${estimateData.location.country}`,
      ])
      csvData.push([
        `${estimateData.tourDates.startDate} - ${estimateData.tourDates.endDate} (${estimateData.tourDates.days} дней)`,
      ])
      csvData.push([])

      // Информация о группе
      csvData.push(['ИНФОРМАЦИЯ О ГРУППЕ'])
      csvData.push(['Всего туристов', estimateData.group.totalPax])
      csvData.push(['Дабл размещение', estimateData.group.doubleCount])
      csvData.push(['Сингл размещение', estimateData.group.singleCount])
      csvData.push(['Гиды', estimateData.group.guidesCount])
      csvData.push([])

      // Дни тура
      csvData.push(['ДЕТАЛИЗАЦИЯ ПО ДНЯМ'])
      estimateData.tourDays.forEach((day, index) => {
        csvData.push([`День ${index + 1}: ${day.title || `День ${index + 1}`}`])
        csvData.push(['Дата', day.date])
        csvData.push(['Место', day.location])
        csvData.push(['Описание', day.description])

        if (day.activities && day.activities.length > 0) {
          csvData.push(['Активности'])
          day.activities.forEach((activity) => {
            csvData.push([activity.time, activity.name, activity.cost])
          })
        }
        csvData.push([])
      })

      // Гостиницы
      if (estimateData.hotels && estimateData.hotels.length > 0) {
        csvData.push(['РАЗМЕЩЕНИЕ'])
        estimateData.hotels.forEach((hotel) => {
          csvData.push([
            hotel.name,
            hotel.category,
            hotel.paxCount,
            hotel.accommodationType,
            hotel.pricePerRoom,
            hotel.nights,
          ])
        })
        csvData.push([])
      }

      // Итоговый расчет
      csvData.push(['ИТОГОВЫЙ РАСЧЕТ'])
      csvData.push(['Базовая стоимость', calculateBaseCost(estimateData)])
      csvData.push(['Наценка (%)', estimateData.markup])
      csvData.push(['Наценка (сумма)', calculateMarkupAmount(estimateData)])
      csvData.push(['ИТОГО', calculateFinalCost(estimateData)])

      // Конвертируем в CSV
      const csv = Papa.unparse(csvData)

      // Создаем и скачиваем файл
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `estimate_${estimateData.id}_${new Date().toISOString().split('T')[0]}.csv`,
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error exporting to CSV:', err)
      throw new Error('Ошибка при экспорте в CSV')
    }
  }

  async function exportToPDF(estimateData) {
    try {
      // Создаем временный элемент для рендеринга
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = generateEstimateHTML(estimateData)
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '800px'
      document.body.appendChild(tempDiv)

      // Конвертируем в canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      // Удаляем временный элемент
      document.body.removeChild(tempDiv)

      // Создаем PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Скачиваем PDF
      pdf.save(`estimate_${estimateData.id}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('Error exporting to PDF:', err)
      throw new Error('Ошибка при экспорте в PDF')
    }
  }

  function generateEstimateHTML(estimateData) {
    // Генерируем HTML для PDF экспорта
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #333;">СМЕТА ДЛЯ КП</h1>
        <p style="text-align: center; color: #666;">
          ${estimateData.location.city}, ${estimateData.location.region}, ${estimateData.location.country}
        </p>
        <p style="text-align: center; color: #999; font-size: 14px;">
          ${estimateData.tourDates.startDate} - ${estimateData.tourDates.endDate} (${estimateData.tourDates.days} дней)
        </p>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <h2 style="margin: 0 0 10px 0; color: #333;">Информация о группе</h2>
          <p style="margin: 5px 0;">Всего туристов: ${estimateData.group.totalPax}</p>
          <p style="margin: 5px 0;">Дабл размещение: ${estimateData.group.doubleCount}</p>
          <p style="margin: 5px 0;">Сингл размещение: ${estimateData.group.singleCount}</p>
          <p style="margin: 5px 0;">Гиды: ${estimateData.group.guidesCount}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #333;">Итоговый расчет</h2>
          <p>Базовая стоимость: ${calculateBaseCost(estimateData)} ${estimateData.currency}</p>
          <p>Наценка (${estimateData.markup}%): ${calculateMarkupAmount(estimateData)} ${estimateData.currency}</p>
          <p style="font-weight: bold; font-size: 18px;">ИТОГО: ${calculateFinalCost(estimateData)} ${estimateData.currency}</p>
        </div>
      </div>
    `
  }

  function calculateBaseCost(estimateData) {
    const hotelsCost =
      estimateData.hotels
        ?.filter((hotel) => !hotel.isGuideHotel)
        .reduce((sum, hotel) => {
          const rooms =
            hotel.accommodationType === 'double' ? Math.ceil(hotel.paxCount / 2) : hotel.paxCount
          return sum + rooms * hotel.pricePerRoom * hotel.nights
        }, 0) || 0

    const activitiesCost =
      estimateData.tourDays?.reduce((sum, day) => {
        return (
          sum +
          (day.activities?.reduce((daySum, activity) => daySum + (activity.cost || 0), 0) || 0)
        )
      }, 0) || 0

    const optionalServicesCost =
      estimateData.optionalServices?.reduce((sum, service) => sum + service.price, 0) || 0

    return hotelsCost + activitiesCost + optionalServicesCost
  }

  function calculateMarkupAmount(estimateData) {
    const baseCost = calculateBaseCost(estimateData)
    return (baseCost * estimateData.markup) / 100
  }

  function calculateFinalCost(estimateData) {
    const baseCost = calculateBaseCost(estimateData)
    const markupAmount = calculateMarkupAmount(estimateData)
    return baseCost + markupAmount
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    estimates,
    currentEstimate,
    loading,
    error,

    // Getters
    getEstimates,
    getEstimateById,
    getDrafts,
    getPublished,
    getTotalCost,

    // Actions
    loadEstimates,
    getEstimate,
    saveEstimate,
    saveDraft,
    deleteEstimate,
    exportToCSV,
    exportToPDF,
    clearError,
  }
})
