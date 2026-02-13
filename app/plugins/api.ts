export default defineNuxtPlugin(() => {
  const authToken = useCookie('auth_token')

  const api = $fetch.create({
    onRequest({ options }) {
      const token = authToken.value

      if (token) {
        const headers = new Headers(options.headers || {})
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
