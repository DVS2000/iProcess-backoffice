import { mount } from '@vue/test-utils'
import CrudPage from './CrudPage.vue'

describe('CrudPage', () => {
  it('renderiza título', () => {
    const wrapper = mount(CrudPage, {
      props: { resource: '/plan', title: 'Planos', fields: [] },
    })

    expect(wrapper.text()).toContain('Planos')
  })
})