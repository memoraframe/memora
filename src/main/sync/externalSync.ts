export abstract class ExternalSync {
  constructor() {}

    abstract listExternalFiles(): Promise<string[]>;
    abstract syncFile(externalFile: string, localFile: string): void;
  }
  