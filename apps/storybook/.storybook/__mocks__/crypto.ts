export function randomBytes(size: number) {
  return {
    toString: (encoding?: string) => {
      // return a random string of length 'size' * 2 (hex) approx
      return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    },
  }
}

export function createHash(algorithm: string) {
  return {
    update: (data: any) => {
      return {
        digest: (encoding?: string) => 'mock-hash',
      }
    },
  }
}
