import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RezepteErstellen from '../../views/RezepteErstellen.vue'

const createRecipeMock = vi.fn()
const updateRecipeMock = vi.fn()
const getRecipeByIdMock = vi.fn()

vi.mock('../../api', () => {
  return {
    createRecipe: (...args: any[]) => createRecipeMock(...args),
    updateRecipe: (...args: any[]) => updateRecipeMock(...args),
    getRecipeById: (...args: any[]) => getRecipeByIdMock(...args)
  }
})

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock })
}))

describe('RezepteErstellen.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    createRecipeMock.mockReset()
    updateRecipeMock.mockReset()
    getRecipeByIdMock.mockReset()
    pushMock.mockReset()
  })

  it('rendert das Formular', () => {
    const wrapper = mount(RezepteErstellen)
    expect(wrapper.text()).toContain('Neues Rezept erstellen')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('zeigt Fehler wenn Pflichtfelder fehlen', async () => {
    const wrapper = mount(RezepteErstellen)

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('Bitte Titel/Namen angeben.')
    expect(wrapper.text()).toContain('Bitte Kategorie wählen.')
  })

  it('sendet createRecipe mit korrekt gebautem Payload', async () => {
    const wrapper = mount(RezepteErstellen)

    // Formular füllen
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
    await inputs[0]!.setValue('Spaghetti')

    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(2)
    await selects[0]!.setValue('Hauptgerichte') // category
    await selects[1]!.setValue('medium')       // difficulty

    const timeInput = wrapper.find('input[type="number"]')
    expect(timeInput.exists()).toBe(true)
    await timeInput.setValue('25')

    const textareas = wrapper.findAll('textarea')
    expect(textareas.length).toBeGreaterThanOrEqual(2)
    await textareas[0]!.setValue('Nudeln\nTomaten')
    await textareas[1]!.setValue('Kochen\nEssen')

    createRecipeMock.mockResolvedValue({ data: { id: 99 } })

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(createRecipeMock).toHaveBeenCalledTimes(1)

    const payload = createRecipeMock.mock.calls[0]![0] as any
    expect(payload.name).toBe('Spaghetti')
    expect(payload.ingredients).toContain('Nudeln')
    expect(payload.ingredients).toContain('Tomaten')
    expect(payload.instructions).toContain('Kochen')
    expect(payload.instructions).toContain('Essen')

    expect(payload.category).toEqual({ name: 'Hauptgerichte' })
    expect(payload.imageUrl === undefined || typeof payload.imageUrl === 'string').toBe(true)
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('im Edit-Mode lädt Rezeptdaten und ruft updateRecipe auf', async () => {
    getRecipeByIdMock.mockResolvedValue({
      data: {
        id: 5,
        name: 'Alt-Rezept',
        category: { name: 'Vegetarisch' },
        ingredients: 'A\nB',
        instructions: 'X\nY',
        time: 10,
        difficulty: 'easy',
        imageUrl: ''
      }
    })

    const wrapper = mount(RezepteErstellen, {
      props: { id: '5' }
    })

    await nextTick()
    await nextTick()

    const nameInput = wrapper.find('input[type="text"]')
    expect((nameInput.element as HTMLInputElement).value).toBe('Alt-Rezept')

    updateRecipeMock.mockResolvedValue({ data: {} })

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(updateRecipeMock).toHaveBeenCalledTimes(1)

    const call = updateRecipeMock.mock.calls[0]
    expect(call).toBeTruthy()

    const idArg = call![0]
    const payloadArg = call![1] as any

    expect(idArg).toBe(5)
    expect(payloadArg.name).toBe('Alt-Rezept')
    expect(payloadArg.category).toEqual({ name: 'Vegetarisch' })

    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
