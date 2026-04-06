export type Sql = {
  end: (_options?: { timeout?: number }) => Promise<void>
}

export default function postgres(): Sql {
  return {
    async end() {},
  }
}
