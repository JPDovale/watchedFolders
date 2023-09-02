import { create } from 'zustand';

interface Artefact {
  id: string;
  originalPath: string;
  destinationPath: string | null;
}

interface AutoMapper {
  ext: string;
  destinationPath: string;
}

interface UseArtefacts {
  artefacts: Artefact[];
  autoMappers: AutoMapper[];
  folders: string[];
  currentArtefact: string | null;
  loading: boolean;
  getArtefact: (id: string) => Promise<void>;
  setup: () => Promise<void>;
  addFolder: (folder: string) => void;
  addAutoMapper: (autoMapper: AutoMapper) => void;
  updateDestinationPathOfArtefact: ({
    ...args
  }: {
    artefactId: string;
    destinationPath: string;
  }) => void;
  removeFolder: (folder: string) => Promise<void>;
  removeArtefact: (artefactId: string) => void;
}

const useArtefacts = create<UseArtefacts>((set, get) => {
  return {
    artefacts: [],
    folders: [],
    autoMappers: [],
    currentArtefact: null,
    loading: true,

    getArtefact: async (id) => {
      const artefact = await window.electron.ipcRenderer.invoke(
        'openWindowForNewArtefact',
        id
      );

      if (artefact) {
        const state = get();

        set({
          artefacts: [...state.artefacts, artefact],
          currentArtefact: state.currentArtefact
            ? state.currentArtefact
            : artefact.id,
        });
      }
    },

    setup: async () => {
      const { folders, autoMappers } = await window.electron.ipcRenderer.invoke(
        'foldersAre'
      );

      const artefactsReceived = await window.electron.ipcRenderer.invoke(
        'artefactsAre'
      );

      set({
        loading: false,
        folders,
        autoMappers,
        artefacts: artefactsReceived,
        currentArtefact: artefactsReceived[0] ? artefactsReceived[0].id : null,
      });
    },

    addFolder: (folder) => {
      const { folders } = get();

      set({
        folders: [...folders, folder],
      });
    },

    addAutoMapper: (autoMapper) => {
      const { autoMappers } = get();

      set({
        autoMappers: [...autoMappers, autoMapper],
      });
    },

    updateDestinationPathOfArtefact: ({ artefactId, destinationPath }) => {
      const { artefacts } = get();
      const artefactIndex = artefacts.findIndex((art) => art.id === artefactId);

      if (artefacts[artefactIndex]) {
        artefacts[artefactIndex].destinationPath = destinationPath;
      }

      set({
        artefacts,
      });
    },

    removeArtefact: (artefactId) => {
      const { artefacts } = get();
      const updatedArtefacts = artefacts.filter((art) => art.id !== artefactId);
      const newCurrentArtefact =
        updatedArtefacts.length === 0 ? null : updatedArtefacts[0].id;

      set({
        artefacts: updatedArtefacts,
        currentArtefact: newCurrentArtefact,
      });
    },

    removeFolder: async (folder) => {
      await window.electron.ipcRenderer.invoke('deleteFolder', { folder });
      const { folders } = get();

      set({
        folders: folders.filter((f) => f !== folder),
      });
    },
  };
});

export { useArtefacts };
