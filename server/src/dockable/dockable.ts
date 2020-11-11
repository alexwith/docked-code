import fs, { promises as fsp } from "fs";
import { exec } from 'child_process';
import {v4 as uuid} from 'uuid';
import { getLanguage } from "../utils/languages";

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

  public validateFiles(files: File[]): boolean {
    return true;
  }

  public async execute() {
    await this.createVolume();
    this.dock();
    this.waitResult();
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
    const { command, compile } = language;
    const statement = `${this.replaceDir("/src")}/dockable/dock.py ${this.volume} ${this.root} ${command}`;
    exec(statement);
  }

  private waitResult() {
    let pending = 0;
    const id = setInterval(async () => {
      pending += 1;
      const { stdout, stderr, executionTime }: Result = await this.findResult(id).catch(() => {
        return {
          stdout: "bob",
          stderr: "bob",
          executionTime: "bob"
        }
      });
      this.callback.callback(stdout, stderr, executionTime);
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
    //exec(`rm -rf ${this.volume}`)
    clearInterval(id);
  }
}

export default Dockable;