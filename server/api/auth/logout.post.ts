export default defineEventHandler(async (event) => {
  // In a stateless setup, logout is typically handled client-side
  // This endpoint can be used to clear server-side sessions if needed
  
  return {
    message: 'Logged out successfully',
  }
})
