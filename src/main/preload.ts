// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'openWindow'
  | 'openFolderPicker'
  | 'addFolder'
  | 'foldersAre'
  | 'artefactsAre'
  | 'newArtefact'
  | 'openWindowForNewArtefact'
  | 'updateArtefact'
  | 'deleteFolder'
  | 'addAutoMapper';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: any[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: any[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },

    invoke(channel: Channels, ...args: any[]): Promise<any> {
      return ipcRenderer.invoke(channel, ...args);
    },

    removeListener: (channel: Channels, listener: (...args: any[]) => void) => {
      return ipcRenderer.removeListener(channel, listener);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
