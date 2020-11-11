import fs, { promises as fsp } from "fs";
import { exec } from 'child_process';
import {v4 as uuid} from 'uuid';

const TIMEOUT_BREAK = 5;

export interface File {
  name: string;
  extension: string;
  content: string;
}

interface Result {
  stdout: string;
  stderr: string;
  executionTime: string;
}

interface CallbackContainer {
  callback: (stdout: string, stderr: string, executionTime: string) => void
}

class Dockable {
  id: string; 
  root: string;
  stdin: string;
  files: File[];
  encodedFiles: string;
  payload: string;
  volume: string;

  constructor(root: string, stdin: string, files: File[]) {
    this.id = uuid();
    this.root = root;
    this.stdin = stdin;
    this.files = files;
    this.encodedFiles = Buffer.from(JSON.stringify(files)).toString("base64");
    this.payload = `${this.replaceDir("/src")}/payload`;
    this.volume = `${this.replaceDir("")}/volumes/${this.id}`;
  }

  public replaceDir(replace: string): string {
    return __dirname.replace("/dist/dockable", replace);
  }

  public validateFiles(files: File[]): boolean {
    return true;
  }

  public async execute(callbackContainer: CallbackContainer) {
    await this.createVolume();
    this.dock();
    this.waitResult(callbackContainer);
  }

  private createVolume(): Promise<void> {
    return new Promise((resolve, _) => {
      exec(`mkdir ${this.volume} && mkdir ${this.volume}/project && cp ${this.replaceDir("/src")}/payload/* ${this.volume}`, () => {
        fs.writeFile(`${this.volume}/stdin.txt`, this.stdin.replace(/,/g, "\n"), (_) => {});
        this.files.forEach((file) => {
          const { name, extension, content } = file;
          const decodedContent = Buffer.from(content, "base64").toString();
          fs.writeFile(`${this.volume}/project/${name}.${extension}`, decodedContent, (_) => {});
        });
        resolve();
      });
    });
  }

  private dock() {
    const statement = `${this.replaceDir("/src")}/dockable/dock.py ${this.root} ${this.volume}`;
    exec(statement);
  }

  private waitResult(callbackContainer: CallbackContainer) {
    let pending = 0;
    const id = setInterval(async () => {
      pending += 1;
      const { stdout, stderr, executionTime }: Result = await this.findResult(id);
      callbackContainer.callback(stdout, stderr, executionTime);
      if (pending >= TIMEOUT_BREAK) {
        this.dispose(id)
      }
    }, 1000)
  }

  private async findResult(id: NodeJS.Timeout): Promise<Result> {
      const read = async (name: string): Promise<string> => {
        return fsp.readFile(`${this.volume}/${name}.txt`, "utf-8").then((content) => {
          return content;
        }).catch((error) => {
          throw error;
        })
      }
      const stdout = await read("stdout");
      const post = await read("post");
      const time = post.split("-")[1];
      const stderr = await read("stderr");
      this.dispose(id);
      return {
        stdout,
        stderr,
        executionTime: `${time ? time : "?"}ms`
      }
  } 

  private dispose(id: NodeJS.Timeout) {
    exec(`rm -rf ${this.volume}`)
    clearInterval(id);
  }
}

export default Dockable;