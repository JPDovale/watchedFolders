import { useState } from 'react';
import { AutoMapperCard } from 'renderer/components/AutoMapperCard';
import { useArtefacts } from 'renderer/store/artefacts';

export function AutoMappersPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [ext, setExt] = useState('');
  const [folder, setFolder] = useState('');
  const { autoMappers, addAutoMapper } = useArtefacts((state) => ({
    autoMappers: state.autoMappers,
    addAutoMapper: state.addAutoMapper,
  }));

  const hasMapper = !!autoMappers[0];

  async function handleOpenFolderPicker() {
    const folderReceived = await window.electron.ipcRenderer.invoke(
      'openFolderPicker'
    );

    if (folderReceived) {
      setIsAdding(true);
      setFolder(folderReceived);
    }
  }

  function cancelAdd() {
    setFolder('');
    setExt('');
    setIsAdding(false);
  }

  async function handleSaveNewAutoMapper() {
    const newAutoMapper = {
      ext,
      destinationPath: folder,
    };

    addAutoMapper(newAutoMapper);
    await window.electron.ipcRenderer.invoke('addAutoMapper', newAutoMapper);

    setExt('');
    setFolder('');
    setIsAdding(false);
  }

  return (
    <main className="w-full h-full flex flex-col bg-zinc-300 p-2">
      <div className="w-full h-full flex gap-2 flex-col">
        {isAdding && (
          <AutoMapperCard
            folder={folder}
            onDelete={() => cancelAdd()}
            onChange={setExt}
            isEdit
            ext={ext}
          />
        )}

        {hasMapper ? (
          <div className="flex flex-col gap-2">
            {autoMappers.map((autoMapper) => (
              <AutoMapperCard
                key={autoMapper.ext}
                folder={autoMapper.destinationPath}
                onDelete={() => {}}
                ext={autoMapper.ext}
              />
            ))}
          </div>
        ) : (
          <span className="my-auto text-center text-xs leading-none font-extrabold">
            Você ainda não definiu nenhum mapeamento automático
          </span>
        )}
      </div>
      <button
        type="button"
        title="Escolher pasta"
        className="bg-violet-800 w-full py-2 mt-2 text-xs font-bold text-white rounded-lg shadow-lg hover:scale-[102%] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-black/75 ease-in-out duration-300"
        onClick={isAdding ? handleSaveNewAutoMapper : handleOpenFolderPicker}
        disabled={isAdding && !ext}
      >
        {!isAdding
          ? 'Clique aqui para adicionar um mapeamento automático'
          : 'Salvar'}
      </button>
    </main>
  );
}
