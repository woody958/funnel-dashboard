"use client";

import { useRef, useState } from "react";
import { Download, Upload, CheckCircle2, AlertCircle, X, FileSpreadsheet } from "lucide-react";
import { useDashboard, type ImportData, type ImportSummaryRow, type ImportFunnelRow } from "@/context/DashboardContext";
import * as XLSX from "xlsx";

const SAMPLE_SUMMARY: ImportSummaryRow[] = [
  { groupLabel: "강의 유입 퍼널", kpiTitle: "광고 유입", value: "1,500회", change: 12, changeLabel: "전기 대비" },
  { groupLabel: "강의 유입 퍼널", kpiTitle: "랜딩 유지", value: "68%", change: -2, changeLabel: "전기 대비" },
  { groupLabel: "강의 유입 퍼널", kpiTitle: "강의 신청", value: "324명", change: 8, changeLabel: "전기 대비" },
  { groupLabel: "강의 유입 퍼널", kpiTitle: "오픈챗 유입", value: "280명", change: 5, changeLabel: "전기 대비" },
  { groupLabel: "강의 유입 퍼널", kpiTitle: "단톡방 인원", value: "265명", change: 3, changeLabel: "전기 대비" },
  { groupLabel: "강의 진행 퍼널", kpiTitle: "라이브 강의 참여", value: "76%", change: -2, changeLabel: "전기 대비" },
  { groupLabel: "강의 진행 퍼널", kpiTitle: "라이브 전환 단가", value: "₩1,389", change: -8, changeLabel: "전기 대비" },
  { groupLabel: "강의 진행 퍼널", kpiTitle: "강의 이탈률", value: "32%", change: -3, changeLabel: "전기 대비 개선" },
  { groupLabel: "강의 진행 퍼널", kpiTitle: "QnA 잔존 인원 (최종)", value: "186명", change: 2, changeLabel: "전기 대비" },
  { groupLabel: "유료 강의 퍼널", kpiTitle: "유료 전환 수", value: "75명", change: 3, changeLabel: "전기 대비" },
  { groupLabel: "유료 강의 퍼널", kpiTitle: "매출액", value: "₩3,680,000", change: 22.7, changeLabel: "전기 대비" },
  { groupLabel: "유료 강의 퍼널", kpiTitle: "ROAS", value: "818%", change: 15.5, changeLabel: "전기 대비" },
  { groupLabel: "유료 강의 퍼널", kpiTitle: "공헌이익", value: "₩2,230,000", change: 18, changeLabel: "전기 대비" },
];

const SAMPLE_FUNNEL: ImportFunnelRow[] = [
  { funnelLabel: "강의 기획 단계", kpiLabel: "커리큘럼 완성도", value: "85%", target: "100%", change: 12, changeLabel: "전주 대비" },
  { funnelLabel: "강의 기획 단계", kpiLabel: "강의 자료 제작", value: "7주차", target: "12주차", change: 8, changeLabel: "전주 대비" },
  { funnelLabel: "강의 기획 단계", kpiLabel: "강사 섭외 완료", value: "3명", target: "4명", change: 0, changeLabel: "" },
  { funnelLabel: "강의 기획 단계", kpiLabel: "예산 집행률", value: "60%", target: "80%", change: 5, changeLabel: "전주 대비" },
  { funnelLabel: "무료 강의 인원 모집", kpiLabel: "광고 유입", value: "1,500회", target: "2,000회", change: 12, changeLabel: "전기 대비" },
  { funnelLabel: "무료 강의 인원 모집", kpiLabel: "랜딩 유지", value: "68%", target: "75%", change: -2, changeLabel: "전기 대비" },
  { funnelLabel: "무료 강의 인원 모집", kpiLabel: "강의 신청", value: "324명", target: "300명", change: 8, changeLabel: "전기 대비" },
  { funnelLabel: "무료 강의 인원 모집", kpiLabel: "광고비 집행", value: "₩450,000", target: "₩500,000", change: 0, changeLabel: "예산 내 집행" },
  { funnelLabel: "모집 인원 단톡방 관리", kpiLabel: "오픈챗 유입", value: "280명", target: "300명", change: 5, changeLabel: "전기 대비" },
  { funnelLabel: "모집 인원 단톡방 관리", kpiLabel: "단톡방 인원", value: "265명", target: "280명", change: 3, changeLabel: "전기 대비" },
  { funnelLabel: "모집 인원 단톡방 관리", kpiLabel: "일일 활성 참여율", value: "62%", target: "70%", change: -2, changeLabel: "전주 대비" },
  { funnelLabel: "모집 인원 단톡방 관리", kpiLabel: "공지 열람율", value: "78%", target: "85%", change: 3, changeLabel: "전주 대비" },
  { funnelLabel: "무료 강의 진행", kpiLabel: "라이브 강의 참여", value: "76%", target: "80%", change: -2, changeLabel: "전주 대비" },
  { funnelLabel: "무료 강의 진행", kpiLabel: "라이브 전환 단가", value: "₩1,389", target: "₩1,200", change: -8, changeLabel: "전주 대비" },
  { funnelLabel: "무료 강의 진행", kpiLabel: "강의 이탈률", value: "32%", target: "25%", change: -3, changeLabel: "전주 대비 개선" },
  { funnelLabel: "무료 강의 진행", kpiLabel: "QnA 잔존 인원 (최종)", value: "186명", target: "200명", change: 2, changeLabel: "전주 대비" },
  { funnelLabel: "유료 강의 운영", kpiLabel: "유료 전환 수", value: "75명", target: "80명", change: 3, changeLabel: "전기 대비" },
  { funnelLabel: "유료 강의 운영", kpiLabel: "매출액", value: "₩3,680,000", target: "₩3,000,000", change: 22.7, changeLabel: "전기 대비" },
  { funnelLabel: "유료 강의 운영", kpiLabel: "ROAS", value: "818%", target: "700%", change: 15.5, changeLabel: "전기 대비" },
  { funnelLabel: "유료 강의 운영", kpiLabel: "공헌이익", value: "₩2,230,000", target: "₩2,000,000", change: 18, changeLabel: "전기 대비" },
];

function downloadSampleExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 종합_KPI
  const summaryHeader = ["그룹명", "KPI명", "값", "변화율(%)", "변화레이블"];
  const summaryRows = SAMPLE_SUMMARY.map((r) => [
    r.groupLabel, r.kpiTitle, r.value, r.change, r.changeLabel,
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
  ws1["!cols"] = [{ wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, "종합_KPI");

  // Sheet 2: 퍼널_KPI
  const funnelHeader = ["퍼널명", "KPI명", "현재값", "목표값", "변화율(%)", "변화레이블"];
  const funnelRows = SAMPLE_FUNNEL.map((r) => [
    r.funnelLabel, r.kpiLabel, r.value, r.target, r.change, r.changeLabel,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([funnelHeader, ...funnelRows]);
  ws2["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, "퍼널_KPI");

  XLSX.writeFile(wb, "KPI_샘플_템플릿.xlsx");
}

function downloadSampleCSV() {
  const summaryHeader = "그룹명,KPI명,값,변화율(%),변화레이블";
  const summaryRows = SAMPLE_SUMMARY.map((r) =>
    [r.groupLabel, r.kpiTitle, r.value, r.change, r.changeLabel].join(",")
  ).join("\n");

  const funnelHeader = "퍼널명,KPI명,현재값,목표값,변화율(%),변화레이블";
  const funnelRows = SAMPLE_FUNNEL.map((r) =>
    [r.funnelLabel, r.kpiLabel, r.value, r.target, r.change, r.changeLabel].join(",")
  ).join("\n");

  const content = `[종합_KPI]\n${summaryHeader}\n${summaryRows}\n\n[퍼널_KPI]\n${funnelHeader}\n${funnelRows}`;

  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "KPI_샘플_템플릿.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseExcelFile(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        let kpiSummary: ImportSummaryRow[] | undefined;
        let funnelKPIs: ImportFunnelRow[] | undefined;

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: "" });

          if (sheetName.includes("종합") || sheetName.includes("KPI_Summary")) {
            kpiSummary = rows
              .filter((r) => r["그룹명"] && r["KPI명"])
              .map((r) => ({
                groupLabel: String(r["그룹명"]),
                kpiTitle: String(r["KPI명"]),
                value: String(r["값"] ?? ""),
                change: Number(r["변화율(%)"] ?? 0),
                changeLabel: String(r["변화레이블"] ?? ""),
              }));
          } else if (sheetName.includes("퍼널") || sheetName.includes("Funnel")) {
            funnelKPIs = rows
              .filter((r) => r["퍼널명"] && r["KPI명"])
              .map((r) => ({
                funnelLabel: String(r["퍼널명"]),
                kpiLabel: String(r["KPI명"]),
                value: String(r["현재값"] ?? ""),
                target: String(r["목표값"] ?? ""),
                change: Number(r["변화율(%)"] ?? 0),
                changeLabel: String(r["변화레이블"] ?? ""),
              }));
          }
        }

        resolve({ kpiSummary, funnelKPIs });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseCSVFile(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string).replace(/^﻿/, "");
        const sections = text.split(/\n\s*\n/);

        let kpiSummary: ImportSummaryRow[] | undefined;
        let funnelKPIs: ImportFunnelRow[] | undefined;

        for (const section of sections) {
          const lines = section.trim().split("\n").filter((l) => l.trim());
          if (lines.length < 2) continue;

          const sectionTitle = lines[0];
          const headerLine = lines[1];
          const dataLines = lines.slice(2);

          if (!headerLine) continue;
          const headers = headerLine.split(",").map((h) => h.trim());

          if (sectionTitle.includes("종합") || headers.includes("그룹명")) {
            kpiSummary = dataLines
              .map((line) => {
                const cols = line.split(",");
                return {
                  groupLabel: cols[headers.indexOf("그룹명")]?.trim() ?? "",
                  kpiTitle: cols[headers.indexOf("KPI명")]?.trim() ?? "",
                  value: cols[headers.indexOf("값")]?.trim() ?? "",
                  change: Number(cols[headers.indexOf("변화율(%)")]?.trim() ?? 0),
                  changeLabel: cols[headers.indexOf("변화레이블")]?.trim() ?? "",
                };
              })
              .filter((r) => r.groupLabel && r.kpiTitle);
          } else if (sectionTitle.includes("퍼널") || headers.includes("퍼널명")) {
            funnelKPIs = dataLines
              .map((line) => {
                const cols = line.split(",");
                return {
                  funnelLabel: cols[headers.indexOf("퍼널명")]?.trim() ?? "",
                  kpiLabel: cols[headers.indexOf("KPI명")]?.trim() ?? "",
                  value: cols[headers.indexOf("현재값")]?.trim() ?? "",
                  target: cols[headers.indexOf("목표값")]?.trim() ?? "",
                  change: Number(cols[headers.indexOf("변화율(%)")]?.trim() ?? 0),
                  changeLabel: cols[headers.indexOf("변화레이블")]?.trim() ?? "",
                };
              })
              .filter((r) => r.funnelLabel && r.kpiLabel);
          }
        }

        resolve({ kpiSummary, funnelKPIs });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

export default function ImportExport() {
  const { importData } = useDashboard();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showDownload, setShowDownload] = useState(false);

  async function handleFile(file: File) {
    setStatus("loading");
    setMessage("");
    try {
      let data: ImportData;
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "xlsx" || ext === "xls") {
        data = await parseExcelFile(file);
      } else if (ext === "csv") {
        data = await parseCSVFile(file);
      } else {
        throw new Error("xlsx, xls, csv 파일만 지원합니다.");
      }

      const summaryCount = data.kpiSummary?.length ?? 0;
      const funnelCount = data.funnelKPIs?.length ?? 0;

      if (summaryCount === 0 && funnelCount === 0) {
        throw new Error("업데이트할 KPI 데이터를 찾을 수 없습니다. 샘플 파일 형식을 확인해 주세요.");
      }

      importData(data);
      setStatus("success");
      setMessage(`종합 KPI ${summaryCount}개, 퍼널 KPI ${funnelCount}개 업데이트 완료`);

      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "파일 처리 중 오류가 발생했습니다.");
      setTimeout(() => setStatus("idle"), 5000);
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status toast */}
      {status !== "idle" && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${
            status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : status === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-blue-200 bg-blue-50 text-blue-600"
          }`}
        >
          {status === "success" && <CheckCircle2 size={12} />}
          {status === "error" && <AlertCircle size={12} />}
          {status === "loading" && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          )}
          <span>{status === "loading" ? "처리 중..." : message}</span>
          <button onClick={() => setStatus("idle")} className="ml-1 opacity-60 hover:opacity-100">
            <X size={11} />
          </button>
        </div>
      )}

      {/* Sample download dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDownload((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Download size={12} />
          샘플 파일
        </button>

        {showDownload && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDownload(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => { downloadSampleExcel(); setShowDownload(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet size={13} className="text-emerald-500" />
                Excel (.xlsx) 다운로드
              </button>
              <button
                onClick={() => { downloadSampleCSV(); setShowDownload(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet size={13} className="text-blue-400" />
                CSV (.csv) 다운로드
              </button>
            </div>
          </>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={status === "loading"}
        className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        <Upload size={12} />
        파일 업로드
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
