'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// WhatsApp official logo SVG component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  businessName?: string;
}

export function WhatsAppButton({
  phoneNumber = '51999999999',
  message = '¡Hola! Me interesa conocer más sobre sus productos.',
  businessName = 'el catálogo',
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(message);

  const handleSend = () => {
    const encodedMessage = encodeURIComponent(customMessage);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button - A la derecha en todas las resoluciones */}
      <motion.div
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-14 h-14 rounded-full',
            'bg-[#25D366]',
            'shadow-lg shadow-[#25D366]/30',
            'flex items-center justify-center',
            'group'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#25D366]"
            animate={{
              scale: [1, 1.3, 1.3],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />

          {/* Icon */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <WhatsAppIcon className="w-7 h-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip - Solo en desktop, a la izquierda del botón */}
        {!isOpen && (
          <motion.div
            className="hidden lg:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div className="px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg">
              ¿Necesitas ayuda?
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-40 lg:bottom-28 right-4 lg:right-6 z-40 w-80 max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[#25D366] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">WhatsApp</h3>
                    <p className="text-white/80 text-sm">
                      Respuesta inmediata
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Welcome Message */}
                <div className="mb-4">
                  <div className="bg-slate-100 dark:bg-neutral-800 rounded-2xl rounded-tl-none p-3 inline-block max-w-[85%]">
                    <p className="text-slate-700 dark:text-neutral-200 text-sm">
                      ¡Hola! 👋 Bienvenido a {businessName}. ¿En qué podemos ayudarte?
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Ahora</p>
                </div>

                {/* Message Input */}
                <div className="relative">
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    rows={3}
                    className={cn(
                      'w-full px-4 py-3 pr-12',
                      'bg-slate-100 dark:bg-neutral-800 rounded-xl',
                      'border-0 outline-none resize-none',
                      'text-slate-700 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-500',
                      'text-sm'
                    )}
                  />
                  <motion.button
                    onClick={handleSend}
                    className={cn(
                      'absolute right-2 bottom-2',
                      'w-9 h-9 rounded-full',
                      'bg-[#25D366] text-white',
                      'flex items-center justify-center',
                      'shadow-lg shadow-[#25D366]/30'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Quick Messages */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {['¿Tienen stock?', '¿Hacen envíos?', 'Precios'].map((quick) => (
                    <motion.button
                      key={quick}
                      onClick={() => setCustomMessage(`Hola, ${quick.toLowerCase()}`)}
                      className={cn(
                        'px-3 py-1.5 rounded-full',
                        'bg-slate-100 dark:bg-neutral-800 hover:bg-[#25D366]/10',
                        'text-slate-600 dark:text-neutral-300 hover:text-[#25D366]',
                        'text-xs font-medium',
                        'transition-colors duration-200'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {quick}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-neutral-800/50 border-t border-slate-100 dark:border-neutral-800">
                <p className="text-xs text-slate-400 dark:text-neutral-500 text-center">
                  Powered by WhatsApp Business
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
