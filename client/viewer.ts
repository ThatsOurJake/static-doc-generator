type renderTypes = 'image' | 'iframe' | 'json' | 'text' | 'interseq' | null;

const renderImage = (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container')!;

  const image = document.createElement('img');
  image.src = fileUrl;
  image.classList.add('u-block-center');

  container.appendChild(image);
};

const renderJSON = async (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container')!;

  const KeyValueEle = (key: string, value: string) => {
    const ele = document.createElement('p');

    const keyEle = document.createElement('span');
    keyEle.classList.add('f-color-blue');
    keyEle.textContent = key;

    const separator = document.createElement('span');
    separator.classList.add('separator')
    separator.textContent = `:`;

    const valueEle = document.createElement('span');
    valueEle.textContent = value;
    valueEle.classList.add('f-color-green');

    ele.append(keyEle, separator, valueEle);

    return ele;
  };

  const DataEle = (key: string, count: number, isArray: boolean) => {
    const ele = document.createElement('p');
    ele.classList.add('f-color-purple');
    ele.addEventListener('click', () => {
      ele.classList.toggle('json-nested-item-showing');
      ele.parentNode?.querySelectorAll(':scope > .json-nested-item').forEach(x => x.classList.toggle('json-nested-item-show'));
    });
    ele.classList.add('json-nested-item-selector');

    const keyEle = document.createElement('span');
    keyEle.textContent = `${key} {${count}}`;

    if (isArray) {
      keyEle.textContent = `${key} [${count}]`;
    }

    ele.append(keyEle);

    return ele;
  };

  const render = (parentRoot: HTMLElement, key: string, value: { [key: string]: string }[] | { [key: string]: string } | string) => {
    const item = document.createElement('li');
    const root = document.createElement('ul');
    root.classList.add('json-nested-item');

    if (Array.isArray(value)) {
      item.appendChild(DataEle(key, value.length, true));

      for (let i = 0; i < value.length; i++) {
        const nestedValue = value[i];

        if (nestedValue === undefined) {
          continue;
        }

        render(root, i.toString(), nestedValue);
      }

      item.appendChild(root);
    } else if (typeof value === 'object') {
      item.appendChild(DataEle(key, Object.keys(value).length, false));
      const keys = Object.keys(value);

      for (const k of keys) {
        const v = value[k];

        if (v === undefined) {
          continue;
        }

        render(root, k, v);
      }

      item.appendChild(root);
    } else {
      item.appendChild(KeyValueEle(key, value));
    }

    parentRoot.appendChild(item);
    return parentRoot;
  }

  let data: unknown;

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
    });
    data = await response.json();
  } catch (x) {
    console.error(x);
    return renderUnknown(fileUrl, fileName);
  }

  if (!data) {
    return;
  }

  const root = document.createElement('ul');
  root.classList.add('json-viewer');

  const controls = document.createElement('div');
  controls.classList.add('controls');

  const showAllEle = document.createElement('p');
  showAllEle.innerText = 'Show all properties';
  showAllEle.addEventListener('click', () => root.querySelectorAll('.json-nested-item-selector').forEach(x => {
    x.classList.add('json-nested-item-showing');
    x.parentNode?.querySelectorAll(':scope > .json-nested-item').forEach(x => x.classList.add('json-nested-item-show'));
  }));
  controls.append(showAllEle);

  const hideAllEle = document.createElement('p');
  hideAllEle.innerText = 'Hide all properties';
  hideAllEle.addEventListener('click', () => root.querySelectorAll('.json-nested-item-selector').forEach(x => {
    x.classList.remove('json-nested-item-showing');
    x.parentNode?.querySelectorAll(':scope > .json-nested-item').forEach(x => x.classList.remove('json-nested-item-show'));
  }));
  controls.append(hideAllEle);

  container.append(
    controls,
    render(
      root,
      Array.isArray(data) ? 'array' : 'object',
      data as { [key: string]: string }[] | { [key: string]: string } | string)
  );
};

const renderIFrame = (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container')!;

  const iframe = document.createElement('iframe');
  iframe.src = fileUrl;
  iframe.classList.add('u-block-center');

  container.appendChild(iframe);
};

const renderUnknown = (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container')!;

  const paragraph = document.createElement('p');
  paragraph.innerText = 'File type not supported for viewing: ';

  const downloadLink = document.createElement('a');
  downloadLink.href = fileUrl;
  downloadLink.download = fileName;
  downloadLink.innerText = 'Download';

  paragraph.appendChild(downloadLink);
  container.appendChild(paragraph);
};

const renderText = async (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container')!;

  let data: string;

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
    });
    data = await response.text();
  } catch (x) {
    console.error(x);
    return renderUnknown(fileUrl, fileName);
  }

  if (!data) {
    return;
  }

  const root = document.createElement('div');
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.innerText = data;
  pre.appendChild(code);
  root.appendChild(pre);
  container.appendChild(root);
};

const renderInterseq = async (fileUrl: string, fileName: string) => {
  const container = document.getElementById('container');

  const interseqContainer = document.createElement('inter-seq');

  const interseqScript = document.createElement('script');
  interseqScript.type = 'text/x-interseq';

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
    });
    const content = await response.text();
    interseqScript.innerHTML = content;
    interseqContainer.appendChild(interseqScript);
    container?.appendChild(interseqContainer);
  } catch (x) {
    console.error(x);
    renderUnknown(fileUrl, fileName);
  }
};

const determineType = (fileName: string): renderTypes => {
  const fileExt = fileName.split('.').pop();

  switch (fileExt) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'image';
    case 'pdf':
    case 'html':
      return 'iframe';
    case 'json':
      return 'json';
    case 'txt':
    case 'md':
      return 'text';
    case 'iseq':
      return 'interseq';
    default:
      return null;
  }
};

const render = () => {
  const params = new URLSearchParams(window.location.search);
  const file = params.get('file');

  if (!file) {
    return;
  }

  const fileName = file.split('/').pop();

  if (!fileName) {
    return;
  }

  window.document.title = `File Viewer - ${fileName}`;
  const fileType = determineType(fileName);

  switch (fileType) {
    case 'image':
      return renderImage(file, fileName);
    case 'iframe':
      return renderIFrame(file, fileName);
    case 'json':
      return renderJSON(file, fileName);
    case 'text':
      return renderText(file, fileName);
    case 'interseq':
      return renderInterseq(file, fileName);
    default:
      return renderUnknown(file, fileName);
  }
};

window.addEventListener('load', render);
