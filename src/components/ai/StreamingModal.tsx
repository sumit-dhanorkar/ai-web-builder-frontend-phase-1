import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Operation } from './OperationMenu'

interface StreamingModalProps {
  isOpen: boolean
  onClose: () => void
  operation: Operation | null
  streamedText: string
  isStreaming: boolean
  onAccept: () => void
  error: string | null
}

const operationTitles: Record<Operation, string> = {
  'auto-generate': '✨ Generating Description...',
  'improve-writing': '✨ Improving Writing...',
  'improve-description': '✨ Improving Description...',
  'rewrite': '✨ Rewriting...'
}

export function StreamingModal({
  isOpen,
  onClose,
  operation,
  streamedText,
  isStreaming,
  onAccept,
  error
}: StreamingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operation && operationTitles[operation]}
            {isStreaming && (
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* Streaming Text Area */}
          <div className="relative flex-1 min-h-0">
            <Textarea
              value={streamedText}
              readOnly
              rows={15}
              className="resize-none font-sans text-sm h-full min-h-[300px] overflow-y-auto"
              placeholder={isStreaming ? "AI is thinking..." : "Generated text will appear here..."}
            />

            {/* Animated Cursor During Streaming */}
            <AnimatePresence>
              {isStreaming && streamedText && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                  className="absolute bottom-4 right-4 w-1 h-4 bg-teal-500 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Progress Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating content...</span>
              <span className="text-xs text-gray-500">
                ({streamedText.length} characters)
              </span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isStreaming}
          >
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={isStreaming || !streamedText || !!error}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Accept & Apply'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}