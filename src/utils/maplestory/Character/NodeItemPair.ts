import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import type { IItemEntry } from './IItemEntry';

export class NodeItemPair {
  item: IItemEntry;
  node: IProperty;
  info: Record<string, IProperty>;
  islot: Array<string>;
  vslot: Array<string>;
  zmap: Array<string>;
  smap: Record<string, string[]>;
  allowConflictingLocksWith?: NodeItemPair;

  constructor(
    item: IItemEntry,
    node: IProperty,
    infoNode: IProperty,
    zmap: Array<string>,
    smap: Record<string, Array<string>>,
  ) {
    this.item = item;
    this.node = node;

    this.info = infoNode.children.reduce((total, current) => {
      total[current.name] = current;
      return total;
    }, {} as Record<string, IProperty>);

    this.islot = this.info?.islot?.value.match(/.{1,2}/g);
    this.vslot = this.info?.vslot?.value.match(/.{1,2}/g);
    this.zmap = zmap;
    this.smap = smap;
  }
}
