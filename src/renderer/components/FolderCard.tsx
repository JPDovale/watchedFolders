import { Folder, Trash } from 'lucide-react';

interface FolderCardProps {
  folder: string;
  onDelete: () => void;
}

export function FolderCard({ folder, onDelete }: FolderCardProps) {
  return (
    <div className="w-full grid grid-cols-[1fr_14fr_1fr] items-center gap-2 bg-gray-400 p-2 rounded-md shadow-sm shadow-black/70">
      <Folder size={12} />
      <span className="text-xs font-bold overflow-hidden">{folder}</span>

      <button
        type="button"
        title="Remover pasta da lista"
        className="p-1 rounded-sm"
        onClick={onDelete}
      >
        <Trash size={12} />
      </button>
    </div>
  );
}
