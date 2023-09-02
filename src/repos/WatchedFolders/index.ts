import fs from 'fs';
import { WatchedFolder } from '../../models/WatchedFolder';

interface AutoMapper {
  ext: string;
  destinationPath: string;
}

interface WatchedFoldersFile {
  folders: string[];
  autoMappers: AutoMapper[];
}

export class WatchedFoldersRepository {
  private _databaseWFPath: string;

  private _databaseWFFilePath: string;

  private _watchedFolders: WatchedFolder[] = [];

  private _autoMappers: AutoMapper[] = [];

  constructor(databasePath: string) {
    const databaseWFPath = databasePath.concat('/watched-folders');

    const databaseWFFilePath = databasePath.concat(
      '/watched-folders/watchedFolders.wf'
    );

    this._databaseWFPath = databaseWFPath;
    this._databaseWFFilePath = databaseWFFilePath;

    if (!fs.existsSync(databaseWFPath)) {
      fs.mkdirSync(databaseWFPath);
    }

    if (!fs.existsSync(databaseWFFilePath)) {
      const newFileWF: WatchedFoldersFile = {
        folders: [],
        autoMappers: [],
      };

      fs.writeFileSync(databaseWFFilePath, JSON.stringify(newFileWF));
    }
  }

  public load(): {
    watchedFolders: WatchedFolder[];
    autoMappers: AutoMapper[];
  } {
    const watchedFoldersFileRead = fs.readFileSync(
      this.databaseWFFilePath,
      'utf-8'
    );
    const watchedFoldersFile: WatchedFoldersFile = JSON.parse(
      watchedFoldersFileRead
    );
    const watchedFolders: WatchedFolder[] = [];
    const autoMappers: AutoMapper[] = [];

    watchedFoldersFile.folders.forEach((folder) => {
      const watchedFolder = new WatchedFolder({ path: folder });
      watchedFolders.push(watchedFolder);
    });

    watchedFoldersFile.autoMappers.forEach((AM) => autoMappers.push(AM));

    this._watchedFolders = watchedFolders;
    this._autoMappers = autoMappers;
    return { watchedFolders, autoMappers };
  }

  public saveNewFolder(watchedFolder: WatchedFolder) {
    const folderAlreadyExist = this._watchedFolders.find(
      (folder) => folder.path === watchedFolder.path
    );

    if (folderAlreadyExist || watchedFolder.path === '') return;
    this._watchedFolders.push(watchedFolder);

    const watchedFoldersFile: WatchedFoldersFile = {
      folders: this._watchedFolders.map((folder) => folder.path),
      autoMappers: this._autoMappers,
    };

    fs.writeFileSync(
      this.databaseWFFilePath,
      JSON.stringify(watchedFoldersFile)
    );
  }

  public saveNewAutoMapper(autoMapper: AutoMapper) {
    const autoMapperAlreadyExistsForExt = this._autoMappers.find(
      (AM) => AM.ext === autoMapper.ext
    );

    if (autoMapperAlreadyExistsForExt || autoMapper.ext === '') return;
    this._autoMappers.push(autoMapper);

    const watchedFoldersFile: WatchedFoldersFile = {
      folders: this._watchedFolders.map((folder) => folder.path),
      autoMappers: this._autoMappers,
    };

    fs.writeFileSync(
      this.databaseWFFilePath,
      JSON.stringify(watchedFoldersFile)
    );
  }

  public deleteFolder(folder: string) {
    this._watchedFolders = this._watchedFolders.filter(
      (f) => f.path !== folder
    );

    const watchedFoldersFile: WatchedFoldersFile = {
      folders: this._watchedFolders.map((f) => f.path),
      autoMappers: this._autoMappers,
    };

    fs.writeFileSync(
      this.databaseWFFilePath,
      JSON.stringify(watchedFoldersFile)
    );
  }

  get databaseWFPath() {
    return this._databaseWFPath;
  }

  get databaseWFFilePath() {
    return this._databaseWFFilePath;
  }

  get watchedFolders() {
    return this._watchedFolders;
  }
}
