"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import {
  Sparkles,
  QrCode,
  Palette,
  ArrowRight,
  Check,
  Type,
  ImageIcon,
  Table,
  Smartphone,
  Globe,
  Undo2,
  Redo2,
  RectangleHorizontal,
  Circle,
  Minus,
  Video,
  Users,
  Wand2,
  Play,
  Zap,
  MousePointer2,
} from "lucide-react";

// Animated counter
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Section with scroll-triggered blur animation
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, filter: "blur(20px)", y: 50 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(20px)", y: 50 }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Floating badge component
function FloatingBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium ${className}`}
    >
      {children}
    </motion.div>
  );
}

function EditorToolbar() {
  const tools = [
    { id: "undo", icon: Undo2, label: "Desfazer" },
    { id: "redo", icon: Redo2, label: "Refazer" },
    { id: "sep1", separator: true },
    { id: "palette", icon: Palette, label: "Temas" },
    { id: "sep2", separator: true },
    { id: "type", icon: Type, label: "Texto" },
    { id: "rect", icon: RectangleHorizontal, label: "Retângulo" },
    { id: "circle", icon: Circle, label: "Círculo" },
    { id: "line", icon: Minus, label: "Linha" },
    { id: "image", icon: ImageIcon, label: "Imagem" },
    { id: "table", icon: Table, label: "Tabela" },
    { id: "video", icon: Video, label: "Vídeo" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="inline-flex items-center gap-1.5 rounded-2xl bg-card/80 backdrop-blur-xl px-4 py-3 border border-border shadow-lg shadow-black/5"
    >
      {tools.map((tool) =>
        tool.separator ? (
          <div key={tool.id} className="w-px h-6 bg-border mx-1.5" />
        ) : (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="relative size-10 rounded-xl flex items-center justify-center cursor-pointer text-muted-foreground hover:text-primary transition-colors"
              >
                {tool.icon && <tool.icon className="size-5" strokeWidth={1.8} />}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {tool.label}
            </TooltipContent>
          </Tooltip>
        )
      )}
    </motion.div>
  );
}

function LiveSlideDemo() {
  const [phase, setPhase] = useState<"idle" | "typing" | "done">("idle");
  const [text, setText] = useState({ title: "", subtitle: "", items: [] as string[] });
  const [showMagic, setShowMagic] = useState(false);
  const demoRef = useRef(null);
  const isInView = useInView(demoRef, { once: true, margin: "-100px" });

  const content = {
    title: "Fotossíntese",
    subtitle: "O processo que alimenta a vida na Terra",
    items: ["Absorção de luz solar", "Conversão de CO₂", "Produção de oxigênio", "Armazenamento de energia"],
  };

  const generate = () => {
    if (phase === "typing") return;
    setPhase("typing");
    setText({ title: "", subtitle: "", items: [] });
    setShowMagic(true);

    setTimeout(() => {
      setShowMagic(false);
      let i = 0;
      const typeTitle = setInterval(() => {
        if (i <= content.title.length) {
          setText((p) => ({ ...p, title: content.title.slice(0, i) }));
          i++;
        } else {
          clearInterval(typeTitle);
          let j = 0;
          const typeSub = setInterval(() => {
            if (j <= content.subtitle.length) {
              setText((p) => ({ ...p, subtitle: content.subtitle.slice(0, j) }));
              j++;
            } else {
              clearInterval(typeSub);
              let k = 0;
              const addItems = setInterval(() => {
                if (k < content.items.length) {
                  const currentIndex = k;
                  setText((p) => ({ ...p, items: [...p.items, content.items[currentIndex]] }));
                  k++;
                } else {
                  clearInterval(addItems);
                  setPhase("done");
                }
              }, 250);
            }
          }, 20);
        }
      }, 40);
    }, 1000);
  };

  return (
    <div ref={demoRef} className="relative w-full max-w-4xl mx-auto">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-2xl opacity-50" />

      <motion.div
        className="relative aspect-[16/10] rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-black/10"
        initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(20px)" }}
        animate={
          isInView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 30, scale: 0.95, filter: "blur(20px)" }
        }
        transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {showMagic && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-card/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-5">
              <div className="relative size-20">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full bg-primary/40"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="size-10 text-primary" />
                </motion.div>
              </div>
              <motion.p
                className="text-base font-medium text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                A IA está criando seu slide...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 inset-x-0 h-1 bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={phase === "typing" ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 4 }}
        />

        {/* Shimmer */}
        {phase === "typing" && !showMagic && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative p-8 md:p-12 h-full flex flex-col z-10">
          <motion.div
            className="mb-2 text-xs font-semibold text-primary tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "idle" ? 1 : 0.3 }}
          >
            Biologia
          </motion.div>

          <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-3 min-h-[1.2em]">
            {text.title || <span className="text-muted-foreground/20">Título do slide</span>}
            {phase === "typing" && !showMagic && text.subtitle === "" && text.title.length > 0 && (
              <motion.span
                className="inline-block w-1 h-10 bg-primary ml-2 rounded-full"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </h3>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 min-h-[1.5em]">
            {text.subtitle || <span className="text-muted-foreground/15">Subtítulo descritivo</span>}
            {phase === "typing" && !showMagic && text.items.length === 0 && text.subtitle.length > 0 && (
              <motion.span
                className="inline-block w-0.5 h-6 bg-primary ml-1 rounded-full"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </p>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {text.items.map((item, idx) => (
              <motion.div
                key={`item-${idx}-${item}`}
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm"
              >
                <motion.div
                  className="size-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <span className="text-primary font-bold">{idx + 1}</span>
                </motion.div>
                <span className="text-base font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
            {text.items.length === 0 && phase === "idle" && (
              <>
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border/30"
                  >
                    <div className="size-10 rounded-xl bg-muted/30" />
                    <div className="h-4 rounded-lg bg-muted/30 flex-1" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Generate button */}
      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0, y: 20, filter: "blur(20px)" }}
        animate={
          isInView
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 20, filter: "blur(20px)" }
        }
        transition={{ delay: 0.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.button
          onClick={generate}
          disabled={phase === "typing"}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative cursor-pointer disabled:cursor-not-allowed"
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative flex items-center gap-3 px-10 py-5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-xl">
            {phase === "typing" ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="size-6" />
                </motion.div>
                <span>Criando...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wand2 className="size-6" />
                </motion.div>
                <span>{phase === "done" ? "Gerar outro" : "Gerar com IA"}</span>
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-primary-foreground/50"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}

function QuizInteractive() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([0, 0, 0, 0]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [votingPhase, setVotingPhase] = useState<"idle" | "initial" | "growing" | "stable">("idle");

  const options = [
    { label: "Cloroplasto", correct: true },
    { label: "Mitocôndria", correct: false },
    { label: "Ribossomo", correct: false },
    { label: "Núcleo", correct: false },
  ];

  useEffect(() => {
    if (votingPhase === "idle") return;

    if (votingPhase === "initial") {
      const timer = setTimeout(() => {
        setTotalVoters(3);
        setResults([2, 1, 0, 0]);
        setVotingPhase("growing");
      }, 300);
      return () => clearTimeout(timer);
    }

    if (votingPhase === "growing") {
      let step = 0;
      const growInterval = setInterval(() => {
        step++;
        const voters = 3 + step * 4;
        setTotalVoters(voters);
        const progress = Math.min(step / 8, 1);
        setResults([
          Math.round(2 + progress * 18),
          Math.round(1 + progress * 10),
          Math.round(progress * 5),
          Math.round(progress * 3),
        ]);
        if (step >= 8) {
          clearInterval(growInterval);
          setRevealed(true);
          setVotingPhase("stable");
        }
      }, 200);
      return () => clearInterval(growInterval);
    }

    if (votingPhase === "stable") {
      const fluctuateInterval = setInterval(() => {
        setTotalVoters((prev) => prev + Math.floor(Math.random() * 3));
        setResults((prev) => prev.map((val) => val + (Math.random() > 0.5 ? 1 : 0)));
      }, 1200);
      return () => clearInterval(fluctuateInterval);
    }
  }, [votingPhase]);

  const pick = (i: number) => {
    if (revealed || votingPhase !== "idle") return;
    setSelected(i);
    setVotingPhase("initial");
  };

  const reset = () => {
    setSelected(null);
    setRevealed(false);
    setResults([0, 0, 0, 0]);
    setTotalVoters(0);
    setVotingPhase("idle");
  };

  const total = results.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-card border border-border p-6 shadow-xl shadow-black/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="size-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Quiz ao vivo
            </span>
          </div>
          {votingPhase !== "idle" && (
            <motion.div
              className="flex items-center gap-2 text-sm text-green-500 font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.span
                className="size-2.5 rounded-full bg-green-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {totalVoters} online
            </motion.div>
          )}
        </div>

        <h4 className="text-xl font-bold text-foreground mb-6">
          Onde ocorre a fotossíntese?
        </h4>

        <div className="space-y-3">
          {options.map((opt, i) => {
            const pct = total > 0 ? Math.round((results[i] / total) * 100) : 0;
            const isCorrect = revealed && opt.correct;
            const isWrong = revealed && selected === i && !opt.correct;

            return (
              <motion.button
                key={i}
                onClick={() => pick(i)}
                disabled={votingPhase !== "idle"}
                whileHover={votingPhase === "idle" ? { scale: 1.02, x: 4 } : {}}
                whileTap={votingPhase === "idle" ? { scale: 0.98 } : {}}
                className={`relative w-full text-left rounded-xl border-2 p-4 transition-all overflow-hidden cursor-pointer disabled:cursor-default ${
                  isCorrect
                    ? "border-green-500 bg-green-500/10"
                    : isWrong
                    ? "border-red-500 bg-red-500/10"
                    : selected === i
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {total > 0 && (
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${isCorrect ? "bg-green-500/20" : "bg-muted/60"}`}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : isWrong
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCorrect ? <Check className="size-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-semibold text-foreground">{opt.label}</span>
                  </div>
                  {total > 0 && (
                    <motion.span
                      key={pct}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="text-base font-bold text-muted-foreground tabular-nums"
                    >
                      {pct}%
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
          {votingPhase !== "idle" ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="size-4" />
                <span className="tabular-nums font-medium">{total}</span> respostas
              </span>
              <button onClick={reset} className="text-sm font-semibold text-primary hover:underline cursor-pointer">
                Reiniciar
              </button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Smartphone className="size-4" />
              Clique para simular
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CollabDemo() {
  const [userName, setUserName] = useState("Você");
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = userName.trim() || "Você";

  const [positions, setPositions] = useState([
    { id: 1, x: 25, y: 35, name: "Ana", hue: 220 },
    { id: 2, x: 68, y: 55, name: "Carlos", hue: 150 },
    { id: 3, x: 45, y: 70, name: "Maria", hue: 340 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          x: Math.min(85, Math.max(15, p.x + (Math.random() - 0.5) * 15)),
          y: Math.min(85, Math.max(15, p.y + (Math.random() - 0.5) * 15)),
        }))
      );
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.min(95, Math.max(5, x)), y: Math.min(95, Math.max(5, y)) });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Name input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <span className="text-sm text-muted-foreground">Digite seu nome:</span>
        <div className="relative">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-36 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-border bg-card text-foreground text-center focus:outline-none focus:border-primary transition-colors"
            placeholder="Você"
          />
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 size-3 rounded-full"
            style={{ backgroundColor: "hsl(280, 70%, 50%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Collaboration area */}
      <motion.div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative w-full aspect-video rounded-2xl bg-card border border-border overflow-hidden cursor-none shadow-2xl shadow-black/10"
      >
        {/* Slide skeleton */}
        <div className="p-8 md:p-10 pointer-events-none">
          <div className="h-7 w-2/5 rounded-lg bg-muted/50 mb-4" />
          <div className="h-4 w-3/4 rounded bg-muted/30 mb-2" />
          <div className="h-4 w-1/2 rounded bg-muted/30 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/3] rounded-xl bg-muted/20" />
            ))}
          </div>
        </div>

        {/* Cursors */}
        {positions.map((cursor) => (
          <motion.div
            key={cursor.id}
            className="absolute pointer-events-none z-10"
            animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
              <path d="M6 3L18 12L12 14L10 20L6 3Z" fill={`hsl(${cursor.hue}, 70%, 50%)`} />
            </svg>
            <span
              className="absolute top-5 left-4 text-xs font-semibold text-white px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ backgroundColor: `hsl(${cursor.hue}, 70%, 40%)` }}
            >
              {cursor.name}
            </span>
          </motion.div>
        ))}

        {/* User cursor */}
        {isHovering && (
          <motion.div
            className="absolute pointer-events-none z-20"
            animate={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
            transition={{ duration: 0.03 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
              <path d="M6 3L18 12L12 14L10 20L6 3Z" fill="hsl(280, 70%, 50%)" />
            </svg>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-5 left-4 text-xs font-semibold text-white px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ backgroundColor: "hsl(280, 70%, 40%)" }}
            >
              {displayName}
            </motion.span>
          </motion.div>
        )}

        {/* Share badge */}
        <motion.div
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full pointer-events-none"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Globe className="size-4" />
          aula.link/bio-7a
        </motion.div>

        {/* Hover hint */}
        {!isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/70 backdrop-blur-sm"
          >
            <MousePointer2 className="size-8 text-primary" />
            <span className="text-base font-medium text-muted-foreground">Mova o mouse aqui</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState(0);

  const themes = [
    { name: "Oceano", primary: "#0ea5e9", secondary: "#0f172a", accent: "#e0f2fe", bg: "#f8fafc" },
    { name: "Floresta", primary: "#22c55e", secondary: "#14532d", accent: "#dcfce7", bg: "#f0fdf4" },
    { name: "Pôr do sol", primary: "#f97316", secondary: "#7c2d12", accent: "#fff7ed", bg: "#fffbeb" },
    { name: "Lavanda", primary: "#a78bfa", secondary: "#4c1d95", accent: "#f5f3ff", bg: "#faf5ff" },
    { name: "Rosa", primary: "#ec4899", secondary: "#831843", accent: "#fce7f3", bg: "#fdf2f8" },
  ];

  const currentTheme = themes[activeTheme];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Theme preview */}
      <motion.div
        className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/10"
        style={{ backgroundColor: currentTheme.bg }}
        layout
      >
        {/* Simulated slide */}
        <div className="p-8 md:p-12 h-full flex flex-col">
          <motion.div
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: currentTheme.primary }}
            layout
          >
            Prévia do tema
          </motion.div>
          <motion.h3
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: currentTheme.secondary }}
            layout
          >
            Seu slide ficará assim
          </motion.h3>
          <motion.p
            className="text-lg mb-8"
            style={{ color: currentTheme.secondary, opacity: 0.7 }}
            layout
          >
            Personalize completamente a aparência dos seus materiais
          </motion.p>
          <div className="grid grid-cols-3 gap-4 flex-1">
            {[1, 2, 3].map((n) => (
              <motion.div
                key={n}
                className="rounded-xl"
                style={{ backgroundColor: currentTheme.accent }}
                layout
              />
            ))}
          </div>
        </div>

        {/* Accent bar */}
        <motion.div
          className="absolute top-0 inset-x-0 h-1.5"
          style={{ backgroundColor: currentTheme.primary }}
          layout
        />
      </motion.div>

      {/* Theme buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {themes.map((theme, i) => (
          <motion.button
            key={theme.name}
            onClick={() => setActiveTheme(i)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
              activeTheme === i
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex -space-x-1.5">
              <div
                className="size-6 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: theme.secondary }}
              />
              <div
                className="size-6 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="size-6 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: theme.accent }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground">{theme.name}</span>
            {activeTheme === i && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="size-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="size-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <motion.section
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-20"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        {/* Floating elements */}
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

        <div className="relative w-full max-w-6xl mx-auto">
          {/* Toolbar */}
          <div className="flex justify-center mb-10">
            <EditorToolbar />
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <FloatingBadge>
              <Sparkles className="size-4" />
              Potencializado por IA
            </FloatingBadge>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight mb-6">
              Slides que{" "}
              <span className="text-primary relative">
                ensinam
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <motion.path
                    d="M2 8 Q100 2 198 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                </motion.svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O editor mais inteligente para criar apresentações interativas.
              Gere conteúdo com IA, engaje com quizzes ao vivo.
            </p>
          </motion.div>

          {/* Live demo */}
          <LiveSlideDemo />
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-muted-foreground"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-xs font-medium uppercase tracking-widest">Explore</span>
            <ArrowRight className="size-4 rotate-90" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats */}
      <AnimatedSection className="py-20 px-4" delay={0}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: "+", label: "Professores ativos" },
              { value: 500000, suffix: "+", label: "Slides criados" },
              { value: 98, suffix: "%", label: "Satisfação" },
              { value: 50, suffix: "x", label: "Mais rápido" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Quiz section */}
      <AnimatedSection className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-semibold text-primary uppercase tracking-widest"
              >
                Engajamento Real
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6"
              >
                Pergunte.
                <br />
                Eles respondem ao vivo.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Crie quizzes dentro dos slides. Alunos escaneiam o QR code
                e respondem direto do celular. Você vê instantaneamente
                quem entendeu e onde estão as dúvidas.
              </motion.p>
              <motion.ul
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {[
                  "Sem instalar nenhum app",
                  "Estatísticas em tempo real",
                  "Funciona até offline",
                  "Exporta relatórios completos",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            <QuizInteractive />
          </div>
        </div>
      </AnimatedSection>

      {/* Collab section */}
      <AnimatedSection className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Colaboração
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4"
            >
              Todos juntos, em tempo real
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Compartilhe o link da aula e todos acompanham. Perfeito para
              aulas remotas, híbridas ou presenciais.
            </motion.p>
          </div>

          <CollabDemo />

          {/* Features below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { icon: Zap, text: "Sincronização instantânea" },
              { icon: Globe, text: "Qualquer dispositivo" },
              { icon: Users, text: "Sem cadastro para ver" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="size-5 text-primary" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Themes section */}
      <AnimatedSection className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Personalização
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4"
            >
              Seu estilo, seu jeito
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Clique nos temas abaixo e veja como seus slides podem ficar.
              Totalmente customizável.
            </motion.p>
          </div>

          <ThemeSelector />
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-3xl opacity-50" />

            <div className="relative bg-card border border-border rounded-3xl p-12 md:p-16 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Sparkles className="size-12 text-primary mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Comece agora mesmo
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                  Crie sua primeira apresentação interativa em menos de um minuto.
                  É grátis para começar.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/cadastro">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative cursor-pointer w-full sm:w-auto"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                      <div className="relative flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg">
                        Criar conta grátis
                        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  </Link>
                  <Link href="/editor-slides">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-10 py-4 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      Ver demonstração
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-foreground text-lg">Mais Docente</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Feito com carinho para quem ensina.
          </p>
        </div>
      </footer>
    </div>
  );
}
