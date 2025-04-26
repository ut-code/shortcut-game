import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.ts";

const stages = new Map([
  ["stage-1", 1],
  ["stage-2", 2],
  ["stage-3", 3],
]);
export const load: PageServerLoad = ({ params }) => ({
  params: {
    stage: stages.get(params.stage) ?? error(404),
  },
});
