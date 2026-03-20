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
  Gift,
  BarChart3,
  QrCode,
  FileUp,
  LogOut,
  Menu,
  ChevronRight,
  ChevronUp,
  PanelLeftClose,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import { v0Ease } from '@/lib/animations';
import { getSettings } from '@/lib/api/settings';

// Contexto para el estado del sidebar y settings
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  variantsEnabled: boolean;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  variantsEnabled: true,
});

// Navegación del sidebar
const allNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, section: 'main' },
  { name: 'Productos', href: '/admin/productos', icon: Package, section: 'main' },
  { name: 'Categorías', href: '/admin/categorias', icon: FolderOpen, section: 'main' },
  { name: 'Marcas', href: '/admin/marcas', icon: Tag, section: 'main' },
  { name: 'Combos', href: '/admin/combos', icon: Gift, section: 'main' },
  { name: 'Atributos', href: '/admin/tipos-variante', icon: Layers, section: 'main', requiresVariants: true },
  { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart3, section: 'tools' },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings, section: 'tools' },
  { name: 'Importar/Exportar', href: '/admin/importar', icon: FileUp, section: 'tools' },
  { name: 'Código QR', href: '/admin/qr', icon: QrCode, section: 'tools' },
];

// V0 Style Animation Variants
const sidebarVariants = {
  expanded: { width: 260, transition: { duration: 0.5, ease: v0Ease } },
  collapsed: { width: 80, transition: { duration: 0.5, ease: v0Ease } },
};

const contentVariants = {
  expanded: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.3, ease: v0Ease } },
  collapsed: { opacity: 0, x: -10, transition: { duration: 0.15, ease: v0Ease } },
};

const iconVariants = {
  expanded: { scale: 1 },
  collapsed: { scale: 1.1 },
};

function getInitials(name: string | null | undefined, email: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
}

