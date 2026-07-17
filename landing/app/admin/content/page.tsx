import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { Card, SectionTitle, EmptyState } from "@/components/admin/ui";
import { RankedBars } from "@/components/admin/charts";

export default async function AdminContentPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, data } = await adminPageContext(searchParams);

  if (!data.content) {
    return <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />;
  }

  const c = data.content;

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">{t.ct_note}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle title={`${t.ct_book} — ${t.ct_opens}`} />
          <RankedBars label={t.ct_opens} rows={c.slice(0, 8).map((b) => ({ name: b.bookName, value: b.opens }))} />
        </Card>
        <Card className="p-4">
          <SectionTitle title={`${t.ct_book} — ${t.ct_listens}`} />
          <RankedBars label={t.ct_listens} rows={[...c].sort((a, b) => b.listens - a.listens).slice(0, 8).map((b) => ({ name: b.bookName, value: b.listens }))} />
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-line bg-ivory text-left text-[11.5px] uppercase tracking-wide text-muted">
                <th className="px-3 py-2.5 font-medium">{t.ct_book}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t.ct_opens}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t.ct_completions}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t.ct_listens}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t.ct_saved}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t.ct_dropoff}</th>
              </tr>
            </thead>
            <tbody>
              {c.map((b) => (
                <tr key={b.bookId} className="border-b border-line/50 last:border-0 hover:bg-ivory/60">
                  <td className="px-3 py-2.5 font-medium text-ink">{b.bookName}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{b.opens.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{b.completions.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{b.listens.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{b.savedVerses.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-status-amber">{b.dropOffChapter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
