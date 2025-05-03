export type StageDefinition = {
  stage: string[];
  initialPlayerX: number;
  initialPlayerY: number;
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
      initialPlayerY: 1,
    },
  ],
  [
    "2",
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
      initialPlayerY: 1,
    },
  ],
  [
    "3",
    {
      stage: [
        "bbbbbbbbbbbbbbbbbb",
        "...b..............",
        "...b.....m.....bbb",
        "...bm..........bbb",
        "...bbb.........bbb",
        "...mm..........bbb",
        "bbbbbbbbbbb....bbb",
      ],
      initialPlayerX: 1,
      initialPlayerY: 1,
    },
  ],
]);
