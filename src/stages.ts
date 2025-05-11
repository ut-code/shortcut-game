export type StageDefinition = {
  stage: string[];
  initialPlayerX: number;
  initialPlayerY: number;
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
      initialPlayerY: 6,
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
        "...............bbb",
        "..............wbbb",
        "......m.w....w.bbb",
        ".....bbb...bbbbbbb",
        "...m.bbb...bbbbbbb",
        "...mm...s.........",
        "bbbbbbbbSbbbbbbbbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 7,
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
]);
