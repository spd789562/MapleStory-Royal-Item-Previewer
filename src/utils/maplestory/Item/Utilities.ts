import type { IItemEntry } from 'maplestory/dist/Character/IItemEntry';
import type PKG1Factory from 'maplestory/dist/PKG1/Factory';

function ReturnIfExists(images: Record<string, string>, path: string) {
  const imageSplit = path.split('.img', 2); // .img is the actual server-stored file
  imageSplit[0] = imageSplit[0] + '.img'; // Fix the file path
  const [imageName, nodePath] = imageSplit;

  // We don't want to return the img name, but rather, the original path
  if (images[imageName]) return path;
}

export default class ItemUtilities {
  private factory: PKG1Factory;

  constructor(factory: PKG1Factory) {
    this.factory = factory;
  }

  public IsFaceId(id: number): boolean {
    return (id >= 20000 && id < 30000) || (id >= 50000 && id < 60000);
  }

  public IsFaceOrAccessoryId(id: number): boolean {
    let isFaceAcc = id >= 1010000 && id < 1020000;
    let isFace = (id >= 20000 && id < 30000) || (id >= 50000 && id < 60000);
    return isFaceAcc || isFace;
  }

  public IsHairId(id: number): boolean {
    return (id >= 30000 && id < 50000) || (id >= 60000 && id < 70000);
  }

  public IsCapId(id: number): boolean {
    return id.toString().startsWith('100');
  }

  public async GetItemImg(region: string, version: string, id: number) {
    const imgPath = await this.GetItemImgPath(region, version, id);
    if (!imgPath) return Promise.reject('null imgPath');
    return this.factory.resolve(region, version, imgPath);
  }

  public GetFolderForItem(item: IItemEntry): Promise<string> {
    return this.GetFolderForItemId(item.region, item.version, item.id);
  }

  public async GetFolderForItemId(region: string, version: string, id: number): Promise<string> {
    const folder = Math.floor(id / 100);
    var folders = await this.factory.getFolders(region, version);
    return folders[folder.toString()];
  }

  public async GetItemImgPath(region: string, version: string, id: number) {
    const folder = Math.floor(id / 100);
    const div10000 = Math.floor(id / 10000)
      .toString()
      .padStart(4, '0');
    const div1000 = Math.floor(id / 1000)
      .toString()
      .padStart(5, '0');
    const to8Digit = id.toString().padStart(8, '0');
    const folder6 = folder.toString().padStart(6, '0');
    let imgPath = null;
    const images = await this.factory.getImages(region, version);

    // Item/Consume
    if (folder >= 20000 && folder < 30000) imgPath = ReturnIfExists(images, `Item/Consume/${div10000}.img/${to8Digit}`);

    // Item/Install
    if (folder >= 30100 && folder < 40000) {
      // Item/Install/{301-399}
      if (folder >= 30150 && folder <= 30159)
        imgPath = ReturnIfExists(images, `Item/Install/${folder6}.img/${to8Digit}`);

      if ((folder >= 30160 && folder <= 30400) || !imgPath)
        imgPath = ReturnIfExists(images, `Item/Install/${div1000}.img/${to8Digit}`);

      if (folder >= 30400 || !imgPath) imgPath = ReturnIfExists(images, `Item/Install/${div10000}.img/${to8Digit}`);
    }

    // Item/Etc
    if (folder >= 40000 && folder < 50000) imgPath = ReturnIfExists(images, `Item/Etc/${div10000}.img/${to8Digit}`);

    if (folder >= 50000 && folder < 50100) imgPath = ReturnIfExists(images, `Item/Pet/${id}.img`);

    // Item/Cash
    if (folder >= 50100 && folder < 60000) imgPath = ReturnIfExists(images, `Item/Cash/${div10000}.img/${to8Digit}`);

    // Item/Special
    if (folder >= 90000 && folder < 90200) imgPath = ReturnIfExists(images, `Item/Special/${div10000}.img/${to8Digit}`);

    // Equips
    if ((folder >= 200 && folder < 20000) || !imgPath) {
      var folders = await this.factory.getFolders(region, version);
      var folderName = folders[folder.toString()];

      if (folderName) imgPath = ReturnIfExists(images, `Character/${folderName}/${to8Digit}.img`);

      if (!imgPath) {
        // Try the folder name in the next ID group?
        // Thanks Nexon, for fucking up IDs.
        var folderName = folders[(folder + 1).toString()];

        if (folderName) imgPath = ReturnIfExists(images, `Character/${folderName}/${to8Digit}.img`);
      }

      if (!imgPath) {
        // Try the folder name in the previous ID group?
        // Thanks Nexon, for fucking up IDs.
        var folderName = folders[(folder - 1).toString()];

        if (folderName) imgPath = ReturnIfExists(images, `Character/${folderName}/${to8Digit}.img`);
      }
    }

    // Body / Face
    if ((id >= 2000 && id < 20000) || !imgPath) imgPath = ReturnIfExists(images, `Character/${to8Digit}.img`);

    return imgPath;
  }
}
