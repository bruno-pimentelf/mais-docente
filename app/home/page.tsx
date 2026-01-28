"use client";

import { useState, useCallback, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, useInView, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ArrowBigLeft, Sparkles, Wand2 } from 'lucide-react';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, margin: "-50px" });

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
    <div className="min-h-screen bg-background">
      {/* Background gradient with animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <motion.div
          className="absolute top-1/4 left-[10%] size-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-[10%] size-80 rounded-full bg-primary/5 blur-3xl"
          animate={{ y: [0, -25, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex justify-start items-center gap-2 transition-colors"
          >
            ← Voltar
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Image section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden lg:block lg:col-span-1 sticky top-8"
          >
            <div className="relative w-full aspect-square">
              <Image
                src="/images/home/slide-presentation.svg"
                alt="Apresentação de slides"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

        <motion.div
          ref={formRef}
          initial={{ opacity: 0, filter: "blur(20px)", y: 50 }}
          animate={
            isInView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(20px)", y: 50 }
          }
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:col-span-2"
        >
          <Card className="border border-border bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg blur-xl opacity-50" />
            
            <CardHeader className="relative bg-muted/30 border-b border-border">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="size-12 rounded-xl bg-primary/10 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Wand2 className="h-6 w-6 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Gerar apresentação
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Preencha o foco da apresentação e a IA gera os slides em tempo real.
                  </CardDescription>
                </div>
              </motion.div>
            </CardHeader>
            <CardContent className="relative pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 text-destructive text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <motion.div
                    animate={focusedField === "category" ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="h-4 w-4 text-primary" />
                  </motion.div>
                  Categoria
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={loading}
                >
                  <SelectTrigger
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField(null)}
                    className="h-11 w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:bg-muted/50"
                  >
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/10 p-1">
                    {CATEGORIES.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-all hover:bg-muted/50 py-2.5"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <motion.div
                    animate={focusedField === "description" ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="h-4 w-4 text-primary" />
                  </motion.div>
                  Foco da apresentação *
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  className="relative"
                >
                  <Textarea
                    id="description"
                    placeholder="Ex: O Sistema Solar e seus planetas"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                    rows={4}
                    className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all dark:bg-muted/50"
                  />
                  {description && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-1 right-2 text-xs text-muted-foreground"
                    >
                      {description.length} caracteres
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="locale"
                    className="flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <motion.div
                      animate={focusedField === "locale" ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      <Globe className="h-4 w-4 text-primary" />
                    </motion.div>
                    Idioma
                  </Label>
                  <Select
                    value={locale}
                    onValueChange={setLocale}
                    disabled={loading}
                  >
                    <SelectTrigger
                      onFocus={() => setFocusedField("locale")}
                      onBlur={() => setFocusedField(null)}
                      className="h-11 w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:bg-muted/50"
                    >
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/10 p-1">
                      {LOCALES.map((l) => (
                        <SelectItem
                          key={l.value}
                          value={l.value}
                          className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-all hover:bg-muted/50 py-2.5"
                        >
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="slidesNumber"
                    className="flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <motion.div
                      animate={focusedField === "slidesNumber" ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Hash className="h-4 w-4 text-primary" />
                    </motion.div>
                    Número de slides (3–20)
                  </Label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      id="slidesNumber"
                      type="number"
                      min={3}
                      max={20}
                      value={slidesNumber}
                      onChange={(e) =>
                        setSlidesNumber(Number(e.target.value) || 8)
                      }
                      onFocus={() => setFocusedField("slidesNumber")}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      className="h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all dark:bg-muted/50"
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="space-y-2 lg:col-span-3"
              >
                <Label
                  htmlFor="grade"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <motion.div
                    animate={focusedField === "grade" ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </motion.div>
                  Nível (opcional)
                </Label>
                <Select
                  value={grade}
                  onValueChange={setGrade}
                  disabled={loading}
                >
                  <SelectTrigger
                    onFocus={() => setFocusedField("grade")}
                    onBlur={() => setFocusedField(null)}
                    className="h-11 w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:bg-muted/50"
                  >
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/10 p-1">
                    {GRADES.map((g) => (
                      <SelectItem
                        key={g}
                        value={g}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-all hover:bg-muted/50 py-2.5"
                      >
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="pt-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading || !description.trim()}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="group relative w-full h-12 text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary"
                    animate={loading ? { x: ["-100%", "100%"] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                        <span>Abrindo editor...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        <span>Gerar apresentação</span>
                        <motion.div
                          className="flex gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <span className="text-xs">✨</span>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
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
        </motion.div>
        </div>
      </div>
    </div>
  );
}
