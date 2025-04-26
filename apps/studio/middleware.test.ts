/**
 * Required to mock Request/Response
 * @jest-environment node
 */

describe('middleware', () => {
  it('fix next-auth import errors and re-enable all tests', async () => {})
})

/**

 import { NextResponse } from 'next/server'
 import type { MockRequestParams } from '@/utils/middleware-test-utils'
 import { mockFetchEvent, mockRequest } from '@/utils/middleware-test-utils'
 import type { AuthMiddlware } from './middleware'
 import { middlewareFn } from './middleware'

 describe.skip('middleware', () => {
 const baseUrl = 'https://test.demo.com'
 const nextMock = jest.fn(() => NextResponse.next())
 const mockAuth = jest.fn(() => NextResponse.next()) as unknown as AuthMiddlware

 const middleware = middlewareFn(mockAuth)

 describe('redirect to home', () => {
 const data: {
 given: MockRequestParams
 expected: string
 }[] = [
 {
 given: {
 base: baseUrl,
 url: '/login',
 // @ts-expect-error
 session: 'auth-token',
 },
 expected: '/en/home',
 },
 {
 given: {
 base: baseUrl,
 url: '/de/login',
 // @ts-expect-error
 token: 'auth-token',
 },
 expected: '/de/home',
 },
 {
 given: {
 base: baseUrl,
 url: '/signup',
 // @ts-expect-error
 token: 'auth-token',
 },
 expected: '/en/home',
 },
 {
 given: {
 base: baseUrl,
 url: '/de/signup',
 // @ts-expect-error
 token: 'auth-token',
 },
 expected: '/de/home',
 },
 {
 given: {
 base: baseUrl,
 url: '/',
 // @ts-expect-error
 token: 'auth-token',
 },
 expected: '/en/home',
 },
 ]

 data.forEach(({ given, expected }) => {
 it('should redirect to home if already logged in', async () => {
 const req = mockRequest(given)
 const res = await middleware(req, mockFetchEvent())
 expect(res?.status).toEqual(307)
 expect(res?.headers.get('Location')).toEqual(`${baseUrl}${expected}`)
 expect(nextMock).not.toHaveBeenCalled()
 })
 })
 })

 describe('redirect to localised path', () => {
 const data: {
 given: MockRequestParams
 expected: { path: string; locale: string }
 }[] = [
 // defaults to en if no cookie or accept lang header set
 {
 given: {
 base: baseUrl,
 url: '/home',
 },
 expected: { path: '/en/home', locale: 'en' },
 },

 // redirects to locale using cookie
 {
 given: {
 base: baseUrl,
 url: '/home',
 // @ts-expect-error
 token: 'auth-token',
 cookies: {
 'next-locale': 'de',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },

 // redirects to locale using exact accept lang header
 {
 given: {
 base: baseUrl,
 url: '/home',
 // @ts-expect-error
 token: 'auth-token',
 headers: {
 'Accept-Language': 'de',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },

 // redirects to locale using matched accept lang header
 {
 given: {
 base: baseUrl,
 url: '/home',
 // @ts-expect-error
 token: 'auth-token',
 headers: {
 // prios first entry and matches to supported locales (e.g. de-DE --> de)
 'Accept-Language': 'de-De;en-EN',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },

 // prioritises cookies over accept lang header
 {
 given: {
 base: baseUrl,
 url: '/home',
 // @ts-expect-error
 token: 'auth-token',
 cookies: {
 'next-locale': 'en',
 },
 headers: {
 // prios first entry and matches to supported locales (e.g. de-DE --> de)
 'Accept-Language': 'de-De;en-EN',
 },
 },
 expected: {
 path: '/en/home',
 locale: 'en',
 },
 },
 ]

 data.forEach(({ given, expected }) => {
 it('should redirect to localised url', async () => {
 const req = mockRequest(given)
 const res = await middleware(req, mockFetchEvent())
 expect(res?.status).toEqual(307)
 expect(res?.headers.get('Location')).toEqual(
 `${baseUrl}${expected.path}`,
 )

 // @ts-expect-error
 expect(res?.cookies.get('next-locale')?.value).toEqual(expected.locale)
 expect(nextMock).not.toHaveBeenCalled()
 })
 })
 })

 describe('set cookie without redirect if url is localised', () => {
 const data: {
 given: MockRequestParams
 expected: { path: string; locale: string }
 }[] = [
 {
 given: {
 base: baseUrl,
 url: '/en/home',
 // @ts-expect-error
 token: 'auth-token',
 },
 expected: { path: '/en/home', locale: 'en' },
 },
 {
 given: {
 base: baseUrl,
 url: '/de/home',
 // @ts-expect-error
 token: 'auth-token',
 cookies: {
 'next-locale': 'de',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },
 {
 given: {
 base: baseUrl,
 url: '/de/home',
 // @ts-expect-error
 token: 'auth-token',
 headers: {
 'Accept-Language': 'de',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },
 {
 given: {
 base: baseUrl,
 url: '/de/home',
 // @ts-expect-error
 token: 'auth-token',
 headers: {
 'Accept-Language': 'de-De;en-EN',
 },
 },
 expected: { path: '/de/home', locale: 'de' },
 },
 {
 given: {
 base: baseUrl,
 url: '/en/home',
 // @ts-expect-error
 token: 'auth-token',
 cookies: {
 'next-locale': 'en',
 },
 headers: {
 'Accept-Language': 'de-De;en-EN',
 },
 },
 expected: {
 path: '/en/home',
 locale: 'en',
 },
 },
 ]

 data.forEach(({ given, expected }) => {
 it('should not redirect but set cookie', async () => {
 const req = mockRequest(given)
 const res = await middleware(req, mockFetchEvent())
 expect(res?.status).toEqual(200)

 // @ts-expect-error
 expect(res?.cookies.get('next-locale')?.value).toEqual(expected.locale)
 expect(nextMock).toHaveBeenCalledWith(req)
 })
 })
 })
 })

 */
