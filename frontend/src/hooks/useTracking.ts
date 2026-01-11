/**
 * Hook para tracking de eventos en el catálogo.
 * Re-exporta el hook del TrackingProvider para acceso directo.
 *
 * @example
 * ```tsx
 * import { useTracking } from '@/hooks/useTracking';
 *
 * function ProductPage({ product }) {
 *   const { trackViewItem, trackAddToCart } = useTracking();
 *
 *   useEffect(() => {
 *     trackViewItem(product);
 *   }, [product, trackViewItem]);
 *
 *   const handleAddToCart = () => {
 *     trackAddToCart(product, 1);
 *     // ... rest of add to cart logic
 *   };
 * }
 * ```
 */
export { useTracking } from '@/components/tracking';
export type {
  TrackingEvent,
  ViewItemParams,
  AddToCartParams,
  PurchaseParams,
} from '@/components/tracking';
