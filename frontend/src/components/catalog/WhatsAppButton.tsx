'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-16 h-16 rounded-full',
            'bg-gradient-to-br from-green-500 to-green-600',
            'shadow-lg shadow-green-500/30',
            'flex items-center justify-center',
            'group'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500"
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
                <X className="w-7 h-7 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
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
            className="fixed bottom-28 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
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
                  <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 inline-block max-w-[85%]">
                    <p className="text-slate-700 text-sm">
                      ¡Hola! 👋 Bienvenido a {businessName}. ¿En qué podemos ayudarte?
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Ahora</p>
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
                      'bg-slate-100 rounded-xl',
                      'border-0 outline-none resize-none',
                      'text-slate-700 placeholder:text-slate-400',
                      'text-sm'
                    )}
                  />
                  <motion.button
                    onClick={handleSend}
                    className={cn(
                      'absolute right-2 bottom-2',
                      'w-9 h-9 rounded-full',
                      'bg-green-500 text-white',
                      'flex items-center justify-center',
                      'shadow-lg shadow-green-500/30'
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
                        'bg-slate-100 hover:bg-green-100',
                        'text-slate-600 hover:text-green-700',
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
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
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
