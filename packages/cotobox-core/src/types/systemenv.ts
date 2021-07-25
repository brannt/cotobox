export interface ISystemEnvironment {
    workDir: string;

    setWorkDir: (workDir?: string) => Promise<void>;

    execProgram: (executable: string, parameters: string[]) => Promise<string>;

    loadFile: (filename: string, encoding?: 'utf-8' | 'latin1') => Promise<string>;

    writeFile: (filename: string, content: string, encoding?: 'utf-8' | 'latin1') => Promise<void>;

    deleteFile: (filename: string) => Promise<void>;
}
