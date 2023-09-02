import { useArtefacts } from 'renderer/store/artefacts';

export function ArtefactPage() {
  const {
    artefacts,
    currentArtefact,
    updateDestinationPathOfArtefact,
    removeArtefact,
  } = useArtefacts((state) => ({
    artefacts: state.artefacts,
    currentArtefact: state.currentArtefact,
    updateDestinationPathOfArtefact: state.updateDestinationPathOfArtefact,
    removeArtefact: state.removeArtefact,
  }));

  const artefact = artefacts.find((art) => art.id === currentArtefact);
  const urlPreview = `file://${artefact?.originalPath}`;

  const filename = urlPreview.split('/')[urlPreview.split('/').length - 1];

  async function handleOpenFolderPicker() {
    const destinationFolder = await window.electron.ipcRenderer.invoke(
      'openFolderPicker'
    );

    if (destinationFolder && destinationFolder !== '') {
      const updatedArtefact = {
        artefactId: currentArtefact!,
        destinationPath: destinationFolder,
      };

      updateDestinationPathOfArtefact(updatedArtefact);

      const isCopied = await window.electron.ipcRenderer.invoke(
        'updateArtefact',
        updatedArtefact
      );

      if (isCopied) {
        removeArtefact(currentArtefact!);
      }
    }
  }

  if (!currentArtefact) {
    return (
      <main className="w-full h-full flex items-center justify-center bg-zinc-300">
        <span className="font-extrabold uppercase leading-none pb-4">
          Nenhum artefato por aqui
        </span>
      </main>
    );
  }

  return (
    <main className="w-full h-full bg-zinc-300">
      <div className="flex w-full">
        <div className="w-[8rem] h-[8rem] flex justify-center items-center overflow-hidden">
          <img className="object-fill" src={urlPreview} alt="" />
        </div>
        <div className="p-2 flex flex-col">
          <span className="text-xs font-extrabold uppercase opacity-60">
            Novo objeto detectado
          </span>
          <span className="text-xs">{filename}</span>
        </div>
      </div>

      <div className="p-1.5 ">
        <button
          type="button"
          title="Escolher pasta"
          className="bg-violet-800 w-full py-2 mt-2 text-xs font-bold text-white rounded-lg shadow-lg hover:scale-[102%] hover:shadow-black/75 ease-in-out duration-300"
          onClick={handleOpenFolderPicker}
        >
          Enviar para
        </button>
      </div>
    </main>
  );
}
