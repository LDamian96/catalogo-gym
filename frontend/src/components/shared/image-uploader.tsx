'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  currentImage: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  label?: string;
}

export function ImageUploader({
  currentImage,
  onUpload,
  onDelete,
  isLoading = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 5,
  className,
  aspectRatio = 'square',
  label = 'Subir imagen',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!accept.includes(file.type)) {
      setError('Tipo de archivo no permitido');
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo no debe superar ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        await onUpload(file);
      }
    },
    [onUpload, maxSize, accept]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      await onUpload(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors overflow-hidden',
          aspectRatioClass[aspectRatio],
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={currentImage}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-2">Cambiar</span>
                </Button>
                {onDelete && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={handleClick}
            >
              {isLoading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo {maxSize}MB
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
