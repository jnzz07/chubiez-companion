/**
 * Maps Shopify product variant IDs to internal plush type slugs.
 * Update this whenever a new plushie SKU is added to Shopify.
 * Find variant IDs in Shopify Admin → Products → [product] → Variants → copy ID from URL.
 */
export const VARIANT_TO_PLUSH_SLUG: Record<string, string> = {
  // 'SHOPIFY_VARIANT_ID': 'plush-slug'
  // Example:
  // '1234567890': 'cloud-bear',
  // '0987654321': 'anxiety-frog',
}

export function variantToPlushSlug(variantId: string): string {
  return VARIANT_TO_PLUSH_SLUG[variantId] ?? 'standard'
}
