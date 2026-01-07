import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeCard from '../RecipeCard.vue'

describe('RecipeCard.vue', () => {
  const recipes = [
    {
      id: 1,
      name: 'Bruschetta',
      category: 'Vorspeisen',
      ingredients: ['Tomaten', 'Brot'],
      instructions: 'Mixen',
      imageUrl: '',
      time: 10,
      difficulty: 'easy'
    },
    {
      id: 2,
      name: 'Käse Salat',
      category: 'Vegetarisch',
      ingredients: ['Käse', 'Salat'],
      instructions: 'Mischen',
      imageUrl: 'https://example.com/img.jpg',
      time: 15,
      difficulty: 'medium'
    }
  ]

  beforeEach(() => {
    // confirm standardmäßig "OK"
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('rendert die richtige Anzahl Karten', () => {
    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    const cards = wrapper.findAll('.card')
    expect(cards.length).toBe(2)
  })

  it('zeigt Name und Kategorie an', () => {
    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    expect(wrapper.text()).toContain('Bruschetta')
    expect(wrapper.text()).toContain('Vorspeisen')

    expect(wrapper.text()).toContain('Käse Salat')
    expect(wrapper.text()).toContain('Vegetarisch')
  })

  it('emittiert "open" mit Rezept bei Klick auf "Ansehen"', async () => {
    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    const firstCard = wrapper.findAll('.card')[0]
    const ansehenBtn = firstCard.find('button.btn-ghost')

    await ansehenBtn.trigger('click')

    const events = wrapper.emitted('open')
    expect(events).toBeTruthy()
    expect(events?.[0]).toEqual([recipes[0]])
  })

  it('emittiert "delete" mit ID, wenn confirm true ist', async () => {
    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    const firstCard = wrapper.findAll('.card')[0]
    const deleteBtn = firstCard.find('button.btn-delete')

    await deleteBtn.trigger('click')

    const events = wrapper.emitted('delete')
    expect(events).toBeTruthy()
    expect(events?.[0]).toEqual([1])
  })

  it('emittiert "delete" NICHT, wenn confirm false ist', async () => {
    // confirm auf Abbrechen
    vi.stubGlobal('confirm', vi.fn(() => false))

    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    const firstCard = wrapper.findAll('.card')[0]
    const deleteBtn = firstCard.find('button.btn-delete')

    await deleteBtn.trigger('click')

    expect(wrapper.emitted('delete')).toBeFalsy()
  })

  it('setzt pill--vegetarian Klasse bei vegetarisch', () => {
    const wrapper = mount(RecipeCard, {
      props: { recipes }
    })

    const secondCard = wrapper.findAll('.card')[1]
    const pill = secondCard.find('.pill')
    expect(pill.classes()).toContain('pill--vegetarian')
  })
})
