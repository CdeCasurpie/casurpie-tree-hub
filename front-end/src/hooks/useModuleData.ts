import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { moduleService } from '@/services/moduleService'

interface RawModule {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  background_color: string
  price: number
  is_free: boolean
  parent_ids: string[]
}

interface UserProgress {
  module_id: string
  completed_exercises: any[]
  last_position: number
  completed_at: string | null
  started_at: string
}

export const useModuleData = () => {
  const { user } = useAuth()
  const [rawModules, setRawModules] = useState<RawModule[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAllData = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Cargar módulos, progreso y suscripción en paralelo
      const [modulesRes, progressRes, subscriptionRes] = await Promise.all([
        moduleService.getModuleTree(),
        moduleService.getUserProgress(user.id),
        moduleService.getActiveSubscription(user.id)
      ])

      if (modulesRes.error) throw new Error(modulesRes.error.message)
      if (progressRes.error) throw new Error(progressRes.error.message)

      setRawModules(modulesRes.data || [])
      setUserProgress(progressRes.data || [])
      setActiveSubscription(subscriptionRes.data)

    } catch (err: any) {
      console.error('Error loading module data:', err)
      setError(err.message || 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    loadAllData()
  }

  useEffect(() => {
    loadAllData()
  }, [user?.id])

  return {
    rawModules,
    userProgress,
    activeSubscription,
    loading,
    error,
    refetch
  }
}