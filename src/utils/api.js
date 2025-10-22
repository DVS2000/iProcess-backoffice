import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      // Use set() para garantir apenas um Authorization, com fallback para objeto simples
      if (options.headers?.set) {
        options.headers.set('Authorization', `Bearer ${accessToken}`)
      }
      else {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }
  },
  async onResponseError({ response }) {
    if (response && response.status === 401) {
      try {
        const accessToken = useCookie('accessToken')

        accessToken.value = null

        const userData = useCookie('userData')

        if (userData) userData.value = null
      }
      catch (e) {
        console.error('[Logout] Falha ao limpar cookies:', e)
      }
      try {
        const router = useRouter()
        
        router.push({ name: 'login' })
      }
      catch (_) {
        location.assign('/login')
      }
    }
  },
})
