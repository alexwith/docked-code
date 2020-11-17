import fs, { promises as fsp, } from "fs";
import { exec } from 'child_process';
import {v4 as uuid} from 'uuid';
import { getLanguage } from "../utils/languages";
import Dockerode from 'dockerode';

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
  callback: CallbackContainer;
  encodedFiles: string;
  payload: string;
  volume: string;
  containerId: string;
  eventResult: NodeJS.ReadableStream | undefined;

  constructor(root: string, stdin: string, files: File[], callback: CallbackContainer) {
    this.id = uuid();
    this.root = root;
    this.stdin = stdin;
    this.files = files;
    this.callback = callback;
    this.encodedFiles = Buffer.from(JSON.stringify(files)).toString("base64");
    this.payload = `${this.replaceDir("/src")}/payload`;
    this.volume = `${this.replaceDir("")}/volumes/${this.id}`;
  }

  public replaceDir(replace: string): string {
    return __dirname.replace("/dist/dockable", replace);
  }

  public validateFiles(_: File[]): boolean {
    return true;
  }

  public async execute() {
    await this.createVolume();
    this.dock();
    this.sniff();
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
    const language = getLanguage(this.root);
    if (!language) {
      this.callback.callback("", "Unable to find a language corresponding to the specified extension.", "?ms");
      return;
    }
    const { name: languageName, command, extension: langExtension } = language;
    const fileTrail = (): string => {
      let trail = `code/project/${this.root}`;
      this.files.forEach((file) => {
        const { name, extension } = file;
        if (extension === langExtension) {
          trail += ` code/project/${name}.${extension}`;
        }
      })
      return trail;
    }
    const statement = `docker run --rm -d -it -v ${this.volume}:/code docked_code python3 /code/execute.py ${this.root} ${languageName} ${command} '${fileTrail()}'`
    exec(statement, (_, containerId) => {
      this.containerId = containerId;
    });
  }

  private sniff() {
    const docker = new Dockerode();
    docker.getEvents((error, result) => {
      this.eventResult = result;
      if (error) {

      } else {
        result?.on('data', async (chunk) => {
          const { id, Action: action } = JSON.parse(chunk.toString('utf8'));
          if (action !== "die") {
            return;
          }
          if (this.containerId && this.containerId.includes(id)) {
            const { stdout, stderr, executionTime }: Result = await this.findResult();
            if (stdout !== "400") {
              this.callback.callback(stdout, stderr, executionTime);
              this.dispose();
            } else {
              this.callback.callback("", "Something went horribly wrong.", "")
            }
          }
        })
      }
    })
  }

  private async findResult(): Promise<Result> {
      const read = async (name: string): Promise<string> => {
        return new Promise(async (resolve) => {
          try {
            const content = await fsp.readFile(`${this.volume}/${name}.txt`, "utf-8");
            resolve(content);
          } catch (_) {
            resolve("400");
          } 
        });
      }
      const stdout = await read("stdout");
      const post = await read("post");
      const time = post.split("-")[1];
      const stderr = await read("stderr");
      return new Promise((resolve) => {
        resolve({
          stdout,
          stderr,
          executionTime: time ? `${time}ms` : "failed to fetch time",
        });
      });
  } 

  private dispose() {
    exec(`rm -rf ${this.volume}`);
  }
}

export default Dockable;