import { Sparkles, FileEdit, Wand2, RefreshCw } from 'lucide-react'

export type Operation = 'auto-generate' | 'improve-writing' | 'improve-description' | 'rewrite'

interface OperationMenuProps {
  onSelect: (operation: Operation) => void
}

const operations = [
  {
    id: 'auto-generate' as Operation,
    label: '✨ Auto-generate description',
    icon: Sparkles,
    description: 'Create from scratch based on context'
  },
  {
    id: 'improve-writing' as Operation,
    label: '✨ Improve writing',
    icon: FileEdit,
    description: 'Fix grammar and clarity'
  },
  {
    id: 'improve-description' as Operation,
    label: '✨ Improve Description',
    icon: Wand2,
    description: 'Enhance with more detail'
  },
  {
    id: 'rewrite' as Operation,
    label: '✨ Rewrite',
    icon: RefreshCw,
    description: 'Complete rewrite with fresh angle'
  }
]

export function OperationMenu({ onSelect }: OperationMenuProps) {
  return (
    <div className="w-56 p-2">
      <div className="px-2 py-1.5 mb-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          AI Assistant
        </p>
      </div>

      {operations.map((op) => (
        <button
          key={op.id}
          onClick={() => onSelect(op.id)}
          className="w-full flex items-start gap-2 px-2 py-2 hover:bg-teal-50 rounded-lg transition-colors group text-left"
        >
          <op.icon className="w-4 h-4 text-teal-600 mt-0.5 group-hover:text-teal-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 group-hover:text-teal-900">
              {op.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {op.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}