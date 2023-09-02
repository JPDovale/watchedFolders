/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs-extra';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  Menu,
  dialog,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { WatchedFolder } from '../models/WatchedFolder';
import { resolveHtmlPath } from './util';
import { StartupWatchers } from '../controllers/StartupWatchers';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const PRODUCTION_DATABASE_PATH = path.join('../../', '.database');
const DEV_DATABASE_PATH = path.join(__dirname, '../../.database');

if (app.isPackaged && !fs.existsSync(PRODUCTION_DATABASE_PATH)) {
  fs.mkdirSync(PRODUCTION_DATABASE_PATH);
}

if (!app.isPackaged && !fs.existsSync(DEV_DATABASE_PATH)) {
  fs.mkdirSync(DEV_DATABASE_PATH);
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const DATABASE_PATH = app.isPackaged
  ? PRODUCTION_DATABASE_PATH
  : DEV_DATABASE_PATH;

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

let mainWindow: BrowserWindow | null = null;
let tray: Tray;
let watchers: StartupWatchers;

ipcMain.on('openWindow', async () => {
  if (!mainWindow) {
    // eslint-disable-next-line no-use-before-define
    createWindow();
  }

  mainWindow?.show();
});

ipcMain.handle('openFolderPicker', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Selecione uma pasta para ser assistida',
    properties: ['openDirectory'],
  });

  if (!result || result.canceled) {
    return '';
  }

  return result.filePaths[0];
});

ipcMain.handle('addFolder', async (_, args) => {
  watchers.addFolder(new WatchedFolder({ path: args.folder }));
});

ipcMain.handle('foldersAre', async () => {
  const folders = watchers.getFolders();
  const autoMappers = watchers.getAutoMappers();

  if (folders.length === 0) {
    // eslint-disable-next-line no-use-before-define
    if (!mainWindow) await createWindow();

    mainWindow?.show();
  }

  return { folders, autoMappers };
});

ipcMain.handle('artefactsAre', async () => {
  const artefactsFind = watchers.getArtefacts();

  const artefacts = artefactsFind.map((artefact) => ({
    id: artefact.id,
    originalPath: artefact.originalPath,
    destinationPath: artefact.destinationPath,
  }));

  return artefacts;
});

ipcMain.on('newArtefact', async (args) => {
  if (!mainWindow) {
    // eslint-disable-next-line no-use-before-define
    await createWindow();
  }

  mainWindow?.webContents.send('newArtefact', args);
  mainWindow?.show();
});

ipcMain.handle('openWindowForNewArtefact', async (_, args) => {
  const artefact = watchers.getArtefact(args);

  if (!artefact) return null;

  const artefactFile = {
    id: artefact.id,
    originalPath: artefact.originalPath,
    destinationPath: artefact.destinationPath,
  };

  return artefactFile;
});

ipcMain.handle('updateArtefact', async (_, args) => {
  try {
    await watchers.setDestinationFolderOfArtefact(
      args.artefactId,
      args.destinationPath
    );
    watchers.removeArtefact(args.artefactId);

    const artefacts = watchers.getArtefacts();

    if (artefacts.length === 0) {
      mainWindow?.hide();
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
});

ipcMain.handle('deleteFolder', async (_, args) => {
  await watchers.removeFolder(args.folder);
});

ipcMain.handle('addAutoMapper', async (_, args) => {
  await watchers.addAutoMapper(args);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 480,
    resizable: false,
    alwaysOnTop: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  watchers = new StartupWatchers(DATABASE_PATH);
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  mainWindow?.hide();
});

app
  .whenReady()
  .then(() => {
    createWindow();

    app.setLoginItemSettings({
      openAtLogin: true,
    });

    tray = new Tray(getAssetPath('icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Abrir Aplicativo',
        click: async () => {
          if (mainWindow) {
            mainWindow.show();
          } else {
            await createWindow();

            mainWindow!.show();
          }
        },
      },
      {
        label: 'Fechar Aplicativo',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Watched Folders');
    tray.setContextMenu(contextMenu);

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
