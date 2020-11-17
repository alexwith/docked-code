export interface Language {
  name: string;
  extension: string;
  command: string;
  compile: boolean;
  fileTrail: boolean;
}

const languages: Language[] = [
  {
    name: "python",
    extension: "py",
    command: "python3",
    compile: false,
    fileTrail: false
  },
  {
    name: "java",
    extension: "java",
    command: "java",
    compile: true,
    fileTrail: true
  },
  {
    name: "c++",
    extension: "cpp",
    command: "none",
    compile: true,
    fileTrail: false
  },
  {
    name: "c",
    extension: "c",
    command: "none",
    compile: true,
    fileTrail: false
  },
  {
    name: "typescript",
    extension: "ts",
    command: "ts-node",
    compile: false,
    fileTrail: false
  },
  {
    name: "javascript",
    extension: "js",
    command: "node",
    compile: false,
    fileTrail: false
  }
]

export const getLanguage = (fileName: string): Language | undefined => {
  const array = fileName.split(".");
  const extension = array[array.length - 1];
  return languages.find(language => language.extension === extension);
}