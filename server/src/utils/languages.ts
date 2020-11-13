export interface Language {
  name: string;
  extension: string;
  command: string;
  compile: boolean;
}

const languages: Language[] = [
  {
    name: "python",
    extension: "py",
    command: "python3",
    compile: false
  },
  {
    name: "java",
    extension: "java",
    command: "java",
    compile: true
  },
  {
    name: "c++",
    extension: "cpp",
    command: "none",
    compile: true
  },
  {
    name: "c",
    extension: "c",
    command: "none",
    compile: true
  },
  {
    name: "typescript",
    extension: "ts",
    command: "node",
    compile: true
  },
  {
    name: "javascript",
    extension: "js",
    command: "node",
    compile: false
  }
]

export const getLanguage = (fileName: string): Language | undefined => {
  const array = fileName.split(".");
  const extension = array[array.length - 1];
  return languages.find(language => language.extension === extension);
}