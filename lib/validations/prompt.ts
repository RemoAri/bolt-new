import { z } from 'zod';

export const promptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(5, 'Maximum 5 tags allowed'),
  category: z.string().min(1, 'Category is required'),
  visibility: z.enum(['public', 'private']).default('public'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type PromptFormData = z.infer<typeof promptSchema>;

export const promptSearchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['created', 'updated', 'popular']).default('created'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PromptSearchParams = z.infer<typeof promptSearchSchema>; 