// User section with dropdown (used in both mobile and desktop sidebars)
function UserSection({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className={`border-t border-neutral-200 dark:border-white/[0.08] ${isCollapsed ? 'p-2' : 'p-3'}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium
              transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-white/[0.04]
              ${isCollapsed ? 'justify-center p-3' : 'px-3 py-3'}
            `}
          >
            <Avatar className="w-9 h-9 border-2 border-cyan-500/30 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold text-xs">
                {user ? getInitials(user.name, user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-white/50 truncate">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Editor'}
                  </p>
                </div>
                <ChevronUp className="w-4 h-4 text-neutral-400 dark:text-white/30 flex-shrink-0" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isCollapsed ? 'right' : 'top'}
          align="start"
          className="w-56 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/[0.08]"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-neutral-900 dark:text-white">{user?.name || 'Usuario'}</span>
              <span className="text-xs text-neutral-500 dark:text-white/50 font-normal">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-neutral-200 dark:bg-white/[0.08]" />
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer text-neutral-700 dark:text-white/70">
            {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/configuracion" className="cursor-pointer text-neutral-700 dark:text-white/70">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-neutral-200 dark:bg-white/[0.08]" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 dark:text-red-400 cursor-pointer focus:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Navigation items renderer
function NavItems({
  items,
  pathname,
  isCollapsed = false,
  layoutIdPrefix,
  onItemClick,
}: {
  items: typeof allNavigation;
  pathname: string;
  isCollapsed?: boolean;
  layoutIdPrefix: string;
  onItemClick?: () => void;
}) {
  const mainItems = items.filter(i => i.section === 'main');
  const toolItems = items.filter(i => i.section === 'tools');

  const renderItem = (item: typeof allNavigation[0], index: number) => {
    const isActive = pathname === item.href ||
      (item.href !== '/admin' && pathname.startsWith(item.href));

    const NavLink = (
      <Link
        href={item.href}
        onClick={onItemClick}
        className={`
          group flex items-center gap-3 rounded-xl text-sm font-medium
          transition-all duration-300 relative overflow-hidden
          ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}
          ${isActive
            ? 'text-white'
            : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04]'
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId={`${layoutIdPrefix}ActiveNav`}
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl"
            transition={{ duration: 0.4, ease: v0Ease }}
          />
        )}
        <motion.div
          variants={iconVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
        >
          <item.icon className={`w-5 h-5 relative z-10 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-white' : ''}`} />
        </motion.div>
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
        {isActive && !isCollapsed && (
          <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-white/70" />
        )}
      </Link>
    );

    return (
      <motion.div
        key={item.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4, ease: v0Ease }}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/[0.08] text-neutral-900 dark:text-white">
              {item.name}
            </TooltipContent>
          </Tooltip>
        ) : NavLink}
      </motion.div>
    );
  };

  return (
    <>
      {!isCollapsed && (
        <p className="px-4 text-[10px] font-semibold text-neutral-400 dark:text-white/30 tracking-widest uppercase mb-2">
          Menú Principal
        </p>
      )}
      {mainItems.map((item, i) => renderItem(item, i))}

      {!isCollapsed && (
        <p className="px-4 pt-4 text-[10px] font-semibold text-neutral-400 dark:text-white/30 tracking-widest uppercase mb-2">
          Herramientas
        </p>
      )}
      {isCollapsed && <Separator className="mx-2 my-2 bg-neutral-200 dark:bg-white/[0.08]" />}
      {toolItems.map((item, i) => renderItem(item, mainItems.length + i))}
    </>
  );
}

// Sidebar para móvil
function MobileSidebarContent({ pathname, navigation, onItemClick }: { pathname: string; navigation: typeof allNavigation; onItemClick?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItems items={navigation} pathname={pathname} layoutIdPrefix="mobile" onItemClick={onItemClick} />
      </nav>

      <UserSection />
    </div>
  );
}

// Sidebar de escritorio
function DesktopSidebar({ pathname, navigation }: { pathname: string; navigation: typeof allNavigation }) {
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
        <div className={`p-4 ${isCollapsed ? 'px-4' : 'px-5'}`}>
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
                <motion.div variants={contentVariants} initial="collapsed" animate="expanded" exit="collapsed">
                  <h1 className="font-bold text-lg text-neutral-900 dark:text-white whitespace-nowrap">Catálogo</h1>
                  <p className="text-xs text-neutral-500 dark:text-white/50 whitespace-nowrap">Panel Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <Separator className={`${isCollapsed ? 'mx-2' : 'mx-4'} bg-neutral-200 dark:bg-white/[0.08]`} />

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <NavItems items={navigation} pathname={pathname} isCollapsed={isCollapsed} layoutIdPrefix="desktop" />
        </nav>

        {/* Collapse toggle */}
        <div className={`px-3 pb-1 ${isCollapsed ? 'px-2' : ''}`}>
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium
              transition-all duration-300 py-2.5
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
                <motion.span variants={contentVariants} initial="collapsed" animate="expanded" exit="collapsed" className="whitespace-nowrap">
                  Colapsar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* User section at bottom */}
        <UserSection isCollapsed={isCollapsed} />
      </motion.aside>
    </TooltipProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [variantsEnabled, setVariantsEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detectar si es desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Cargar settings para saber si variantes está habilitado
  useEffect(() => {
    if (isAuthenticated) {
      getSettings().then(s => {
        setVariantsEnabled(s.variantsEnabled);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Protección de rutas - check both store AND cookie to avoid race condition after login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Double-check: maybe store isn't hydrated yet but cookie exists
      const hasToken = document.cookie.includes('accessToken=');
      if (!hasToken) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Filtrar navegación según settings
  const navigation = allNavigation.filter(item =>
    !item.requiresVariants || variantsEnabled
  );

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

  if (!isAuthenticated) return null;

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, variantsEnabled }}>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0a0a0a]">
        {/* Desktop Sidebar */}
        <DesktopSidebar pathname={pathname} navigation={navigation} />

        {/* Main content - sin navbar, ocupa todo */}
        <div
          className="min-h-screen transition-[margin-left] duration-300 ease-out"
          style={{ marginLeft: isDesktop ? (isCollapsed ? 80 : 260) : 0 }}
        >
          {/* Mobile: top bar with title + hamburger for extra items */}
          <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-neutral-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="font-semibold text-neutral-900 dark:text-white text-sm">
                {navigation.find(n => n.href === pathname)?.name || 'Panel'}
              </h1>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/[0.08]">
                <MobileSidebarContent
                  pathname={pathname}
                  navigation={navigation}
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Content area */}
          <main className="p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>

          {/* Mobile: Bottom Navigation Bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-neutral-200/60 dark:border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-14">
              {[
                { name: 'Inicio', href: '/admin', icon: LayoutDashboard },
                { name: 'Marcas', href: '/admin/marcas', icon: Tag },
                { name: 'Productos', href: '/admin/productos', icon: Package, center: true },
                { name: 'Categorías', href: '/admin/categorias', icon: FolderOpen },
                { name: 'Combos', href: '/admin/combos', icon: Gift },
              ].map((item) => {
                const isActive = pathname === item.href;
                const isCenter = 'center' in item && item.center;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full active:scale-90 transition-transform duration-100 ${
                      isCenter
                        ? 'text-white'
                        : isActive
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-neutral-400 dark:text-neutral-500 active:text-cyan-500'
                    }`}
                  >
                    {isCenter ? (
                      <div className={`flex flex-col items-center justify-center gap-0.5 -mt-5 w-14 h-14 rounded-2xl shadow-lg ${
                        isActive
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/30'
                          : 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/20'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="text-[8px] font-semibold">{item.name}</span>
                      </div>
                    ) : (
                      <>
                        <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                        <span className="text-[9px] font-medium truncate">{item.name}</span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
