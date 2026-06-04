import { usePricing } from '../../contexts/PricingContext';

/**
 * Renders the live, geo-resolved price — but shows a subtle skeleton placeholder
 * until the canonical price (from /api/pricing) has resolved. This guarantees the
 * user never sees a stale/guessed fallback number flash before the real one.
 *
 * Props:
 *  - original: render the struck-through original price instead of the live price
 *  - className: passthrough classes for the rendered price text
 *  - skeletonWidth: CSS width of the loading placeholder (em-based, scales with font)
 */
export default function PriceText({ original = false, className = '', skeletonWidth }) {
  const { pricing, priceReady } = usePricing();

  if (!priceReady) {
    return (
      <span
        className="inline-block align-middle rounded-md bg-white/15 animate-pulse"
        style={{ width: skeletonWidth || (original ? '4em' : '3.4em'), height: '0.8em' }}
        aria-hidden="true"
      />
    );
  }

  const text = original ? pricing.displayOriginalPrice : pricing.displayPrice;
  return <span className={className}>{text}</span>;
}
