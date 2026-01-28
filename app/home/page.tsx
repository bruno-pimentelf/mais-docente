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
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  "Ciências",
  "Biologia",
  "História",
  "Matemática",
  "Geografia",
  "Literatura",
  "Arte",
  "Tecnologia",
  "Outro",
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

  const [streamStatus, setStreamStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setStreamStatus("Iniciando geração...");
      setProgress(0);
      const numSlides = Math.min(20, Math.max(3, slidesNumber));
      setLoading(true);

      const body: SlideRequest = {
        category,
        description: description.trim(),
        locale,
        slidesNumber: numSlides,
        grade: grade || undefined,
      };

      const aborter = new AbortController();
      let slideCount = 0;

      try {
        await generateSlidesStream(
          body,
          {
            onStructure: (chunk: StructureChunk) => {
              setStreamStatus(chunk.message ?? "Estrutura recebida");
              setProgress(5);
            },
            onSlideContent: (chunk: SlideContentChunk) => {
              slideCount += 1;
              setStreamStatus(
                chunk.message ?? `Slide ${chunk.slide_number} gerado`
              );
              setProgress(Math.min(95, (slideCount / numSlides) * 100));
            },
            onContent: (chunk: ContentChunk) => {
              setStreamStatus(chunk.message ?? "Concluído");
              setProgress(100);
              try {
                sessionStorage.setItem(
                  "mais-docente-generated-slides",
                  JSON.stringify(chunk)
                );
                router.push("/editor-slides");
              } catch {
                router.push("/editor-slides");
              }
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
    [category, description, locale, slidesNumber, grade, router]
  );

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

            {/* Loading bar durante a geração */}
            {loading && (
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{streamStatus || "Gerando..."}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
