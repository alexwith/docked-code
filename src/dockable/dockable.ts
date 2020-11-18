import fs, { promises as fsp, } from "fs";
import { exec } from 'child_process';

import {v4 as uuid} from 'uuid';
import { getLanguage } from "../utils/languages";
import { File, Resolver, Result } from '../utils/interfaces';
import { TIME_LIMIT_MS } from '../utils/contants';

import Dockerode from 'dockerode';  

class Dockable {
  id: string; 
  stdin: string;
  rootFile: string;
  files: File[];
  resolver: Resolver;
  volume: string;
  timeoutId: NodeJS.Timeout;
  containerId: string;
  information: string;
  sniffedEvent: NodeJS.ReadableStream | undefined;

  constructor(root: string, stdin: string, files: File[], resolver: Resolver) {
    this.id = uuid();
    this.stdin = stdin;
    this.rootFile = root;
    this.files = files;
    this.resolver = resolver;
    this.volume = `${this.replaceDist("")}/volumes/${this.id}`;
    this.timeoutId = this.timeout();
  }

  public validateFiles(_: File[]): boolean {
    return true;
  }

  public async execute() {
    await this.createVolume();
    this.dock();
    this.sniff();
  }

  private timeout(): NodeJS.Timeout {
    return setTimeout(() => {
      this.information = "exceeded the time limit"
      this.dispose();
      exec(`docker kill ${this.containerId}`);
    }, TIME_LIMIT_MS);
  }

  private createVolume(): Promise<void> {
    return new Promise((resolve, _) => {
      exec(`mkdir ${this.volume} && mkdir ${this.volume}/project && cp ${this.replaceDist("/src")}/payload/* ${this.volume}`, () => {
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
    const language = getLanguage(this.rootFile);
    if (!language) {
      this.resolver.resolve("", "Unable to find a language corresponding to the specified extension.", "?ms", this.information);
      return;
    }
    const { name: languageName, command, extension: langExtension } = language;
    const fileTrail = (): string => {
      let trail = `code/project/${this.rootFile}`;
      this.files.forEach((file) => {
        const { name, extension } = file;
        if (extension === langExtension) {
          trail += ` code/project/${name}.${extension}`;
        }
      })
      return trail;
    }
    const statement = `docker run --rm -d -it --cpus=".5" -v ${this.volume}:/code docked_code python3 /code/execute.py ${this.rootFile} ${languageName} ${command} '${fileTrail()}'`
    exec(statement, (_, containerId) => {
      this.containerId = containerId;
    });
  }

  private sniff() {
    const docker = new Dockerode();
    docker.getEvents((error, result) => {
      this.sniffedEvent = result;
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
              this.resolver.resolve(stdout, stderr, executionTime, this.information);
              this.dispose();
            } else {
              this.resolver.resolve("", "", "", this.information)
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
    clearTimeout(this.timeoutId)
    exec(`rm -rf ${this.volume}`);
  }

  private replaceDist(replace: string): string {
    return __dirname.replace("/dist/dockable", replace);
  }
}

export default Dockable;