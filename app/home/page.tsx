"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  generateSlidesStream,
  type SlideRequest,
  type StructureChunk,
  type SlideContentChunk,
  type ContentChunk,
  type ApiErrorChunk,
  type SlideStructureItem,
} from "@/lib/slides-streaming-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutTemplate,
  FileText,
  Globe,
  Hash,
  GraduationCap,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  "Science",
  "Biology",
  "History",
  "Mathematics",
  "Geography",
  "Literature",
  "Art",
  "Technology",
  "Other",
];

const LOCALES = [
  { value: "pt_BR", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const GRADES = [
  "elementary",
  "middle school",
  "high school",
  "grade 5",
  "grade 6",
  "grade 7",
  "grade 8",
  "grade 9",
  "grade 10",
];

export default function HomePage() {
  const router = useRouter();
  const [category, setCategory] = useState("Science");
  const [description, setDescription] = useState("");
  const [locale, setLocale] = useState("pt_BR");
  const [slidesNumber, setSlidesNumber] = useState(8);
  const [grade, setGrade] = useState("high school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [structure, setStructure] = useState<SlideStructureItem[] | null>(null);
  const [slideContents, setSlideContents] = useState<SlideContentChunk[]>([]);
  const [finalContent, setFinalContent] = useState<ContentChunk | null>(null);
  const [streamStatus, setStreamStatus] = useState<string>("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setStructure(null);
      setSlideContents([]);
      setFinalContent(null);
      setStreamStatus("Iniciando geração...");
      setLoading(true);

      const body: SlideRequest = {
        category,
        description: description.trim(),
        locale,
        slidesNumber: Math.min(20, Math.max(3, slidesNumber)),
        grade: grade || undefined,
      };

      const aborter = new AbortController();

      try {
        await generateSlidesStream(
          body,
          {
            onStructure: (chunk: StructureChunk) => {
              setStreamStatus(chunk.message ?? "Estrutura recebida");
              if (chunk.slides_structure?.length) {
                setStructure(chunk.slides_structure);
              }
            },
            onSlideContent: (chunk: SlideContentChunk) => {
              setStreamStatus(
                chunk.message ?? `Slide ${chunk.slide_number} gerado`
              );
              setSlideContents((prev) => [...prev, chunk]);
            },
            onContent: (chunk: ContentChunk) => {
              setStreamStatus(chunk.message ?? "Concluído");
              setFinalContent(chunk);
            },
            onError: (chunk: ApiErrorChunk) => {
              setError(chunk.error ?? "Erro na geração");
              setStreamStatus("");
            },
          },
          { endpoint: "/slide/v3", signal: aborter.signal }
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Falha ao conectar à API";
        setError(msg);
        setStreamStatus("");
      } finally {
        setLoading(false);
      }
    },
    [category, description, locale, slidesNumber, grade]
  );

  const openInEditor = useCallback(() => {
    if (!finalContent) return;
    try {
      sessionStorage.setItem(
        "mais-docente-generated-slides",
        JSON.stringify(finalContent)
      );
      router.push("/editor-slides");
    } catch {
      // payload too large; fallback: apenas redireciona
      router.push("/editor-slides");
    }
  }, [finalContent, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </Link>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              Gerar apresentação
            </CardTitle>
            <CardDescription>
              Preencha o foco da apresentação e a Slides Streaming API gera os
              slides em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Categoria
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Foco da apresentação *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ex: O Sistema Solar e seus planetas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="locale"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Globe className="h-4 w-4" />
                    Idioma
                  </Label>
                  <select
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    disabled={loading}
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="slidesNumber"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Hash className="h-4 w-4" />
                    Número de slides (3–20)
                  </Label>
                  <Input
                    id="slidesNumber"
                    type="number"
                    min={3}
                    max={20}
                    value={slidesNumber}
                    onChange={(e) =>
                      setSlidesNumber(Number(e.target.value) || 8)
                    }
                    disabled={loading}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="grade"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <GraduationCap className="h-4 w-4" />
                  Nível (opcional)
                </Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {streamStatus || "Gerando..."}
                  </>
                ) : (
                  "Gerar apresentação"
                )}
              </Button>
            </form>

            {/* Resultado do stream */}
            {(structure?.length || slideContents.length || finalContent) && (
              <div className="mt-8 pt-6 border-t space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Resultado
                </h3>

                {structure?.length ? (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Estrutura ({structure.length} slides)
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {structure.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground shrink-0">
                            {s.slide_number}.
                          </span>
                          <span className="font-medium">{s.title}</span>
                          <span className="text-muted-foreground">
                            ({s.template})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {slideContents.length > 0 && !finalContent && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Slides recebidos: {slideContents.length}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {slideContents.map((c, i) => (
                        <li key={i}>
                          Slide {c.slide_number} – {c.template}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {finalContent && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-medium">
                      {finalContent.slides_generated} slides gerados
                    </p>
                    {finalContent.presentation_info?.title && (
                      <p className="text-sm text-muted-foreground">
                        Título: {finalContent.presentation_info.title}
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={openInEditor}
                      className="w-full sm:w-auto"
                    >
                      Abrir no editor
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
