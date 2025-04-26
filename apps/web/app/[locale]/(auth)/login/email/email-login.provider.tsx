import { createContext, PropsWithChildren, useContext } from 'react'

export type OnSubmit = (values: { email: string }) => Promise<void>

const Context = createContext<{
  onSubmit: OnSubmit
}>({
  onSubmit: async () => {
    throw new Error('EmailLoginProvider not found')
  },
})

export type EmailLoginProviderProps = PropsWithChildren<{
  onSubmit: OnSubmit
}>

export const EmailLoginProvider = ({ children, onSubmit }: EmailLoginProviderProps) => {
  return <Context.Provider value={{ onSubmit }}>{children}</Context.Provider>
}

export const useEmailLogin = () => useContext(Context)
