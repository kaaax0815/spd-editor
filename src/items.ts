import { TreeAPI, Type } from './github';

const CONTENTS = '/repos/00-Evan/shattered-pixel-dungeon/contents';

const START_PATH = '/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/items';

const GITUHB_API = 'https://api.github.com';

const VERSION = '4aed22a4f2ebea34e42fa961ee17f97588ca1acf';

export interface ITEM {
  className: string;
  name: string;
  imagePath: string;
}

export default async function getItems(): Promise<ITEM[]> {
  const localJSON = localStorage.getItem('available_items');
  if (localJSON) {
    const obj = JSON.parse(localJSON) as { available_items: ITEM[]; last_update: number };
    // no need to update because of fixed version
    if (obj.available_items.length > 0) {
      return obj.available_items;
    }
  }
  const available_items = await _getItems();
  localStorage.setItem(
    'available_items',
    JSON.stringify({ available_items, last_update: Date.now() })
  );
  return available_items;
}

async function _getItems(available_items: ITEM[] = [], folder?: string): Promise<ITEM[]> {
  const itemsResult = await fetch(GITUHB_API + CONTENTS + (folder || START_PATH));
  const items: TreeAPI[] = await itemsResult.json();
  for (const item of items) {
    if (item.type === Type.File) {
      const name = item.name.replace('.java', '');
      const pathResult = await fetch(
        `https://raw.githubusercontent.com/00-Evan/shattered-pixel-dungeon/${VERSION}/${item.path}`
      );
      const pathText = await pathResult.text();
      const image = pathText.match(/image = ItemSpriteSheet\.(.*);/);
      if (!image) {
        continue;
      }
      if (typeof image[1] !== 'string') {
        continue;
      }
      if (image[1].endsWith('_HOLDER')) {
        continue;
      }
      const adfix = folder
        ? [folder.replace(START_PATH.slice(1) + '/', '').replace('/', '.'), name]
        : [name];
      available_items.push({
        className: classPrefix(['items', ...adfix]),
        name,
        imagePath: '/images/items/' + image[1] + '.png'
      });
    } else if (item.type === Type.Dir) {
      await _getItems(available_items, item.path);
    }
  }
  return available_items;
}

function classPrefix(subClasses: ['items', ...string[]]) {
  const CORE_CLASS = 'com.shatteredpixel.shatteredpixeldungeon.';
  return CORE_CLASS + subClasses.join('.');
}
