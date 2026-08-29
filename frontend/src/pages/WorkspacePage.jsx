import { useTranslation } from "react-i18next";
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
import { HeroSearch } from "../components/home/HeroSearch";
import { ChatHistorySidebar } from "../components/workspace/ChatHistorySidebar";
import { useRef, useEffect } from "react";

const HOTSPOT_HINT = /hotspot|concentrat|highest.crime|most crime/i;
const NETWORK_HINT = /network|repeat offender|linked to|connection|associat/i;

function MarkdownText({ text }) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </span>
  );
}

function QueryBlock({ entry }) {
  const { question, data } = entry;
  const { intent, summary, message, sql, results, row_count, askedAt } = data;

  const isRecordLike = results?.length && "fir_number" in results[0];
  const isAggregateLike = results?.length && !isRecordLike;
  const wantsHotspot = intent === "analytics" && HOTSPOT_HINT.test(question);
  const wantsNetwork = intent === "analytics" && NETWORK_HINT.test(question);
  const wantsPrediction = intent === "prediction";
  const wantsDistrictBreakdown = intent === "analytics" && !wantsHotspot && !wantsNetwork;

  const { t } = useTranslation();

  return (
    <div className="mb-10">
      <div className="flex justify-end mb-4">
        <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-xl text-sm font-medium shadow-sm">
          {question}
        </div>
      </div>

      <div className="flex justify-start">
        <div className="w-full max-w-5xl">
          <WorkspaceHeader prompt={question} askedAt={askedAt} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
            <div className="lg:col-span-2">
              <SummaryCard
                summary={<MarkdownText text={summary || message} />}
                rowCount={row_count}
                delay={0}
              />
            </div>
            <div className="lg:col-span-2">
              <ExplainabilityCard sql={sql} intent={intent} askedAt={askedAt} delay={0.08} />
            </div>
            {isRecordLike && (
              <div className="lg:col-span-2">
                <p className="text-xs font-medium tracking-wide uppercase text-ink-muted mb-3">
                  {t("workspace.matchingRecords")}
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
        </div>
      </div>
    </div>
  );
}

export function WorkspacePage() {
  const { t } = useTranslation();
  const { chatEntries, loading, error, ask, history, workspace } = useWorkspace();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatEntries, loading]);

    return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatHistorySidebar />
      <div className="flex flex-col h-full flex-1">
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Empty state */}
        {!chatEntries?.length && !loading && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <p className="text-2xl font-semibold text-ink mb-2">{t("workspace.emptyTitle")}</p>
            <p className="text-ink-muted text-sm mb-1">{t("workspace.emptySubtitle")}</p>
            <p className="text-ink-muted text-xs">{t("workspace.supportsLanguages")}</p>
          </div>
        )}

        {chatEntries?.map((entry, i) => (
          <QueryBlock key={i} entry={entry} />
        ))}

        {loading && (
          <div className="flex justify-start mb-6">
            <div className="bg-card border border-border rounded-2xl px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
              <span className="ml-2">{t("workspace.analyzing")}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {chatEntries?.length > 0 && (
        <div className="px-6 max-w-5xl mx-auto w-full mb-2">
          <ReportExportButton conversation={history} queryResults={workspace?.results} />
        </div>
      )}

      <div className="sticky bottom-0 bg-bg-primary/90 backdrop-blur border-t border-border px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <HeroSearch compact onSubmit={ask} />
        </div>
      </div>
      </div>
    </div>
  );
}