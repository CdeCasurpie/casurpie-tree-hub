interface ProcessedModule {
  id: string
  title: string
  slug: string
  description: string
  price: number
  is_free: boolean
  background_color: string
  state: 'completed' | 'available' | 'locked' | 'free'
  hasAccess: boolean
  isCompleted: boolean
  position: { x: number, y: number }
}

interface ProcessedTree {
  modules: Map<string, ProcessedModule>
  rootModules: string[]
  connections: Array<{ from: { x: number, y: number }, to: { x: number, y: number } }>
}

interface Props {
  tree: ProcessedTree | null
  selectedModule: string | null
  onModuleClick: (moduleId: string) => void
}

export const ModuleTreeVisualizer = ({ tree, selectedModule, onModuleClick }: Props) => {
  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Cargando árbol de módulos...</div>
      </div>
    )
  }

  // Calcular el área total del árbol para el scroll
  const modules = Array.from(tree.modules.values())
  const maxX = Math.max(...modules.map(m => m.position.x)) + 200
  const maxY = Math.max(...modules.map(m => m.position.y)) + 100

  return (
    <div className="relative w-full h-full overflow-auto bg-bg-principal">
      {/* SVG para líneas de conexión */}
      <svg 
        className="absolute inset-0 pointer-events-none" 
        width={maxX} 
        height={maxY}
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        {tree.connections.map((conn, idx) => (
          <line
            key={idx}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#32332e"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        ))}
      </svg>
      
      {/* Container para los nodos con posicionamiento absoluto */}
      <div 
        className="relative"
        style={{ width: maxX, height: maxY, minWidth: '100%', minHeight: '100%' }}
      >
        {/* Nodos del árbol */}
        {modules.map((module) => {
          const isSelected = selectedModule === module.id
          
          // Determinar estilos según el estado
          let nodeStyles = ''
          let borderStyles = ''
          
          switch (module.state) {
            case 'completed':
              nodeStyles = 'bg-accent-green text-text-primary'
              borderStyles = 'border-accent-green'
              break
            case 'available':
              nodeStyles = `text-text-primary`
              borderStyles = 'border-border-accent'
              break
            case 'locked':
              nodeStyles = 'text-text-primary' // Sin opacity, clickeable
              borderStyles = 'border-border'
              break
            case 'free':
              nodeStyles = `text-text-primary`
              borderStyles = 'border-low-green border-2'
              break
          }

          return (
            <div
              key={module.id}
              className={`absolute cursor-pointer rounded-lg border-2 p-3 text-center font-medium transition-all hover:scale-105 ${nodeStyles} ${borderStyles} ${
                isSelected ? 'ring-2 ring-accent-green ring-offset-2 ring-offset-bg-principal' : ''
              }`}
              style={{
                left: module.position.x,
                top: module.position.y,
                width: '150px',
                height: '60px',
                backgroundColor: module.state === 'locked' 
                  ? '#20231c' 
                  : module.state === 'completed' 
                    ? undefined 
                    : module.background_color
              }}
              onClick={() => onModuleClick(module.id)} // Todos los módulos son clickeables
            >
              <div className="text-sm truncate font-semibold">
                {module.title}
              </div>
              
              {/* Indicador de estado */}
              <div className="text-xs mt-1 opacity-75">
                {module.state === 'completed' && '✓ Completado'}
                {module.state === 'available' && `S/${module.price}`}
                {module.state === 'locked' && 'Comprar'}
                {module.state === 'free' && 'GRATIS'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}