import path from 'path';
import fs from 'fs-extra';
import { randomUUID } from 'crypto';
import { ipcMain } from 'electron';

interface ArtefactProps {
  originalPath: string;
  destinationPath?: string | null;
  isMapped?: boolean;
}

type ArtefactState = 'MOVED' | 'MOVING' | 'UNSET' | 'WAITING';

export class Artefact {
  private _id: string;

  private _originalPath: string;

  private _destinationPath: string;

  private _state: ArtefactState = 'WAITING';

  private _isMapped: boolean;

  constructor({ originalPath, destinationPath, isMapped }: ArtefactProps) {
    this._id = randomUUID();
    this._originalPath = originalPath;
    this._destinationPath = destinationPath ?? '';
    this._isMapped = isMapped ?? false;
  }

  get originalPath(): string {
    return this._originalPath;
  }

  get destinationPath(): string {
    return this._destinationPath;
  }

  set destinationPath(destinationPath: string) {
    this._destinationPath = destinationPath;
  }

  get state() {
    return this._state;
  }

  set state(state: ArtefactState) {
    this._state = state;
  }

  get id() {
    return this._id;
  }

  public async moveMe(): Promise<void> {
    if (this.state === 'WAITING') return;

    const statOfDefaultFile = await fs.stat(this.originalPath);

    const filename = path.basename(this.originalPath);

    const targetFilePath = path.join(
      this.destinationPath,
      filename.replaceAll(' ', '-')
    );

    await fs.copy(this.originalPath, targetFilePath);

    const statOfNewFile = await fs.stat(targetFilePath);

    if (statOfDefaultFile.size === statOfNewFile.size) {
      fs.rmSync(this.originalPath);
    }
  }

  public openVisualSelector() {
    ipcMain.emit('newArtefact', this.id);
  }
}
