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
  ChevronLeft,
  Sparkles,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

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
import { fadeIn, staggerContainer, staggerItem } from '@/lib/utils/animations';

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

// Variantes de animación para el sidebar
const sidebarVariants = {
  expanded: {
    width: 256,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const contentVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1,
      duration: 0.2,
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
    },
  },
};

const iconVariants = {
  expanded: { scale: 1 },
  collapsed: { scale: 1.1 },
};

// Sidebar para móvil (siempre expandido)
function MobileSidebarContent({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full"
    >
      {/* Logo */}
      <motion.div variants={staggerItem} className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Catálogo</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Panel Admin</p>
          </div>
        </Link>
      </motion.div>

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.name}
              variants={staggerItem}
              custom={index}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 relative overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : ''}`} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <motion.div variants={staggerItem} className="p-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Catálogo Digital v1.0
          </p>
        </div>
      </motion.div>
    </motion.div>
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
        className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className={`p-4 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          <Link href="/admin" className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <h1 className="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">Catálogo</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Panel Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <Separator className={isCollapsed ? 'mx-2' : 'mx-4'} />

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
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveNav"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  variants={iconVariants}
                  animate={isCollapsed ? 'collapsed' : 'expanded'}
                >
                  <item.icon className={`w-5 h-5 relative z-10 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
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
                  <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                )}
              </Link>
            );

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {NavLink}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
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
              text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
              ${isCollapsed ? 'justify-center px-3' : 'px-4'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
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

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
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
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(false)}
                  className="mr-2"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-4 ml-auto">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role === 'ADMIN' ? 'Administrador' : 'Editor'}
                    </p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-indigo-200 dark:border-indigo-800">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {user ? getInitials(user.name, user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || 'Usuario'}</span>
                    <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracion" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracion" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
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

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <Header />

          <main className="p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
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
