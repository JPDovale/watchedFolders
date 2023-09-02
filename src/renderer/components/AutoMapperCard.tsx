import { Map, Trash } from 'lucide-react';

interface FolderCardProps {
  folder: string;
  isEdit?: boolean;
  ext?: string;
  onChange?: (target: string) => void;
  onDelete: () => void;
}

export function AutoMapperCard({
  folder,
  onDelete,
  ext,
  isEdit = false,
  onChange = () => {},
}: FolderCardProps) {
  return (
    <div className="w-full grid grid-cols-[1fr_14fr_1fr] items-center gap-2 bg-gray-400 p-2 rounded-md shadow-sm shadow-black/70">
      <Map size={12} />
      <div className="flex items-center gap-2 overflow-hidden">
        {isEdit ? (
          <input
            className="flex outline-none min-w-[20%] bg-zinc-300 rounded-sm text-xs px-1"
            type="text"
            onChange={(e) => onChange(e.target.value)}
            value={ext}
          />
        ) : (
          <span className="flex  text-xs px-1">{ext}</span>
        )}
        <span className="text-xs font-bold ">{folder}</span>
      </div>

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
