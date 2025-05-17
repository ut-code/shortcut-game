/**
  Stage Grid, expressed as list of row from x=0 to x=max(x).
  All rows are expected to equal in length. (but there's no runtime check afaik)
  Example:
  [
    "bbbbbbbbbbb", // b stands for block
    "...........", // . stands for air
    ".....m..bbb", // m stands for movable block
    "bbbbbbbbbbb"
  ]
  */
export type Stage = string[];

export type SwitchGroup = {
  x: number;
  y: number;
  switchId: string;
};
export type BlockGroup = {
  x: number;
  y: number;
  objectId: string;
};
export type StageDefinition = {
  stage: Stage;
  isTutorial?: boolean;
  initialPlayerX: number; // 左端から0-indexed
  initialPlayerY: number; // 上端から0-indexed　+1すると浮かずに地面に立つ
  // ブロックと fallable のグループ
  // 複数ブロックからなるオブジェクトについては明示的に指定
  blockGroups: BlockGroup[];
  // スイッチに関わるブロックはすべて指定
  switchGroups: SwitchGroup[];
  // defaults to 0, Infinity, Infinity
  usage?: {
    copy: number;
    cut: number;
    paste: number;
  };
};
