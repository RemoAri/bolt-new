import { FolderList } from '@/components/folder-list';
import { Toaster } from '@/components/ui/toaster';

export default function FoldersPage() {
  return (
    <main className="container mx-auto py-8">
      <FolderList />
      <Toaster />
    </main>
  );
} 