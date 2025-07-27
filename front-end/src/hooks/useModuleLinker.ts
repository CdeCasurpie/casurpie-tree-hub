import { useState, useEffect, useMemo } from 'react'
import { moduleService } from '@/services/moduleService'

type NodeState = 'completed' | 'available' | 'locked' | 'free'

interface ProcessedModule {
  id: string
  title: string
  slug: string
  description: string
  price: number
  is_free: boolean
  background_color: string
  thumbnail_url?: string
  
  // Estados calculados
  state: NodeState
  hasAccess: boolean
  isCompleted: boolean
  
  // Estructura del árbol
  parentIds: string[]
  childrenIds: string[]
  level: number
  
  // Posición para renderizado
  position: { x: number, y: number }
}

interface ProcessedTree {
  modules: Map<string, ProcessedModule>
  rootModules: string[]
  connections: Array<{ from: { x: number, y: number }, to: { x: number, y: number } }>
}

interface UseModuleLinkerProps {
  rawModules: any[]
  userProgress: any[]
  user: any
}

export const useModuleLinker = ({ rawModules, userProgress, user }: UseModuleLinkerProps) => {
  const [processedTree, setProcessedTree] = useState<ProcessedTree | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Procesar datos cuando cambien
  useEffect(() => {
    if (rawModules.length > 0 && user) {
      processModuleTree()
    }
  }, [rawModules, userProgress, user])

  const processModuleTree = async () => {
    setLoading(true)
    
    try {
      // 1. Crear mapa de progreso
      const progressMap = new Map(userProgress.map(p => [p.module_id, p]))
      
      // 2. Para cada módulo, verificar acceso y calcular estado
      const modulesWithAccess = await Promise.all(
        rawModules.map(async (module) => {
          const { data: hasAccess } = await moduleService.checkModuleAccess(user.id, module.id)
          const progress = progressMap.get(module.id)
          
          // Calcular estado según acceso y progreso
          let state: NodeState = 'locked'
          if (module.is_free) {
            state = progress?.completed_at ? 'completed' : 'free'
          } else if (hasAccess) {
            state = progress?.completed_at ? 'completed' : 'available'
          }
          
          return {
            id: module.id,
            title: module.title,
            slug: module.slug,
            description: module.description,
            price: module.price,
            is_free: module.is_free,
            background_color: module.background_color,
            thumbnail_url: module.thumbnail_url,
            parentIds: module.parent_ids || [],
            childrenIds: [],
            hasAccess: hasAccess || module.is_free,
            isCompleted: !!progress?.completed_at,
            state,
            level: 0,
            position: { x: 0, y: 0 }
          }
        })
      )

      // 3. Calcular estructura de árbol y posiciones
      const tree = calculateTreeLayout(modulesWithAccess)
      setProcessedTree(tree)
    } catch (error) {
      console.error('Error processing module tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTreeLayout = (modules: ProcessedModule[]): ProcessedTree => {
    const moduleMap = new Map<string, ProcessedModule>()
    modules.forEach(module => moduleMap.set(module.id, module))

    // 1. Establecer relaciones hijo-padre
    modules.forEach(module => {
      module.parentIds.forEach(parentId => {
        const parent = moduleMap.get(parentId)
        if (parent && !parent.childrenIds.includes(module.id)) {
          parent.childrenIds.push(module.id)
        }
      })
    })

    // 2. Encontrar nodos raíz (sin padres)
    const rootModules = modules.filter(module => module.parentIds.length === 0)

    // 3. Calcular niveles usando BFS
    const levels: ProcessedModule[][] = []
    const visited = new Set<string>()
    const queue: { module: ProcessedModule, level: number }[] = []

    // Iniciar con nodos raíz en nivel 0
    rootModules.forEach(module => {
      queue.push({ module, level: 0 })
      visited.add(module.id)
    })

    while (queue.length > 0) {
      const { module, level } = queue.shift()!
      module.level = level

      if (!levels[level]) levels[level] = []
      levels[level].push(module)

      // Agregar hijos al siguiente nivel
      module.childrenIds.forEach(childId => {
        if (!visited.has(childId)) {
          const child = moduleMap.get(childId)
          if (child) {
            queue.push({ module: child, level: level + 1 })
            visited.add(childId)
          }
        }
      })
    }

    // 4. Calcular posiciones X,Y para cada nivel con más separación
    const nodeWidth = 160  // Coincide con NODE_WIDTH del canvas
    const nodeHeight = 70  // Coincide con NODE_HEIGHT del canvas
    const levelSpacing = 140  // Más separación vertical
    const nodeSpacing = 220   // Más separación horizontal

    levels.forEach((levelModules, levelIndex) => {
      const levelY = levelIndex * levelSpacing + 50
      const totalWidth = (levelModules.length - 1) * nodeSpacing
      const startX = Math.max(50, (1000 - totalWidth) / 2) // Centrar en un área más amplia

      levelModules.forEach((module, moduleIndex) => {
        module.position = {
          x: startX + (moduleIndex * nodeSpacing),
          y: levelY
        }
      })
    })

    // 5. Crear conexiones entre nodos
    const connections: Array<{ from: { x: number, y: number }, to: { x: number, y: number } }> = []
    
    modules.forEach(module => {
      module.childrenIds.forEach(childId => {
        const child = moduleMap.get(childId)
        if (child) {
          connections.push({
            from: {
              x: module.position.x + nodeWidth / 2,
              y: module.position.y + nodeHeight
            },
            to: {
              x: child.position.x + nodeWidth / 2,
              y: child.position.y
            }
          })
        }
      })
    })

    return {
      modules: moduleMap,
      rootModules: rootModules.map(m => m.id),
      connections
    }
  }

  return {
    processedTree,
    selectedModule,
    setSelectedModule,
    loading
  }
}