import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

import { TreeAPI, Type } from './github.js';

const CONTENTS = '/repos/00-Evan/shattered-pixel-dungeon/contents';

const START_PATH = '/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items';

const GITUHB_API = 'https://api.github.com';

const VERSION = '4aed22a4f2ebea34e42fa961ee17f97588ca1acf';

interface ITEM {
  className: string;
  name: string;
  imagePath: string;
}

async function _getItems(): Promise<ITEM[]> {
  const available_items = await __getItems();
  return available_items;
}

async function __getItems(available_items: ITEM[] = [], folder?: string): Promise<ITEM[]> {
  const itemsResult = await fetch(GITUHB_API + CONTENTS + (folder || START_PATH));
  const items = (await itemsResult.json()) as TreeAPI[] | GithubError;
  if (!isTreeAPI(items)) {
    throw new Error(JSON.stringify(items));
  }
  for (const item of items) {
    if (item.type === Type.File) {
      const name = item.name.replace('.java', '');
      const pathResult = await fetch(
        `https://raw.githubusercontent.com/00-Evan/shattered-pixel-dungeon/${VERSION}/${item.path}`
      );
      const pathText = await pathResult.text();
      let image = pathText.match(/image = ItemSpriteSheet\.(.*);/);
      if (!image) {
        image = pathText.match(/icon = ItemSpriteSheet\.Icons\.(.*);/);
        if (!image) {
          continue;
        }
      }
      if (typeof image[1] !== 'string') {
        continue;
      }
      if (image[1].endsWith('_HOLDER')) {
        continue;
      }
      const adfix = folder
        ? [folder.replace(START_PATH.slice(1) + '/', '').replace(/\//g, '.'), name]
        : [name];
      available_items.push({
        className: classPrefix(['items', ...adfix]),
        name: splitCamelCase(name),
        imagePath: '/images/items/' + image[1] + '.png'
      });
    } else if (item.type === Type.Dir) {
      await __getItems(available_items, item.path);
    }
  }
  return available_items;
}

function isTreeAPI(a: TreeAPI[] | GithubError): a is TreeAPI[] {
  return (a as TreeAPI[]).length !== undefined;
}

interface GithubError {
  message: string;
  documentation_url: string;
}

function splitCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function classPrefix(subClasses: ['items', ...string[]]) {
  const CORE_CLASS = 'com.shatteredpixel.shatteredpixeldungeon.';
  return CORE_CLASS + subClasses.join('.');
}
console.log('Getting items...');
_getItems().then((items) => {
  console.log('Writing File...');
  writeFile('dist/js/items.json', JSON.stringify(items), 'utf8');
});
