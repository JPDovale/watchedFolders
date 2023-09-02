import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderCard } from '../components/FolderCard';
import { useArtefacts } from '../store/artefacts';

export function HomePage() {
  const { artefacts, folders, addFolder, removeFolder } = useArtefacts(
    (state) => ({
      artefacts: state.artefacts,
      folders: state.folders,
      addFolder: state.addFolder,
      removeFolder: state.removeFolder,
    })
  );

  const navigate = useNavigate();

  const hasFolder = !!folders[0];

  async function handleOpenFolderPicker() {
    const folder = await window.electron.ipcRenderer.invoke('openFolderPicker');

    if (folder) {
      addFolder(folder);
    }

    window.electron.ipcRenderer.invoke('addFolder', { folder });
  }

  async function handleRemoveFolder(folder: string) {
    await removeFolder(folder);
  }

  useEffect(() => {
    if (artefacts.length !== 0) {
      navigate(`/artefact`);
    }
  }, [artefacts, navigate]);

  return (
    <main
      data-has-folder={hasFolder}
      className="flex flex-col items-center justify-center gap-4 bg-zinc-300  w-full h-full p-2 data-[has-folder=true]:justify-start"
    >
      {!hasFolder && [
        <header key="header" className="flex justify-center">
          <h3 className="text-sm font-bold text-center leading-tight max-w-[75%]">
            Você não definiu nenhuma pasta para ser observada ainda
          </h3>
        </header>,

        <div key="divider" className="bg-zinc-400 w-full h-[1px]" />,
      ]}

      {hasFolder && [
        <div className="h-full w-full flex flex-col gap-2.5">
          {folders.map((folder) => (
            <FolderCard
              key={folder}
              folder={folder}
              onDelete={() => handleRemoveFolder(folder)}
            />
          ))}
        </div>,
      ]}

      <button
        data-has-folder={hasFolder}
        type="button"
        title="Escolher pasta"
        className="bg-violet-800 w-full py-2 mt-8 data-[has-folder=true]:mt-2 text-xs font-bold text-white rounded-lg shadow-lg hover:scale-[102%] hover:shadow-black/75 ease-in-out duration-300"
        onClick={handleOpenFolderPicker}
      >
        Clique aqui para escolher uma pasta
      </button>
    </main>
  );
}
