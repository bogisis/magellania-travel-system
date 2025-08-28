import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/common/BaseButton.vue'
import { Plus, Trash2 } from 'lucide-vue-next'

describe('BaseButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('renders with icon', () => {
    const wrapper = mount(BaseButton, {
      props: {
        icon: Plus,
      },
      slots: {
        default: 'Add',
      },
    })

    expect(wrapper.text()).toBe('Add')
  })

  it('emits click event', async () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger']

    variants.forEach((variant) => {
      const wrapper = mount(BaseButton, {
        props: { variant },
        slots: { default: 'Button' },
      })

      if (variant === 'primary') {
        expect(wrapper.classes()).toContain('bg-primary-600')
      } else if (variant === 'secondary') {
        expect(wrapper.classes()).toContain('bg-gray-100')
      } else if (variant === 'outline') {
        expect(wrapper.classes()).toContain('border')
      } else if (variant === 'ghost') {
        expect(wrapper.classes()).toContain('text-gray-700')
      } else if (variant === 'danger') {
        expect(wrapper.classes()).toContain('bg-red-600')
      }
    })
  })

  it('applies different sizes', () => {
    const sizes = ['sm', 'md', 'lg']

    sizes.forEach((size) => {
      const wrapper = mount(BaseButton, {
        props: { size },
        slots: { default: 'Button' },
      })

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm h-8',
        md: 'px-4 py-2 text-sm h-10',
        lg: 'px-6 py-3 text-base h-12',
      }

      expect(wrapper.classes()).toContain(sizeClasses[size].split(' ')[0])
    })
  })

  it('can be disabled', () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Button' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes().some((cls) => cls.includes('disabled'))).toBe(true)
  })

  it('renders without text when no slot provided', () => {
    const wrapper = mount(BaseButton, {
      props: { icon: Plus },
    })

    expect(wrapper.text()).toBe('')
  })
})
