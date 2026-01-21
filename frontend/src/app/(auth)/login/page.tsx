'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuthStore } from '@/lib/stores/auth.store';
import { login } from '@/lib/api/auth';
import { v0Ease } from '@/lib/animations';

// Schema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Demo accounts
  const demoAccounts = [
    { label: 'Admin', email: 'admin@catalogo.com', password: 'admin123' },
    { label: 'Editor', email: 'editor@catalogo.com', password: 'editor123' },
  ];

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      storeLogin(response.accessToken, response.user);
      toast.success('Bienvenido de vuelta!', {
        description: `Hola ${response.user.name || response.user.email}`,
      });
      router.push('/admin');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Credenciales incorrectas';
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: v0Ease }}
      className="w-full"
    >
      {/* V0 Style Card */}
      <Card className="border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          {/* V0 Style Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: v0Ease }}
            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center"
          >
            <span className="text-white font-bold text-2xl">C</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: v0Ease }}
          >
            <CardTitle className="text-2xl font-semibold text-neutral-900 dark:text-white">
              Catálogo Digital
            </CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: v0Ease }}
          >
            <CardDescription className="text-neutral-500 dark:text-white/50">
              Ingresa a tu panel de administración
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: v0Ease }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-neutral-600 dark:text-white/70">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus-visible:border-violet-500/50 focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] transition-all duration-300"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 dark:text-red-400"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: v0Ease }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-neutral-600 dark:text-white/70">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus-visible:border-violet-500/50 focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] transition-all duration-300"
                  {...register('password')}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 dark:text-red-400"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: v0Ease }}
            >
              <Button
                type="submit"
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-white/90 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] font-medium py-6 rounded-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Demo Accounts - V0 Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: v0Ease }}
            className="mt-6 pt-6 border-t border-black/[0.08] dark:border-white/[0.08]"
          >
            <p className="text-center text-sm text-neutral-400 dark:text-white/40 mb-3">
              Acceso rápido (Demo)
            </p>
            <div className="flex gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  className="flex-1 bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all duration-300"
                  onClick={() => fillDemoAccount(account.email, account.password)}
                  disabled={isLoading}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Footer - V0 Style */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8, ease: v0Ease }}
        className="text-center mt-6 text-neutral-400 dark:text-white/40 text-sm"
      >
        Panel de Administración
      </motion.p>
    </motion.div>
  );
}
