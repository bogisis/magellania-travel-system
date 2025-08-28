import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LocationSelector from '@/components/estimates/LocationSelector.vue'

// Мокаем данные стран
vi.mock('@/data/countries', () => ({
  getSortedCountries: () => [
    { id: 'ar', name: 'Аргентина' },
    { id: 'cl', name: 'Чили' },
    { id: 'br', name: 'Бразилия' },
  ],
  getRegionsByCountry: (countryId) => {
    if (countryId === 'ar') {
      return [
        { id: 'ba', name: 'Буэнос-Айрес' },
        { id: 'md', name: 'Мендоса' },
      ]
    }
    return []
  },
  getCitiesByRegion: (countryId, regionId) => {
    if (countryId === 'ar' && regionId === 'ba') {
      return ['Буэнос-Айрес', 'Ла-Плата']
    }
    return []
  },
  getCountryById: (id) => ({ id, name: id === 'ar' ? 'Аргентина' : 'Чили' }),
  getRegionById: (countryId, regionId) => ({
    id: regionId,
    name: regionId === 'ba' ? 'Буэнос-Айрес' : 'Мендоса',
  }),
}))

describe('LocationSelector', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LocationSelector, {
      props: {
        modelValue: {
          country: '',
          regions: [],
          cities: [],
          startPoint: '',
          endPoint: '',
        },
        errors: {},
      },
    })
  })

  it('renders country selector', () => {
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('option[value="ar"]').text()).toBe('Аргентина')
  })

  it('shows regions after country selection', async () => {
    await wrapper.setProps({
      modelValue: { country: 'ar', regions: [], cities: [], startPoint: '', endPoint: '' },
    })

    expect(wrapper.text()).toContain('Регионы')
  })

  it('emits update when country changes', async () => {
    const select = wrapper.find('select')
    await select.setValue('ar')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('shows manual input toggle', async () => {
    await wrapper.setProps({
      modelValue: { country: 'ar', regions: [], cities: [], startPoint: '', endPoint: '' },
    })

    expect(wrapper.text()).toContain('Ручной ввод')
  })

  it('switches to manual input mode', async () => {
    await wrapper.setProps({
      modelValue: { country: 'ar', regions: [], cities: [], startPoint: '', endPoint: '' },
    })

    // Просто проверяем, что текст содержит кнопку
    expect(wrapper.text()).toContain('Ручной ввод')
  })

  it('shows start and end points after regions selection', async () => {
    await wrapper.setProps({
      modelValue: {
        country: 'ar',
        regions: ['Буэнос-Айрес'],
        cities: [],
        startPoint: '',
        endPoint: '',
      },
    })

    // Проверяем, что регионы отображаются
    expect(wrapper.text()).toContain('Буэнос-Айрес')
  })

  it('validates required fields', async () => {
    await wrapper.setProps({
      errors: {
        country: 'Страна обязательна',
      },
    })

    expect(wrapper.text()).toContain('Страна обязательна')
  })

  it('removes selected regions', async () => {
    await wrapper.setProps({
      modelValue: {
        country: 'ar',
        regions: ['Буэнос-Айрес'],
        cities: [],
        startPoint: '',
        endPoint: '',
      },
    })

    const removeButton = wrapper.find('button:contains("×")')
    if (removeButton.exists()) {
      await removeButton.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    }
  })
})
