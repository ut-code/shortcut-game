export type StageDefinition = {
  stage: string[];
  initialPlayerX: number;
  initialPlayerY: number;
  movableBlocks: {
    x: number;
    y: number;
    objectId: string;
    // 基準ブロックからの相対位置
    // 基準ブロックは原則オブジェクトの左下で
    // 右を向くときに目の前に来るブロック
    relativeX: number;
    relativeY: number;
  }[];
};

export const stages = new Map<string, StageDefinition>([
  [
    "1",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        ".........b........",
        ".........b........",
        ".........b...bbbbb",
        ".........m...bbbbb",
        "bbbbbbbbbbbbbbbbbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 5,
      movableBlocks: [
        {
          x: 9,
          y: 4,
          objectId: "1",
          relativeX: 0,
          relativeY: 0,
        },
      ],
    },
  ],
  [
    "2",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        "..................",
        "..................",
        "m............bbbbb",
        "bb...........bbbbb",
        "bb.....m.....bbbbb",
        "bbbbbbbbbbbbbbbbbb",
      ],
      initialPlayerX: 3,
      initialPlayerY: 6,
      movableBlocks: [
        {
          x: 0,
          y: 3,
          objectId: "1",
          relativeX: 0,
          relativeY: 0,
        },
        {
          x: 7,
          y: 5,
          objectId: "2",
          relativeX: 0,
          relativeY: 0,
        },
      ],
    },
  ],
  [
    "3",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        "...b..............",
        "...b....m......bbb",
        "...bm..........bbb",
        "...bbb.........bbb",
        "...mm..........bbb",
        "bbbbbbbbbbb....bbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 6,
      movableBlocks: [
        {
          x: 3,
          y: 5,
          objectId: "1",
          relativeX: 0,
          relativeY: 0,
        },
        {
          x: 4,
          y: 5,
          objectId: "1",
          relativeX: 1,
          relativeY: 0,
        },
        {
          x: 4,
          y: 3,
          objectId: "2",
          relativeX: 0,
          relativeY: 0,
        },
        {
          x: 8,
          y: 2,
          objectId: "3",
          relativeX: 0,
          relativeY: 0,
        },
      ],
    },
  ],
]);
