import fs from "fs";
import path from "path";

type FileInfo = {
  path: string;
  isDirectory: boolean;
};

function getAllFilesInDirectory(dir: string): FileInfo[] {
  let files: FileInfo[] = [];

  const filesInDir = fs.readdirSync(dir);

  filesInDir.forEach((file) => {
    const filePath = path.join(dir, file);
    console.log(filePath)
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      files = files.concat(getAllFilesInDirectory(filePath));
    } else {
      files.push({ path: filePath, isDirectory: false });
    }
  });

  return files;
}

const directoryPath = "./Ed Sheeran";
const allFiles = getAllFilesInDirectory(directoryPath);
console.log(allFiles);
