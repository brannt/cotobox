import { readFile, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { execFile } from 'child_process';
import { chdir } from 'process';
import { promisify } from 'util';

import type { ISystemEnvironment } from 'cotobox-core'


export class CliEnvironment implements ISystemEnvironment {
    workDir: string = '.'

    setWorkDir(workDir?: string) {
        if (typeof workDir !== 'undefined') {
            this.workDir = workDir
        }
        chdir(this.workDir);
    }

    execProgram(executable: string, parameters: string[]): Promise<string> {
        const exec = promisify(execFile);
        return exec(join(this.workDir, executable), parameters)
            .then(res => { return res.stdout })
            .catch(res => { console.log(res.stderr); return res.stderr });
    };

    loadFile(filename: string, encoding?: 'utf-8' | 'latin1'): Promise<string> {
        return readFile(filename, encoding || 'utf-8');
    };

    writeFile(filename: string, content: string, encoding?: 'utf-8' | 'latin1'): Promise<void> {
        return writeFile(filename, content, { encoding: encoding || 'utf-8' });
    };

    deleteFile(filename: string): Promise<void> {
        return rm(filename, { force: true })
    }

}
