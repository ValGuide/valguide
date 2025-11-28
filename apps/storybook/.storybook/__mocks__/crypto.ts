export function randomBytes(_size: number) {
  return {
    toString: (_encoding?: string) => {
      return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    },
  }
}

export function createHash(_algorithm: string) {
  return {
    update: (_data: unknown) => {
      return {
        digest: (_encoding?: string) => 'mock-hash',
      }
    },
  }
}
