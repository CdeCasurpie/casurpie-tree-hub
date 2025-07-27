import { supabase } from '../lib/supabase'

export const moduleService = {
  // Usar función RPC get_module_tree()
  async getModuleTree() {
    const { data, error } = await supabase.rpc('get_module_tree')
    return { data, error }
  },

  // Obtener progreso del usuario
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('module_id, completed_exercises, last_position, completed_at, started_at')
      .eq('user_id', userId)
    return { data, error }
  },

  // Verificar acceso usando RPC user_has_module_access
  async checkModuleAccess(userId: string, moduleId: string) {
    const { data, error } = await supabase.rpc('user_has_module_access', {
      user_uuid: userId,
      module_uuid: moduleId
    })
    return { data, error }
  },

  // Verificar acceso al modo infinito
  async checkInfiniteModeAccess(userId: string) {
    const { data, error } = await supabase.rpc('user_has_infinite_mode_access', {
      user_uuid: userId
    })
    return { data, error }
  },

  // Suscripción activa usando RPC
  async getActiveSubscription(userId: string) {
    const { data, error } = await supabase.rpc('get_user_active_subscription', {
      user_uuid: userId
    })
    return { data, error }
  },

  // Combinar todo: módulos + acceso + progreso
  async getModulesWithAccess(userId: string) {
    try {
      // 1. Obtener módulos del árbol
      const { data: modules, error: modulesError } = await this.getModuleTree()
      if (modulesError) throw modulesError

      // 2. Obtener progreso del usuario
      const { data: progress, error: progressError } = await this.getUserProgress(userId)
      if (progressError) throw progressError

      // 3. Obtener suscripción activa
      const { data: subscription } = await this.getActiveSubscription(userId)

      // 4. Crear mapa de progreso para búsqueda rápida
      const progressMap = new Map()
      progress?.forEach(p => progressMap.set(p.module_id, p))

      // 5. Para cada módulo, verificar acceso y combinar datos
      const modulesWithAccess = await Promise.all(
        (modules || []).map(async (module: any) => {
          const { data: hasAccess } = await this.checkModuleAccess(userId, module.id)
          const moduleProgress = progressMap.get(module.id)
          
          return {
            ...module,
            hasAccess: hasAccess || module.is_free,
            progress: moduleProgress,
            isCompleted: !!moduleProgress?.completed_at,
            subscription
          }
        })
      )

      return { data: modulesWithAccess, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Comprar acceso a un módulo
  async purchaseModule(userId: string, moduleId: string, amount: number) {
    const { data, error } = await supabase
      .from('user_purchases')
      .insert({
        user_id: userId,
        module_id: moduleId,
        purchase_type: 'module',
        amount_paid: amount,
        starts_at: new Date().toISOString(),
        is_active: true
      })
    
    return { data, error }
  }
}