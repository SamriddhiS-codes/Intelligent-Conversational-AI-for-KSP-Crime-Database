import { useWorkspace } from "../context/WorkspaceContext";
import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { SummaryCard } from "../components/workspace/SummaryCard";
import { ExplainabilityCard } from "../components/workspace/ExplainabilityCard";
import { RecordCard } from "../components/workspace/RecordCard";
import { StatisticsCard } from "../components/workspace/StatisticsCard";
import { TimelineCard } from "../components/workspace/TimelineCard";
import { HotspotMapCard } from "../components/workspace/HotspotMapCard";
import { CrimeNetworkCard } from "../components/workspace/CrimeNetworkCard";
import { DistrictBreakdownCard } from "../components/workspace/DistrictBreakdownCard";
import { PredictiveSignalCard } from "../components/workspace/PredictiveSignalCard";
import { ReportExportButton } from "../components/workspace/ReportExportButton";

const HOTSPOT_HINT = /hotspot|concentrat|highest.crime|most crime/i;
const NETWORK_HINT = /network|repeat offender|linked to|connection|associat/i;

export function WorkspacePage() {
  const { workspace, prompt, history } = useWorkspace();
  if (!workspace) return null;

  const { intent, summary, message, sql, results, row_count, askedAt, question } = workspace;
  const isRecordLike = results?.length && "fir_number" in results[0];
  const isAggregateLike = results?.length && !isRecordLike;

  const wantsHotspot = intent === "analytics" && HOTSPOT_HINT.test(question);
  const wantsNetwork = intent === "analytics" && NETWORK_HINT.test(question);
  const wantsPrediction = intent === "prediction";
  const wantsDistrictBreakdown = intent === "analytics" && !wantsHotspot && !wantsNetwork;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <WorkspaceHeader prompt={prompt || question} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2">
          <SummaryCard summary={summary || message} rowCount={row_count} delay={0} />
        </div>

        <div className="lg:col-span-2">
          <ExplainabilityCard sql={sql} intent={intent} askedAt={askedAt} delay={0.08} />
        </div>

        {isRecordLike && (
          <div className="lg:col-span-2">
            <p className="text-xs font-medium tracking-wide uppercase text-ink-muted mb-3">
              Matching Records
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 30).map((r, i) => (
                <RecordCard key={r.id || i} record={r} delay={0.03 * i} />
              ))}
            </div>
          </div>
        )}

        {isAggregateLike && (
          <div className="lg:col-span-2">
            <StatisticsCard rows={results} delay={0.12} />
          </div>
        )}

        {wantsHotspot && <HotspotMapCard delay={0.16} />}
        {wantsNetwork && <CrimeNetworkCard delay={0.16} />}
        {wantsPrediction && <PredictiveSignalCard delay={0.16} />}
        {wantsDistrictBreakdown && <DistrictBreakdownCard delay={0.16} />}
        {(intent === "analytics" || wantsPrediction) && <TimelineCard delay={0.2} />}
      </div>

      <div className="mt-10">
        <ReportExportButton conversation={history} queryResults={results} />
      </div>
    </div>
  );
}
