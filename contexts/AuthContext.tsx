'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'Administrador' | 'Vendedor' | 'Contable'

export interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  localId: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios hardcodeados
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'admin@empresa.com',
    password: 'admin123',
    rol: 'Administrador',
    localId: '1'
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'vendedor@empresa.com',
    password: 'vendedor123',
    rol: 'Vendedor',
    localId: '2'
  },
  {
    id: '3',
    nombre: 'Carlos Rodríguez',
    email: 'contable@empresa.com',
    password: 'contable123',
    rol: 'Contable',
    localId: '1'
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const storedUser = localStorage.getItem('erp_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    )

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('erp_user', JSON.stringify(userWithoutPassword))
      localStorage.setItem('selectedLocal', foundUser.localId)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('erp_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
