'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/main/Button'
import Input from '@/components/main/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Por favor ingresa tu email')
      setLoading(false)
      return
    }

    try {
      const { error } = await authService.resetPassword(email)
      
      if (error) {
        setError('Error al enviar el email. Verifica que el email sea correcto.')
      } else {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              ¡Email enviado!
            </h1>
            <p className="text-text-secondary mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block text-accent-green hover:text-low-green transition-colors"
              >
                Volver al login
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Enviar otro email
              </button>
            </div>
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
              Recuperar Contraseña
            </h1>
            <p className="text-text-secondary">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-accent-green hover:text-low-green transition-colors text-sm"
            >
              ← Volver al login
            </Link>
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