import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Atomically claims the next available code from the pool.
 * Returns null when the pool is empty — callers must handle that.
 */
export async function claimPoolCode(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.rpc('claim_pool_code')
  if (error) {
    console.error('[code-pool] claim failed:', error.message)
    return null
  }
  return (data as string | null) ?? null
}

/**
 * Parses a pasted sheet of codes: one per line, or comma/semicolon/tab separated.
 * Trims, uppercases, dedupes.
 */
export function parseCodeSheet(raw: string): string[] {
  const codes = raw
    .split(/[\n,;\t]+/)
    .map(c => c.trim().toUpperCase())
    .filter(c => c.length >= 4 && c.length <= 32)
  return [...new Set(codes)]
}

export async function getPoolStats(supabase: SupabaseClient) {
  const [availableRes, totalRes] = await Promise.all([
    supabase.from('code_pool').select('id', { count: 'exact', head: true }).eq('assigned', false),
    supabase.from('code_pool').select('id', { count: 'exact', head: true }),
  ])
  return {
    available: availableRes.count ?? 0,
    total: totalRes.count ?? 0,
  }
}
