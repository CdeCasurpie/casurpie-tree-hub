'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/main/Button'
import Input from '@/components/main/Input'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/modules')
    }
  }, [user, authLoading, router])

  const validateForm = () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return false
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await authService.signUp(email, password, displayName)
      
      if (error) {
        setError(error.message === 'User already registered' 
          ? 'Ya existe una cuenta con este email' 
          : error.message)
      } else if (data.user) {
        setSuccess(true)
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.')
    }
    
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center">
        <div className="text-text-primary">Cargando...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              ¡Cuenta creada!
            </h1>
            <p className="text-text-secondary mb-6">
              Hemos enviado un enlace de verificación a tu email. 
              Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <Link
              href="/auth/login"
              className="text-accent-green hover:text-low-green transition-colors"
            >
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-bg-secondary rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Crear Cuenta
            </h1>
            <p className="text-text-secondary">
              Únete a Casurpie Tree Hub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre completo"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-text-secondary text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="text-accent-green hover:text-low-green transition-colors"
              >
                Inicia sesión
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}