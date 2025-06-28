import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear trash table",
  { minutes: 10 },
  internal.files.clearTrash,
);

export default crons