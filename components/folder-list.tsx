import { useState, useEffect } from 'react';
import { FolderPlus, FolderIcon, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderDialog } from '@/components/folder-dialog';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from '@hello-pangea/dnd';

interface Folder {
  id: string;
  name: string;
  created_at: string;
  order?: number;
}

export function FolderList() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load folders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreateFolder = () => {
    setSelectedFolder(undefined);
    setIsDialogOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchFolders();
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(folders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order of all folders
    const updatedFolders = items.map((folder, index) => ({
      ...folder,
      order: index,
    }));

    setFolders(updatedFolders);

    try {
      // Update the order in the database
      const { error } = await supabase
        .from('folders')
        .upsert(
          updatedFolders.map((folder) => ({
            id: folder.id,
            order: folder.order,
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating folder order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update folder order. Please try again.',
        variant: 'destructive',
      });
      // Revert the order if the update fails
      fetchFolders();
    }
  };

  if (isLoading) {
    return <div>Loading folders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCreateFolder}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="folders">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-2"
            >
              {folders.map((folder, index) => (
                <Draggable
                  key={folder.id}
                  draggableId={folder.id}
                  index={index}
                >
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between rounded-lg border p-4 bg-background hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="h-4 w-4" />
                        <span>{folder.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditFolder(folder)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {folders.length === 0 && (
                <div className="text-center text-muted-foreground">
                  No folders yet. Create one to get started.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <FolderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        folder={selectedFolder}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
} 