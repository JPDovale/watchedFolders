import { FSWatcher, watch } from 'chokidar';
import { Stats } from 'fs';

interface WatchedFolderProps {
  path: string;
}

export class WatchedFolder {
  private _path: string;

  private watcher: FSWatcher;

  constructor({ path }: WatchedFolderProps) {
    this._path = path;
    this.watcher = watch(path, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: true,
    });
  }

  public start(
    listener: (pathAdded: string, stats: Stats | undefined) => void
  ): void {
    this.watcher.on('add', listener);
  }

  get path() {
    return this._path;
  }
}
