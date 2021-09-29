import { Buffer } from 'buffer';
import { gunzipSync, gzipSync } from 'zlib';

import { Inventory as IInventory, SaveGame } from './game';

const fileInput = document.getElementById('fileupload') as HTMLInputElement;
fileInput.addEventListener('input', afterFileInput);

async function afterFileInput() {
  document.getElementById('fileinput')!.style.display = 'none';

  // setup and show loading
  const loadingContainer = document.getElementById('loading') as HTMLDivElement;
  loadingContainer.style.display = 'block';

  // get file content
  const file = await parseFile(fileInput);
  const data = JSON.parse(file) as SaveGame;

  // setup basic info
  const basicInfo = new BasicInfo();
  basicInfo.insert(data);

  // setup inventory
  const inventory = await Inventory.create();
  inventory.insert(data.hero.inventory);

  // save button
  document
    .getElementById('save')!
    .addEventListener('click', () => saveToFile(data, basicInfo, inventory));

  // add button
  document.getElementById('add')!.addEventListener('click', () => {
    const value = (document.getElementById('item') as HTMLSelectElement).value;
    inventory.add(value);
  });

  // hide loading
  loadingContainer.style.display = 'none';
}

function saveToFile(data: SaveGame, basicInfo: BasicInfo, inventory: Inventory) {
  const copy = { ...data, ...basicInfo.save(data) };
  copy.hero.inventory = inventory.save();
  const fileContent = gzipSync(JSON.stringify(copy));
  window.saveAs(new Blob([fileContent]), 'game.dat');
}

async function parseFile(input: HTMLInputElement): Promise<string> {
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
  return result;
}

function createOption(value: string, text: string): HTMLOptionElement {
  const option = document.createElement('option');
  option.value = value;
  option.text = text;
  return option;
}

class BasicInfo {
  seedInput: HTMLInputElement;
  versionInput: HTMLInputElement;
  amuletInput: HTMLInputElement;
  scoreInput: HTMLInputElement;
  goldInput: HTMLInputElement;
  healthInput: HTMLInputElement;
  maxHealthInput: HTMLInputElement;
  strengthInput: HTMLInputElement;
  attackInput: HTMLInputElement;
  defenseInput: HTMLInputElement;

  constructor() {
    this.seedInput = document.getElementById('seed') as HTMLInputElement;
    this.versionInput = document.getElementById('version') as HTMLInputElement;
    this.amuletInput = document.getElementById('amuletObtained') as HTMLInputElement;
    this.scoreInput = document.getElementById('score') as HTMLInputElement;
    this.goldInput = document.getElementById('gold') as HTMLInputElement;
    this.healthInput = document.getElementById('health') as HTMLInputElement;
    this.maxHealthInput = document.getElementById('maxhealth') as HTMLInputElement;
    this.strengthInput = document.getElementById('strength') as HTMLInputElement;
    this.attackInput = document.getElementById('attack') as HTMLInputElement;
    this.defenseInput = document.getElementById('defense') as HTMLInputElement;
  }

  insert(data: SaveGame): void {
    this.seedInput.value = data.seed.toString();
    this.versionInput.value = data.version.toString();
    this.amuletInput.checked = data.amuletObtained;
    this.scoreInput.value = data.score.toString();
    this.goldInput.value = data.gold.toString();
    this.healthInput.value = data.hero.HP.toString();
    this.maxHealthInput.value = data.hero.HT.toString();
    this.strengthInput.value = data.hero.STR.toString();
    this.attackInput.value = data.hero.attackSkill.toString();
    this.defenseInput.value = data.hero.defenseSkill.toString();
  }

  save(save: SaveGame): SaveGame {
    const data = { ...save };
    data.seed = this.seedInput.valueAsNumber;
    data.version = this.versionInput.valueAsNumber;
    data.amuletObtained = this.amuletInput.checked;
    data.score = this.scoreInput.valueAsNumber;
    data.gold = this.goldInput.valueAsNumber;
    data.hero.HP = this.healthInput.valueAsNumber;
    data.hero.HT = this.maxHealthInput.valueAsNumber;
    data.hero.STR = this.strengthInput.valueAsNumber;
    data.hero.attackSkill = this.attackInput.valueAsNumber;
    data.hero.defenseSkill = this.defenseInput.valueAsNumber;
    return data;
  }
}

export default async function getItems(): Promise<ITEM[]> {
  const response = await fetch('/js/items.json');
  return response.json();
}

export interface ITEM {
  className: string;
  name: string;
  imagePath: string;
}

class Inventory {
  mainContainer: HTMLDivElement;
  invSlots: HTMLCollectionOf<HTMLTableCellElement>;
  items: ITEM[];

  protected constructor(items: ITEM[]) {
    this.items = items;
    this.mainContainer = document.getElementById('main') as HTMLDivElement;
    this.invSlots = document.getElementsByClassName(
      'inv-slot'
    ) as HTMLCollectionOf<HTMLTableCellElement>;
    this.mainContainer.style.display = 'block';
  }

  static async create(): Promise<Inventory> {
    const items = await getItems();
    items.sort();
    items.forEach((v) => {
      document.getElementById('item')?.appendChild(createOption(v.className, v.name));
    });
    return new Inventory(items);
  }

  insert(inventory: IInventory[]): void {
    inventory.forEach((item, i) => {
      this.invSlots[i].classList.add('item');
      const gItem = this.items.find((v) => v.className === item.__className)!;
      this.invSlots[
        i
      ].innerHTML = `<img src="${gItem.imagePath}" data-class="${gItem.className}""><input type="number" min="0" max="99" value="${item.quantity}">`;
    });
  }

  save(): IInventory[] {
    const inv: IInventory[] = [];
    for (const el of Array.from(this.invSlots)) {
      if (!el.classList.contains('item')) {
        continue;
      }
      const quantity = (el.querySelector('input') as HTMLInputElement).valueAsNumber;
      if (quantity === 0) {
        continue;
      }
      const item = this.items.find((v) => v.className === el.querySelector('img')!.dataset.class)!;
      inv.push({
        __className: item.className,
        cursed: false,
        cursedKnown: false,
        quantity,
        levelKnown: true,
        level: 0,
        kept_lost: false
      });
    }
    return inv;
  }

  add(className: string) {
    if (
      Array.from(this.invSlots).find((v) => {
        const image = v.querySelector('img');
        if (!image) {
          return false;
        }
        return image.dataset.class === className;
      })
    ) {
      return alert('You already have this item');
    }
    const invSlot = Array.from(this.invSlots).find((v) => !v.classList.contains('item'));
    if (!invSlot) {
      return alert('Inventory is full');
    }
    const item = this.items.find((v) => v.className === className);
    if (!item) {
      return alert('Item not found');
    }
    invSlot.classList.add('item');
    invSlot.innerHTML = `<img src="${item.imagePath}" data-class="${item.className}""><input type="number" min="0" max="99" value="1">`;
  }
}
