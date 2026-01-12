"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActivityUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
}

export function ActivityUploadDialog({ isOpen, onClose, onUpload }: ActivityUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Import Activity</h2>
              <button onClick={onClose} className="text-foreground/70 hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            {/* Upload Zone */}
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              animate={{
                borderColor: isDragging ? "rgb(61, 93, 245)" : "rgb(200, 200, 200)",
                backgroundColor: isDragging ? "rgb(61, 93, 245, 0.05)" : "rgb(0, 0, 0, 0)",
              }}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition"
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-primary" />
              <p className="font-semibold text-foreground mb-2">Drag and drop your file here</p>
              <p className="text-sm text-foreground/70 mb-4">or</p>

              <label className="inline-block">
                <input type="file" onChange={handleFileSelect} accept=".gpx,.csv,.json" className="hidden" />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Select File</Button>
              </label>

              <p className="text-xs text-foreground/50 mt-4">Supported: GPX, CSV, JSON</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
