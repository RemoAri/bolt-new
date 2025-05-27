import Link from 'next/link';
import { FolderIcon } from 'lucide-react';

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">PromptLib</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/folders"
            className="flex items-center space-x-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <FolderIcon className="h-4 w-4" />
            <span>Folders</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 