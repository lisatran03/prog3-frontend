import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeCard from '../RecipeCard.vue'

describe('RecipeCard.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const recipes = [
    {
      id: 1,
      name: 'Pasta',
      category: 'Hauptgerichte',
      ingredients: ['Nudeln', 'Tomaten'],
      instructions: 'Kochen',
      time: 20,
      difficulty: 'easy',
      imageUrl: ''
    },
    {
      id: 2,
      name: 'Salat',
      category: 'Vegetarisch',
      ingredients: ['Salat', 'Gurke'],
      instructions: 'Mischen',
      time: 10,
      difficulty: 'easy',
      imageUrl: 'https://example.com/test.jpg'
    }
  ]

  it('rendert die richtige Anzahl Karten', () => {
    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBe(2)
  })

  it('zeigt Platzhalter wenn kein Bild da ist', () => {
    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(0)

    const firstCard = cards[0]!
    expect(firstCard.text()).toContain('Kein Bild')
  })

  it('zeigt Bild wenn imageUrl vorhanden ist', () => {
    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(1)

    const secondCard = cards[1]!
    const img = secondCard.find('img.card__media')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/test.jpg')
  })

  it('emittet "open" beim Klick auf Ansehen', async () => {
    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(0)

    const firstCard = cards[0]!
    const ansehenBtn = firstCard.find('button.btn-ghost')
    expect(ansehenBtn.exists()).toBe(true)

    await ansehenBtn.trigger('click')
    expect(wrapper.emitted('open')).toBeTruthy()
    expect(wrapper.emitted('open')![0]![0]).toMatchObject({ id: 1, name: 'Pasta' })
  })

  it('emittet "delete" nur wenn confirm=true', async () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(0)

    const firstCard = cards[0]!
    const deleteBtn = firstCard.find('button.btn-delete')
    expect(deleteBtn.exists()).toBe(true)

    await deleteBtn.trigger('click')

    expect(confirmMock).toHaveBeenCalled()
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]![0]).toBe(1)
  })

  it('emittet "delete" NICHT wenn confirm=false', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = mount(RecipeCard, { props: { recipes } })
    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(0)

    const firstCard = cards[0]!
    const deleteBtn = firstCard.find('button.btn-delete')
    expect(deleteBtn.exists()).toBe(true)

    await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')).toBeFalsy()
  })
})
