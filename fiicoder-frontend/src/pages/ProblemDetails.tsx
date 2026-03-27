import { Link, useParams } from "react-router-dom";
import { problemSummaries } from "./problemData";

export default function ProblemDetails() {
  const { problemId } = useParams();
  const id = Number(problemId);
  const problem = problemSummaries.find((item) => item.id === id);

  if (!problem) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-[#151221]/80 backdrop-blur-lg border border-pink-500/30 rounded-2xl card-glow">
        <h1 className="text-2xl font-bold text-pink-200 mb-2">Problem not found</h1>
        <div className="page-line" />
        <p className="text-pink-100/85 mb-4">This problem does not exist in the static list yet.</p>
        <Link to="/problems" className="text-sm font-semibold text-pink-200 underline underline-offset-4">
          Back to problems
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow">
      <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">Problem #{problem.id}</p>
      <h1 className="text-3xl font-bold text-pink-200 mb-2">{problem.title}</h1>
      <div className="page-line" />

      <p className="text-pink-100/85 leading-relaxed">{problem.statement}</p>

      <Link
        to="/problems"
        className="mt-5 inline-block text-sm font-semibold text-pink-200 underline decoration-pink-500/60 underline-offset-4"
      >
        Back to all problems
      </Link>
    </div>
  );
}
