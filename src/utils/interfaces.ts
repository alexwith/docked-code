export interface File {
  name: string;
  extension: string;
  content: string;
}

export interface Result {
  stdout: string;
  stderr: string;
  executionTime: string;
  totalTime: string;
}

export interface Resolver {
  resolve: (stdout: string, stderr: string, executionTime: string, startTime: string, information: string) => void;
}