// Mock for @/features/profile/server-functions (studio app)

export const getProfileFn = async () => ({
  id: 'mock-profile-id',
  userId: 'mock-user-id',
  username: 'mockuser',
  firstName: 'Mock',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
})
