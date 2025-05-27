import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import { Folder } from '@/types/prompt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
}

export async function getFolders(): Promise<Folder[]> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting folders:', error);
    return [];
  }
}

export async function getUniqueTags(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('tags');

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    const allTags = data
      .flatMap(prompt => prompt.tags || [])
      .filter(Boolean);

    return [...new Set(allTags)];
  } catch (error) {
    console.error('Error getting unique tags:', error);
    return [];
  }
}

export function parseTags(tagsData: unknown): string[] {
  try {
    if (!tagsData) return [];
    
    if (Array.isArray(tagsData)) {
      return tagsData.filter((tag): tag is string => typeof tag === 'string');
    }
    
    if (typeof tagsData === 'string') {
      try {
        const parsed = JSON.parse(tagsData);
        if (Array.isArray(parsed)) {
          return parsed.filter((tag): tag is string => typeof tag === 'string');
        }
      } catch (e) {
        console.error('Failed to parse tags JSON:', e);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing tags:', error);
    return [];
  }
}

export function getTagColor(tag: string): string {
  const colors = [
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  ];

  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}