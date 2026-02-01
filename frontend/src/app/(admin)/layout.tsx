'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  FolderOpen,
  Tag,
  Layers,
  Package,
  BarChart3,
  QrCode,
  FileUp,
  LogOut,
  Menu,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/components/providers/auth-provider';
import { v0Ease, v0Transition } from '@/lib/animations';

// Contexto para el estado del sidebar
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

// Navegación del sidebar
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  { name: 'Categorías', href: '/admin/categorias', icon: FolderOpen },
  { name: 'Marcas', href: '/admin/marcas', icon: Tag },
  { name: 'Tipos de Variante', href: '/admin/tipos-variante', icon: Layers },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart3 },
  { name: 'Código QR', href: '/admin/qr', icon: QrCode },
  { name: 'Importar/Exportar', href: '/admin/importar', icon: FileUp },
];

// V0 Style Animation Variants
const sidebarVariants = {
  expanded: {
    width: 256,
    transition: {
      duration: 0.5,
      ease: v0Ease,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      duration: 0.5,
      ease: v0Ease,
    },
  },
};

const contentVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.15,
      duration: 0.3,
      ease: v0Ease,
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
      ease: v0Ease,
    },
  },
};

const iconVariants = {
  expanded: { scale: 1 },
  collapsed: { scale: 1.1 },
};

const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

// Sidebar para móvil (siempre expandido)
function MobileSidebarContent({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg text-neutral-900 dark:text-white">Catálogo</h1>
            <p className="text-xs text-neutral-500 dark:text-white/50">Panel Admin</p>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 bg-neutral-200 dark:bg-white/[0.08]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: v0Ease }}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 relative overflow-hidden
                  ${isActive
                    ? 'text-cyan-700 dark:text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute inset-0 bg-cyan-50 dark:bg-white/[0.08] rounded-xl border-l-2 border-cyan-500"
                    transition={{ duration: 0.4, ease: v0Ease }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : ''}`} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-cyan-500 dark:text-cyan-400" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">
          <p className="text-xs text-neutral-500 dark:text-white/40 text-center">
            Catálogo Digital v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

// Sidebar de escritorio con estado colapsable
function DesktopSidebar({ pathname }: { pathname: string }) {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-white/[0.08] hidden lg:flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className={`p-4 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          <Link href="/admin" className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">C</span>
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <h1 className="font-semibold text-lg text-neutral-900 dark:text-white whitespace-nowrap">Catálogo</h1>
                  <p className="text-xs text-neutral-500 dark:text-white/50 whitespace-nowrap">Panel Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <Separator className={`${isCollapsed ? 'mx-2' : 'mx-4'} bg-neutral-200 dark:bg-white/[0.08]`} />

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            const NavLink = (
              <Link
                href={item.href}
                className={`
                  group flex items-center gap-3 rounded-xl text-sm font-medium
                  transition-all duration-300 relative overflow-hidden
                  ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                  ${isActive
                    ? 'text-cyan-700 dark:text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveNav"
                    className={`absolute inset-0 bg-cyan-50 dark:bg-white/[0.08] rounded-xl ${!isCollapsed ? 'border-l-2 border-cyan-500' : ''}`}
                    transition={{ duration: 0.4, ease: v0Ease }}
                  />
                )}
                {/* Subtle glow for active state */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <motion.div
                  variants={iconVariants}
                  animate={isCollapsed ? 'collapsed' : 'expanded'}
                >
                  <item.icon className={`w-5 h-5 relative z-10 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : ''}`} />
                </motion.div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-cyan-500 dark:text-cyan-400" />
                )}
              </Link>
            );

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: v0Ease }}
              >
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {NavLink}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/[0.08] text-neutral-900 dark:text-white">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  NavLink
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className={`p-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium
              transition-all duration-300 py-3
              text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04]
              ${isCollapsed ? 'justify-center px-3' : 'px-4'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.4, ease: v0Ease }}
            >
              <PanelLeftClose className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="whitespace-nowrap"
                >
                  Colapsar menú
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Footer */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="p-4"
            >
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">
                <p className="text-xs text-neutral-500 dark:text-white/40 text-center">
                  Catálogo Digital v1.0
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}

function Header() {
  const { user, isLoading } = useAuthStore();
  const handleLogout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const { isDark, toggleTheme } = useTheme();

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.08]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/[0.08]">
            <MobileSidebarContent
              pathname={pathname}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop toggle button - visible when sidebar collapsed */}
        <div className="hidden lg:flex items-center">
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: v0Ease }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(false)}
                  className="mr-2 text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle & User menu - V0 Style */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-32 h-4 bg-neutral-200 dark:bg-white/10" />
              <Skeleton className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-white/10" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-white/50">
                      {user?.role === 'ADMIN' ? 'Administrador' : 'Editor'}
                    </p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-cyan-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                      {user ? getInitials(user.name, user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0a0a0a] border-black/[0.08] dark:border-white/[0.08]">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-neutral-900 dark:text-white">{user?.name || 'Usuario'}</span>
                    <span className="text-xs text-neutral-500 dark:text-white/50 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/[0.08] dark:bg-white/[0.08]" />
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracion" className="cursor-pointer text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white focus:bg-black/[0.04] dark:focus:bg-white/[0.04]">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracion" className="cursor-pointer text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white focus:bg-black/[0.04] dark:focus:bg-white/[0.04]">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/[0.08] dark:bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 dark:text-red-400 cursor-pointer focus:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar si es desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Protección de rutas
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica autenticación - V0 Style
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: v0Ease }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <motion.span
              className="text-white font-bold text-2xl"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              C
            </motion.span>
          </div>
          <p className="text-neutral-500 dark:text-white/50">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (se redirige)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
        {/* Desktop Sidebar - Collapsible */}
        <DesktopSidebar pathname={pathname} />

        {/* Main content - responsive margin to sidebar state */}
        <motion.div
          className="min-h-screen"
          initial={false}
          animate={{
            marginLeft: isDesktop ? (isCollapsed ? 80 : 256) : 0,
          }}
          transition={{
            duration: 0.5,
            ease: v0Ease,
          }}
        >
          <Header />

          <main className="p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: v0Ease }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </SidebarContext.Provider>
  );
}
