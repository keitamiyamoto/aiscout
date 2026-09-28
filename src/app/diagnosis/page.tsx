import { Suspense } from "react";
import { Header } from "@/components/Header";
import { FlowLoader } from "@/components/diagnosis/FlowLoader";

export const metadata = { title: "診断", robots: { index: false } };

export default function DiagnosisPage() {
  return (
    <>
      <Header right={<span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-700">約3分・無料</span>} />
      <Suspense>
        <FlowLoader />
      </Suspense>
    </>
  );
}
