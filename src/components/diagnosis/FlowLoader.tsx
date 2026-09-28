"use client";

import dynamic from "next/dynamic";

/** 回答の途中保存 (localStorage) を初期値に使うため、診断画面はブラウザでだけ描画する */
const DiagnosisFlow = dynamic(() => import("@/components/diagnosis/DiagnosisFlow"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="spinner" />
    </div>
  ),
});

export function FlowLoader() {
  return <DiagnosisFlow />;
}
