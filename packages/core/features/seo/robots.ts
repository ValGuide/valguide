export function robotsResponse(blockRobots: boolean): Response {
  const body = blockRobots ? 'User-agent: *\nDisallow: /' : 'User-agent: *\nAllow: /'

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
