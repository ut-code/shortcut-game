export type StageDefinition = string[];
export const stages = new Map<string, StageDefinition>([
  [
    "1",
    [
      "bbbbbbbbbbbbbbbbbb",
      "         b        ",
      "         b        ",
      "         b   bbbbb",
      "         m   bbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
  ],
  [
    "2",
    [
      "bbbbbbbbbbbbbbbbbb",
      "                  ",
      "                  ",
      "m            bbbbb",
      "bb           bbbbb",
      "bb     m     bbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
  ],
  [
    "3",
    [
      "bbbbbbbbbbbbbbbbbb",
      "   b              ",
      "   b     m     bbb",
      "   bm          bbb",
      "   bbb         bbb",
      "   mm          bbb",
      "bbbbbbbbbbb    bbb",
    ],
  ],
]);
