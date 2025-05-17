export type StageDefinition = {
  stage: Stage;
  isTutorial?: boolean;
  initialPlayerX: number; // 左端から0-indexed
  initialPlayerY: number; // 上端から0-indexed　+1すると浮かずに地面に立つ
  blockGroups: {
    // 複数ブロックからなるオブジェクトについては明示的に指定
    x: number;
    y: number;
    objectId: string;
  }[];
  switchGroups: {
    // スイッチに関わるブロックはすべて指定
    x: number;
    y: number;
    switchId: string;
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
      isTutorial: true,
      initialPlayerX: 1,
      initialPlayerY: 5,
      blockGroups: [],
      switchGroups: [],
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
      isTutorial: true,
      initialPlayerX: 3,
      initialPlayerY: 6,
      blockGroups: [],
      switchGroups: [],
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
      blockGroups: [
        {
          x: 3,
          y: 5,
          objectId: "1",
        },
        {
          x: 4,
          y: 5,
          objectId: "1",
        },
      ],
      switchGroups: [],
    },
  ],
  [
    "4",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbbbbbb",
        "......................",
        "......................",
        "m..................bbb",
        "bb.................bbb",
        "bb..........m......bbb",
        "bb.........mm......bbb",
        "bb..bb...bbbbb.....bbb",
        "bb..bbb............bbb",
        "bb..bbbb..m........bbb",
        "bb..bbbbbbbbbbb....bbb",
      ],
      initialPlayerX: 5,
      initialPlayerY: 7,
      blockGroups: [
        {
          x: 11,
          y: 6,
          objectId: "1",
        },
        {
          x: 12,
          y: 6,
          objectId: "1",
        },
        {
          x: 12,
          y: 5,
          objectId: "1",
        },
      ],
      switchGroups: [],
    },
  ],
  [
    "5",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        ".........b........",
        ".........b........",
        ".........w........",
        ".s....m..w........",
        "bSbbbbbbbbbbbbbbbb",
      ],
      initialPlayerX: 3,
      initialPlayerY: 5,
      blockGroups: [],
      switchGroups: [
        {
          x: 1,
          y: 4,
          switchId: "1",
        },
        {
          x: 9,
          y: 3,
          switchId: "1",
        },
        {
          x: 9,
          y: 4,
          switchId: "1",
        },
      ],
    },
  ],
  [
    "6",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbbbbbbbbb",
        ".........................",
        ".........................",
        "...............wbbbbbbbbb",
        "m...............bbbbbbbbb",
        "bb..............w.....m..",
        "bb..............b....mm..",
        "bb.w....m..s...bb...mmm..",
        "bbbbbbbbbbbSbbbbbbbbbbbbb",
      ],
      initialPlayerX: 5,
      initialPlayerY: 8,
      blockGroups: [
        {
          x: 20,
          y: 7,
          objectId: "1",
        },
        {
          x: 21,
          y: 7,
          objectId: "1",
        },
        {
          x: 21,
          y: 6,
          objectId: "1",
        },
        {
          x: 22,
          y: 5,
          objectId: "1",
        },
        {
          x: 22,
          y: 6,
          objectId: "1",
        },
        {
          x: 22,
          y: 7,
          objectId: "1",
        },
      ],
      switchGroups: [
        {
          x: 3,
          y: 7,
          switchId: "1",
        },
        {
          x: 11,
          y: 7,
          switchId: "1",
        },
        {
          x: 15,
          y: 3,
          switchId: "1",
        },
        {
          x: 16,
          y: 5,
          switchId: "1",
        },
      ],
    },
  ],
  [
    "7",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        "..................",
        "..................",
        "........w......bbb",
        "........w.....wbbb",
        ".....bm.w....w.bbb",
        ".....bbb...bbbbbbb",
        "...m.bbb...bbbbbbb",
        "...mm...s.........",
        "bbbbbbbbSbbbbbbbbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 9,
      blockGroups: [
        {
          x: 3,
          y: 7,
          objectId: "1",
        },
        {
          x: 3,
          y: 8,
          objectId: "1",
        },
        {
          x: 4,
          y: 8,
          objectId: "1",
        },
      ],
      switchGroups: [
        {
          x: 8,
          y: 3,
          switchId: "1",
        },
        {
          x: 8,
          y: 4,
          switchId: "1",
        },
        {
          x: 8,
          y: 5,
          switchId: "1",
        },
        {
          x: 8,
          y: 8,
          switchId: "1",
        },
        {
          x: 13,
          y: 5,
          switchId: "1",
        },
        {
          x: 14,
          y: 4,
          switchId: "1",
        },
      ],
    },
  ],
  [
    "8",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbbbbbbb",
        ".........w...b.........",
        ".........w...b...m.....",
        ".........bbbbb.........",
        "m.......w.....w......m.",
        "mm.....w.......w.....mm",
        "bbb..bb.........bb..bbb",
        ".......w.......w.......",
        "....s.m.w.....w...s....",
        "bbbbSbbbbbbbbbbbbbSbbbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 9,
      blockGroups: [
        {
          x: 0,
          y: 4,
          objectId: "1",
        },
        {
          x: 0,
          y: 5,
          objectId: "1",
        },
        {
          x: 1,
          y: 5,
          objectId: "1",
        },
        {
          x: 21,
          y: 4,
          objectId: "2",
        },
        {
          x: 21,
          y: 5,
          objectId: "2",
        },
        {
          x: 22,
          y: 5,
          objectId: "2",
        },
      ],
      switchGroups: [
        {
          x: 4,
          y: 8,
          switchId: "1",
        },
        {
          x: 7,
          y: 5,
          switchId: "2",
        },
        {
          x: 7,
          y: 7,
          switchId: "1",
        },
        {
          x: 8,
          y: 4,
          switchId: "2",
        },
        {
          x: 8,
          y: 8,
          switchId: "1",
        },
        {
          x: 9,
          y: 1,
          switchId: "2",
        },
        {
          x: 9,
          y: 2,
          switchId: "2",
        },
        {
          x: 14,
          y: 4,
          switchId: "1",
        },
        {
          x: 14,
          y: 8,
          switchId: "2",
        },
        {
          x: 15,
          y: 5,
          switchId: "1",
        },
        {
          x: 15,
          y: 7,
          switchId: "2",
        },
        {
          x: 18,
          y: 8,
          switchId: "2",
        },
      ],
    },
  ],
]);
