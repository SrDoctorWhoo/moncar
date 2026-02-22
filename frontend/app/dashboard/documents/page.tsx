"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Document {
  id: string;
  tipo_documento: string;
  url: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  numero_documento?: string;
  data_validade?: string;
  observacao_admin?: string;
  createdAt: string;
}

interface DocumentConfig {
  tipo_documento: string;
  label: string;
  descricao: string;
  icone: string;
}

const DOC_TYPE_LABELS: Record<string, { label: string; descricao: string; icone: string }> = {
  RG_CNH: {
    label: "Documento da Mãe",
    descricao: "RG, CNH ou Passaporte",
    icone: "🪪",
  },
  CRIANCA: {
    label: "Documento da Criança",
    descricao: "Certidão ou RG do menor",
    icone: "⭐",
  },
  CNH_MOTORISTA: {
    label: "CNH Mãetorista",
    descricao: "CNH válida (obrigatório)",
    icone: "🚗",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Em Análise",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: "⏳",
  },
  APPROVED: {
    label: "Aprovado",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    icon: "✅",
  },
  REJECTED: {
    label: "Rejeitado",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
    icon: "❌",
  },
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [configs, setConfigs] = useState<DocumentConfig[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchConfigs();
      fetchDocuments();
    }
  }, [session]);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get(`/api/document-config`);
      setConfigs(res.data);
      if (res.data.length > 0 && !docType) {
        setDocType(res.data[0].tipo_documento);
      }
    } catch {
      console.error("Erro ao carregar configurações de documentos");
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/documents/my-documents`);
      setDocuments(res.data);
    } catch {
      console.error("Erro ao carregar documentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docType) return toast.error("Selecione o arquivo e o tipo de documento.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo_documento", docType);
    if (numeroDocumento) formData.append("numero_documento", numeroDocumento);
    if (dataValidade) formData.append("data_validade", dataValidade);

    try {
      await axios.post(`/api/documents/upload`, formData);
      toast.success("Documento enviado com sucesso!");
      setFile(null);
      setNumeroDocumento("");
      setDataValidade("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocuments();
    } catch {
      toast.error("Erro ao enviar o documento. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const approvedCount = documents.filter((d) => d.status === "APPROVED").length;
  const pendingCount = documents.filter((d) => d.status === "PENDING").length;
  const rejectedCount = documents.filter((d) => d.status === "REJECTED").length;
  const role = (session?.user as any)?.role;
  const verifiedStatus = (session?.user as any)?.verifiedStatus;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg shadow">
            📄
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meus Documentos</h1>
        </div>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xl">
          Para manter o Momcar seguro, verificamos a identidade de todas as mães. Envie os documentos
          listados abaixo para liberar o acesso completo à plataforma.
        </p>
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aprovados", count: approvedCount, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Em Análise", count: pendingCount, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Rejeitados", count: rejectedCount, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Card - Hidden if Verified */}
      {verifiedStatus !== "VERIFIED" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-base">Enviar Novo Documento</h2>
            <p className="text-xs text-slate-400 mt-0.5">Formatos aceitos: JPG, PNG, PDF · Tamanho máximo: 5 MB</p>
          </div>

          <form onSubmit={handleUpload} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tipo de Documento</label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((config) => (
                      <SelectItem key={config.tipo_documento} value={config.tipo_documento}>
                        <span className="flex items-center gap-2">{config.icone} {config.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Número do Documento (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 12.345.678-9"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Data de Validade (Opcional)</label>
                <input
                  type="date"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 
                flex flex-col items-center justify-center gap-3 py-12 px-6 text-center
                ${isDragging
                  ? "border-blue-400 bg-blue-50 scale-[1.01]"
                  : file
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50 shadow-inner"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf"
              />

              {file ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-3xl shadow-sm">
                    ✅
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors mt-2"
                  >
                    Remover documento
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl shadow-sm">
                    📂
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Arraste o arquivo aqui ou{" "}
                      <span className="text-blue-600">clique para buscar</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, PDF até 5 MB</p>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm
                ${isUploading || !file
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 active:scale-[0.98] shadow-blue-200"
                }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processando envio...
                </span>
              ) : (
                "Finalizar e Enviar para Análise"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-emerald-900">Sua conta está verificada!</h3>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              Todos os seus documentos obrigatórios foram aprovados. Caso algum documento expire no futuro,
              avisaremos você para realizar o novo envio aqui.
            </p>
          </div>
        </div>
      )}

      {/* Documents list */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Documentos Enviados</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-medium text-slate-600">Nenhum documento enviado ainda</p>
            <p className="text-xs text-slate-400 mt-1">Envie seus documentos acima para começar a verificação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.PENDING;
              const typeInfo = configs.find(c => c.tipo_documento === doc.tipo_documento) || DOC_TYPE_LABELS[doc.tipo_documento];
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                      {typeInfo?.icone ?? "📄"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {typeInfo?.label ?? doc.tipo_documento}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {typeInfo?.descricao} · Enviado em{" "}
                        {new Date(doc.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      {/* Document Details */}
                      {(doc.numero_documento || doc.data_validade) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {doc.numero_documento && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium">№ {doc.numero_documento}</span>
                            </div>
                          )}
                          {doc.data_validade && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="text-slate-400 italic">Expira em:</span>
                              <span className={`font-semibold ${new Date(doc.data_validade) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
                                {new Date(doc.data_validade).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
                        ${status.color} ${status.bg} ${status.border}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-${doc.status === "PENDING" ? "pulse" : "none"}`}
                      />
                      {status.label}
                    </div>
                  </div>

                  {/* Admin observation */}
                  {doc.observacao_admin && (
                    <div className="mx-5 mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5">
                      <p className="text-xs font-semibold text-red-600 mb-0.5">Observação do Administrador</p>
                      <p className="text-xs text-red-700">{doc.observacao_admin}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
        <span className="text-xl mt-0.5">ℹ️</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Como funciona a verificação?</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Nossa equipe analisa seus documentos em até 48h. Você receberá uma notificação assim que
            a análise for concluída. Documentos rejeitados podem ser reenviados.
          </p>
        </div>
      </div>
    </div>
  );
}
