export interface Language {
  name: string;
  extension: string;
  command: string;
}

const languages: Language[] = [
  {
    name: "python",
    extension: "py",
    command: "python3",
  }
]

export const getLanguage = (extension:string): Language | undefined => {
  return languages.find(language => language.extension === extension);
}