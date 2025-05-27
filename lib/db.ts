import { createClient } from '@supabase/supabase-js';
import { LRUCache } from 'lru-cache';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize query cache
const queryCache = new LRUCache<string, any>({
  max: 500, // Maximum number of items to store
  ttl: 1000 * 60 * 5, // Cache for 5 minutes
});

// Helper function to execute queries with caching
export async function executeQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: { useCache?: boolean; ttl?: number } = {}
): Promise<T> {
  const { useCache = true, ttl } = options;

  if (useCache) {
    const cached = queryCache.get(key);
    if (cached) {
      return cached as T;
    }
  }

  const result = await queryFn();

  if (useCache) {
    queryCache.set(key, result, { ttl });
  }

  return result;
}

// Helper function to invalidate cache
export function invalidateCache(pattern: string) {
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
}

// Example of a typed query function
export async function getPrompts(params: {
  limit?: number;
  offset?: number;
  category?: string;
  tags?: string[];
}) {
  const { limit = 10, offset = 0, category, tags } = params;

  let query = supabase
    .from('prompts')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  return executeQuery(
    `prompts:${JSON.stringify(params)}`,
    async () => {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    { ttl: 1000 * 60 } // Cache for 1 minute
  );
} 