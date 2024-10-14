export abstract class ExternalSync {
  constructor(public syncDir: string) {}

    abstract listExternalFiles(): Promise<string[]>;
    abstract syncFile(externalFile: string, localFile: string): void;
  }
  