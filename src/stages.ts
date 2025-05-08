export type StageDefinition = {
  stage: string[];
  initialPlayerX: number;
  initialPlayerY: number;
  blockGroups: {
    x: number;
    y: number;
    objectId: string;
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
    },
  ],
]);
