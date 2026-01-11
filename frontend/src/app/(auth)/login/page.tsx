'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuthStore } from '@/lib/stores/auth.store';
import { login } from '@/lib/api/auth';
import { fadeInUp, staggerContainer, staggerItem, scaleInBounce } from '@/lib/utils/animations';

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
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="w-full"
    >
      <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <motion.div
            variants={scaleInBounce}
            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <CardTitle className="text-2xl font-bold text-white">
              Catálogo Digital
            </CardTitle>
          </motion.div>
          <motion.div variants={staggerItem}>
            <CardDescription className="text-slate-300">
              Ingresa a tu panel de administración
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                  {...register('password')}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={staggerItem}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Demo Accounts */}
          <motion.div variants={staggerItem} className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-slate-400 mb-3">
              Acceso rápido (Demo)
            </p>
            <div className="flex gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/20 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300"
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

      {/* Footer */}
      <motion.p
        variants={fadeInUp}
        className="text-center mt-6 text-slate-400 text-sm"
      >
        Panel de Administración
      </motion.p>
    </motion.div>
  );
}
