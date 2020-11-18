export interface File {
  name: string;
  extension: string;
  content: string;
}

export interface Result {
  stdout: string;
  stderr: string;
  executionTime: string;
}

export interface Resolver {
  resolve: (stdout: string, stderr: string, executionTime: string, information: string) => void;
}