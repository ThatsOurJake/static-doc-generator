import fs from 'fs';
import path from 'path';

const docsIgnore = (): string[] => {
  try {
    const raw = fs.readFileSync(path.resolve('.docsignore')).toString();
    return raw.split('\n').map(x => x.toLowerCase());
  } catch (err) {
    return [];
  }
};

export default docsIgnore;
