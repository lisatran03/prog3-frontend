import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../../views/HomeView.vue'


vi.mock('../../api', () => ({
  getRecipes: () =>
    Promise.resolve({
      data: [
        { id: 1, name: 'Bruschetta', category: { name: 'Vorspeisen' }, ingredients: 'Tomaten', instructions: 'Mischen' },
        { id: 2, name: 'Pasta', category: { name: 'Hauptgerichte' }, ingredients: 'Nudeln', instructions: 'Kochen' },
      ],
    }),
  deleteRecipe: () => Promise.resolve(),
}))

describe('HomeView', () => {
  it('filtert Rezepte nach Suchbegriff', async () => {
    const wrapper = mount(HomeView)

    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    // Suchfeld setzen
    const input = wrapper.find('input#q')
    await input.setValue('brus')

    // es sollte nur noch Bruschetta enthalten
    expect(wrapper.text()).toContain('Bruschetta')
    expect(wrapper.text()).not.toContain('Pasta')
  })
})
