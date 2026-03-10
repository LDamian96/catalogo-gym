import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-cyan-500 mb-4">404</p>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Página no encontrada
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
