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
    command: "python",
    compile: false
  },
  {
    name: "java",
    extension: "java",
    command: "java",
    compile: true
  }
]

export const getLanguage = (fileName: string): Language | undefined => {
  const array = fileName.split(".");
  const extension = array[array.length - 1];
  return languages.find(language => language.extension === extension);
}