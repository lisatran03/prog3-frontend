import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RezepteErstellen from '../../views/RezepteErstellen.vue'

// --- API Mock ---
const createRecipeMock = vi.fn(() => Promise.resolve({ data: { id: 123 } }))
const updateRecipeMock = vi.fn(() => Promise.resolve({ data: { id: 1 } }))
const getRecipeByIdMock = vi.fn(() =>
  Promise.resolve({
    data: {
      id: 1,
      name: 'Curry',
      category: { name: 'Hauptgerichte' },
      time: 30,
      difficulty: 'easy',
      imageUrl: 'https://example.com/curry.jpg',
      ingredients: 'Reis\nCurry',
      instructions: 'Kochen\nServieren'
    }
  })
)


vi.mock('../../api', () => ({
  createRecipe: (...args: Parameters<typeof createRecipeMock>) => createRecipeMock(...args),
  updateRecipe: (...args: Parameters<typeof updateRecipeMock>) => updateRecipeMock(...args),
  getRecipeById: (...args: Parameters<typeof getRecipeByIdMock>) => getRecipeByIdMock(...args)
}))

// --- Router Mock (useRouter) ---
const pushMock = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock
    })
  }
})

async function flush() {
  // mini "flushPromises"
  await Promise.resolve()
  await nextTick()
}

describe('RezepteErstellen.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // alert mocken, sonst nervt im Test
    vi.stubGlobal('alert', vi.fn())
  })

  it('rendert das Formular', () => {
    const wrapper = mount(RezepteErstellen)
    expect(wrapper.text()).toContain('Neues Rezept erstellen')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('validiert: ohne Pflichtfelder -> kein createRecipe Call', async () => {
    const wrapper = mount(RezepteErstellen)

    // direkt submit ohne Felder
    await wrapper.find('form').trigger('submit.prevent')
    await flush()

    expect(createRecipeMock).not.toHaveBeenCalled()
    expect(updateRecipeMock).not.toHaveBeenCalled()

    // optional: prüfe Fehlermeldung
    expect(wrapper.text()).toContain('Bitte Titel/Namen angeben.')
  })

  it('Create-Flow: sendet createRecipe mit korrekten Daten', async () => {
    const wrapper = mount(RezepteErstellen)

    // Inputs füllen
    await wrapper.find('input[type="text"]').setValue('Pasta')
    await wrapper.find('select').setValue('Hauptgerichte')
    await wrapper.find('input[type="number"]').setValue('20')

    // Schwierigkeit: 2. select im Formular (Kategorie ist erstes)
    const selects = wrapper.findAll('select')
    await selects[1].setValue('medium')

    // Zutaten textarea (erste)
    const textareas = wrapper.findAll('textarea')
    await textareas[0].setValue('Nudeln\nTomaten')

    // Schritte textarea (zweite)
    await textareas[1].setValue('Kochen\nEssen')

    // submit
    await wrapper.find('form').trigger('submit.prevent')
    await flush()

    expect(createRecipeMock).toHaveBeenCalledTimes(1)

    const payload = createRecipeMock.mock.calls[0][0]

    // Pflichtfelder drin?
    expect(payload).toEqual(
      expect.objectContaining({
        name: 'Pasta',
        time: 20,
        difficulty: 'medium',
        ingredients: expect.any(String),
        instructions: expect.any(String)
      })
    )

    // Zutaten/Anweisungen als String mit Zeilenumbrüchen:
    expect(payload.ingredients).toContain('Nudeln')
    expect(payload.ingredients).toContain('Tomaten')
    expect(payload.instructions).toContain('Kochen')
    expect(payload.instructions).toContain('Essen')

    // Kategorie: akzeptiere beides (string ODER {name}) – je nachdem wie du es im Code sendest
    const cat = payload.category
    const ok =
      typeof cat === 'string'
        ? cat === 'Hauptgerichte'
        : cat && typeof cat === 'object' && cat.name === 'Hauptgerichte'
    expect(ok).toBe(true)

    // nach Save -> zurück zur Home
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('Edit-Flow: lädt Rezeptdaten, und Submit ruft updateRecipe auf', async () => {
    const wrapper = mount(RezepteErstellen, {
      props: { id: '1' }
    })

    // wartet bis onMounted load fertig ist
    await flush()
    await flush()

    // getRecipeById wurde aufgerufen
    expect(getRecipeByIdMock).toHaveBeenCalledWith(1)

    // sollte die geladenen Werte im UI zeigen (Name z.B.)
    expect(wrapper.find('input[type="text"]').element).toBeTruthy()
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('Curry')

    // jetzt etwas ändern und submit
    await wrapper.find('input[type="text"]').setValue('Curry Updated')
    await wrapper.find('form').trigger('submit.prevent')
    await flush()

    expect(updateRecipeMock).toHaveBeenCalledTimes(1)
    const [id, payload] = updateRecipeMock.mock.calls[0]

    expect(id).toBe(1)
    expect(payload).toEqual(
      expect.objectContaining({
        name: 'Curry Updated'
      })
    )

    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
