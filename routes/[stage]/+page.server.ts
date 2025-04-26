const stages = ["stage-1", "stage-2", "stage-3"];

export const entries = () =>
  stages.map((stage) => ({
    stage: stage,
  }));
export const load = ({ params }) => ({
  params: {
    stage: params.stage,
  },
});
