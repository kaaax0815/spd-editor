import { Buffer } from 'buffer';
import { gunzipSync, gzipSync } from 'zlib';

import { SaveGame } from './game';
import getItems from './items';

const input = document.getElementById('fileupload') as HTMLInputElement;
input.addEventListener('input', afterInput);

async function afterInput(ev: Event) {
  document.getElementById('fileinput')!.style.display = 'none';
  const loadingContainer = document.getElementById('loading') as HTMLDivElement;
  loadingContainer.style.display = 'block';
  // get input
  const input = ev.target as HTMLInputElement;
  const file = input.files![0];
  const result = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      const buffer = Buffer.from(reader.result as ArrayBuffer);
      const textBuffer = gunzipSync(buffer);
      const text = textBuffer.toString('utf-8');
      resolve(text);
    };
    reader.readAsArrayBuffer(file);
  });
  const data = JSON.parse(result) as SaveGame;
  // setup inventory
  const items = await getItems();
  const mainContainer = document.getElementById('main') as HTMLDivElement;
  const invSlots = document.getElementsByClassName(
    'inv-slot'
  ) as HTMLCollectionOf<HTMLButtonElement>;
  data.hero.inventory.forEach((item, i) => {
    invSlots[i].classList.add('item');
    invSlots[i].innerHTML = `<img src="${
      items.find((v) => v.className === item.__className)?.imagePath
    }" data-class="${item.__className}""><input type="number" min="0" max="99" value="${
      item.quantity
    }">`;
  });
  // TODO: add dropdown to remaining slots and then icon and quantity
  // const remaining = document.querySelectorAll('.inv-slot:not(.item)');
  document.getElementById('save')?.addEventListener('click', () => {
    const inv = data.hero.inventory;
    for (const el of Array.from(invSlots)) {
      if (!el.classList.contains('item')) {
        continue;
      }
      const quantity = el.querySelector('input')!.value;
      const item = items.find(
        (v) => v.className === el.querySelector('img')!.dataset.class
      )!.className;
      inv.find((v) => v.__className === item)!.quantity = parseInt(quantity, 10);
    }
    const copy = data;
    copy.hero.inventory = inv;
    const fileContent = gzipSync(JSON.stringify(copy));
    window.saveAs(new Blob([fileContent]), 'game.dat');
  });
  loadingContainer.style.display = 'none';
  mainContainer.style.display = 'block';
}
