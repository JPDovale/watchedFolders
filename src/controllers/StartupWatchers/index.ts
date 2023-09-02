import path from 'path';
import { Artefact } from '../../models/Artefact';
import { WatchedFoldersRepository } from '../../repos/WatchedFolders';
import { WatchedFolder } from '../../models/WatchedFolder';

interface AutoMapper {
  ext: string;
  destinationPath: string;
}

export class StartupWatchers {
  private _watchedFolders: WatchedFolder[] = [];

  private _watchedFoldersRepo: WatchedFoldersRepository;

  private _artefacts: Artefact[] = [];

  private _autoMappers: AutoMapper[] = [];

  constructor(databasePath: string) {
    this._watchedFoldersRepo = new WatchedFoldersRepository(databasePath);
    this.init();
  }

  private init() {
    const { watchedFolders, autoMappers } = this._watchedFoldersRepo.load();
    watchedFolders.forEach((watchedFolder) =>
      this._watchedFolders.push(watchedFolder)
    );
    this._autoMappers = [...autoMappers];
    this.startWatcher();
  }

  public getFolders() {
    return this._watchedFolders.map((folder) => folder.path);
  }

  public getAutoMappers() {
    return this._autoMappers;
  }

  public addFolder(watchedFolder: WatchedFolder) {
    this._watchedFolders.push(watchedFolder);
    this._watchedFoldersRepo.saveNewFolder(watchedFolder);
  }

  public addAutoMapper(autoMapper: AutoMapper) {
    this._watchedFoldersRepo.saveNewAutoMapper(autoMapper);
  }

  public startWatcher() {
    this._watchedFolders.forEach((watchedFolder) => {
      watchedFolder.start(this.watcherAddListener.bind(this));
    });
  }

  public async watcherAddListener(pathAdded: string) {
    const extOfFile = path.extname(pathAdded);

    const autoMapper = this._autoMappers.find((AM) => AM.ext === extOfFile);
    const isMapped = !!autoMapper;

    const artefact = new Artefact({
      originalPath: pathAdded,
      destinationPath: autoMapper ? autoMapper.destinationPath : '',
      isMapped,
    });

    this._artefacts.push(artefact);

    if (!autoMapper) {
      artefact.openVisualSelector();
    }

    if (isMapped) {
      artefact.state = 'MOVING';
      await artefact.moveMe();
      artefact.state = 'MOVED';
    }
  }

  public getArtefact(id: string): Artefact | null {
    const artefact = this._artefacts.find((a) => a.id === id);

    return artefact ?? null;
  }

  public getArtefacts(): Artefact[] {
    return this._artefacts;
  }

  public async setDestinationFolderOfArtefact(
    artefactId: string,
    destinationPath: string
  ) {
    const artefact = this.getArtefact(artefactId);

    if (artefact) {
      artefact.destinationPath = destinationPath;

      artefact.state = 'MOVING';
      await artefact.moveMe();
      artefact.state = 'MOVED';
    }
  }

  public removeArtefact(artefactId: string) {
    this._artefacts = this._artefacts.filter((art) => art.id !== artefactId);
  }

  public async removeFolder(folder: string) {
    this._watchedFolders = this._watchedFolders.filter(
      (f) => f.path !== folder
    );
    this._watchedFoldersRepo.deleteFolder(folder);
  }
}
