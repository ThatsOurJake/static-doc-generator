import fs from 'node:fs';
import path from 'node:path';

import gitIgnore from './gitignore';

export interface File {
  path: string;
  name: string;
}

const getFiles = (dir: string): File[] => {
  const files = fs.readdirSync(dir, { withFileTypes: true }).filter(x => x.isFile());
  const gitignore = gitIgnore();

  if (files.length === 0) {
    return [];
  }

  return files.filter(x => !gitignore.includes(x.name.toLowerCase())).map(x => ({ name: x.name, path: path.join(dir, x.name) }));
};

export default getFiles;
