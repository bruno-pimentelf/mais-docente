'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ImageIcon, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import type { SlideInteractiveMultipleChoice } from '../../types';
import {
  SlideElementBaseTypes,
  SlideInteractiveElementsVariants,
  SlideVariants,
} from '../../types';
import { useShallow } from 'zustand/react/shallow';
import { v4 } from 'uuid';
import { slideEditorImageLoader } from '@/misc-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const OPTION_STYLES: Record<
  number,
  { card: string; badge: string; border: string }
> = {
  0: { card: 'bg-[#EDF2FF]', badge: 'bg-[#3255BF]', border: 'border-[#3255BF]/40' },
  1: { card: 'bg-[#E8F5E9]', badge: 'bg-[#2E7D32]', border: 'border-[#2E7D32]/40' },
  2: { card: 'bg-[#FFF8E1]', badge: 'bg-[#F9A825]', border: 'border-[#F9A825]/40' },
  3: { card: 'bg-[#FFEDE0]', badge: 'bg-[#FA7942]', border: 'border-[#FA7942]/40' },
};

function getOptionStyle(i: number) {
  return OPTION_STYLES[i] ?? OPTION_STYLES[0];
}

type TabId = 'editar' | 'respostas' | 'qrcode';

type QuizOptionsSidebarProps = {
  onClose?: () => void;
};

export default function QuizOptionsSidebar({ onClose }: QuizOptionsSidebarProps) {
  const closeSlideSidebar = useSlideEditorLayoutStore((s) => s.closeSlideSidebar);
  const activeTab = useSlideEditorLayoutStore((s) => s.quizSidebarActiveTab) as TabId;
  const setQuizSidebarActiveTab = useSlideEditorLayoutStore((s) => s.setQuizSidebarActiveTab);
  const qrUrl = useSlideEditorLayoutStore((s) => s.quizQrCodeUrl);
  const setQuizQrCodeUrl = useSlideEditorLayoutStore((s) => s.setQuizQrCodeUrl);
  const updateQuiz = useSlidePresentationEditorStore((s) => s.updateQuiz);
  const selectedSlideId = useSlidePresentationEditorStore((s) => s.selectedSlide);
  const selectedSlide = useSlidePresentationEditorStore(
    useShallow((s) => s.slides.find((slide) => slide.id === s.selectedSlide))
  );

  const firstElement = selectedSlide?.elements?.[0];
  const currentQuiz =
    selectedSlide?.variant === SlideVariants.INTERACTIVE_MULTIPLE_CHOICE &&
    firstElement?.type === SlideElementBaseTypes.INTERACTIVE &&
    firstElement?.subtype === SlideInteractiveElementsVariants.MULTIPLE_CHOICE
      ? (firstElement as SlideInteractiveMultipleChoice)
      : null;

  const alternatives = currentQuiz?.alternatives ?? [];
  const displayQrUrl = qrUrl.trim() || 'https://mais-docente.app';
  const [isImageDragOver, setIsImageDragOver] = useState(false);

  const setActiveTab = (id: TabId) => setQuizSidebarActiveTab(id);

  const handleClose = () => {
    onClose?.();
    closeSlideSidebar();
  };

  const handleQuestionChange = (value: string) => {
    if (!selectedSlideId || !currentQuiz) return;
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'question',
      value,
    });
  };

  const handleOptionChange = (optionId: string, text: string) => {
    if (!selectedSlideId || !currentQuiz) return;
    const updated = alternatives.map((alt) =>
      alt.id === optionId ? { ...alt, text } : alt
    );
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'alternatives',
      value: updated,
    });
  };

  const handleCorrectAnswerChange = (optionId: string) => {
    if (!selectedSlideId || !currentQuiz) return;
    const updated = alternatives.map((alt) => ({
      ...alt,
      isAnswer: alt.id === optionId,
    }));
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'alternatives',
      value: updated,
    });
  };

  const handleDeleteOption = (optionId: string) => {
    if (!selectedSlideId || !currentQuiz || alternatives.length <= 2) return;
    const updated = alternatives.filter((alt) => alt.id !== optionId);
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'alternatives',
      value: updated,
    });
  };

  const handleAddOption = () => {
    if (!selectedSlideId || !currentQuiz || alternatives.length >= 4) return;
    const updated = [
      ...alternatives,
      { id: v4(), text: '', isAnswer: false },
    ];
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'alternatives',
      value: updated,
    });
  };

  const processImageFile = async (file: File) => {
    if (!selectedSlideId || !currentQuiz) return;
    const formData = new FormData();
    formData.append('picture', file);
    try {
      const res = await fetch('/api/slide-editor/upload-picture', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) return;
      const data = await res.json();
      const src = typeof data === 'string' ? data : data?.url ?? data?.src;
      if (!src) return;
      const mediaUrl = slideEditorImageLoader({ src });
      if (mediaUrl) {
        updateQuiz({
          slideId: selectedSlideId,
          quizId: currentQuiz.id,
          attr: 'image',
          value: mediaUrl,
        });
      }
    } catch (err) {
      console.error('Quiz image upload:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) processImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) processImageFile(file);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragOver(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragOver(false);
  };

  const handleRemoveImage = () => {
    if (!selectedSlideId || !currentQuiz) return;
    updateQuiz({
      slideId: selectedSlideId,
      quizId: currentQuiz.id,
      attr: 'image',
      value: '',
    });
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'editar', label: 'Editar', icon: <PencilIcon className="size-4" /> },
    {
      id: 'respostas',
      label: 'Ver respostas',
      icon: <ChartBarIcon className="size-4" />,
    },
    { id: 'qrcode', label: 'QR Code', icon: <QrCode className="size-4" /> },
  ];

  const sidebarShell = (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 z-40 flex h-screen w-[340px] flex-col rounded-l-2xl border border-l border-gray-200/80 bg-white shadow-xl"
      style={{ colorScheme: 'light' }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">Quiz</h2>
        <button
          type="button"
          onClick={handleClose}
          className="flex size-8 items-center justify-center rounded-lg transition-all hover:bg-gray-200 text-gray-500 hover:text-gray-700"
          aria-label="Fechar"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>

      {!currentQuiz ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12">
          <div className="rounded-full bg-gray-100 p-4">
            <ChartBarIcon className="size-10 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-500">
            Nenhum slide de quiz selecionado.
          </p>
          <p className="text-center text-xs text-gray-400">
            Selecione um slide de múltipla escolha para editar.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 border-b border-gray-100 bg-gray-50/50 px-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb transparent',
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'editar' && (
                <motion.div
                  key="editar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pergunta
                    </label>
                    <Input
                      value={currentQuiz.question ?? ''}
                      onChange={(e) => handleQuestionChange(e.target.value)}
                      placeholder="Digite a pergunta..."
                      className="rounded-xl border-gray-200 bg-white py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Imagem (opcional)
                    </label>
                    {currentQuiz.image ? (
                      <div className="relative overflow-hidden rounded-xl border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentQuiz.image}
                          alt="Quiz"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                          title="Remover imagem"
                        >
                          <XMarkIcon className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={cn(
                          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors',
                          'border-gray-200 bg-gray-50/80 hover:border-blue-300 hover:bg-blue-50/50',
                          isImageDragOver && 'border-blue-400 bg-blue-50'
                        )}
                        onDrop={handleImageDrop}
                        onDragOver={handleImageDragOver}
                        onDragLeave={handleImageDragLeave}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                          <ImageIcon className="size-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          Adicionar imagem
                        </span>
                        <span className="text-xs text-gray-400">
                          Clique ou arraste aqui
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Opções
                    </label>
                    <div className="flex flex-col gap-2">
                      {alternatives.map((alt, i) => {
                        const style = getOptionStyle(i);
                        const isCorrect = alt.isAnswer;
                        return (
                          <div
                            key={alt.id}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border-2 py-2 pr-2 pl-3 transition-colors',
                              style.card,
                              isCorrect ? style.border : 'border-transparent'
                            )}
                          >
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={isCorrect}
                              onChange={() => handleCorrectAnswerChange(alt.id)}
                              className="size-4 shrink-0 cursor-pointer accent-blue-600"
                            />
                            <div
                              className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                style.badge
                              )}
                            >
                              {OPTION_LETTERS[i]}
                            </div>
                            <Input
                              value={alt.text}
                              onChange={(e) =>
                                handleOptionChange(alt.id, e.target.value)
                              }
                              placeholder={`Opção ${OPTION_LETTERS[i]}`}
                              className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm shadow-none focus-visible:ring-0"
                            />
                            {alternatives.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(alt.id)}
                                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600"
                                title="Remover opção"
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {alternatives.length < 4 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddOption}
                        className="w-fit gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <PlusCircleIcon className="size-4" />
                        Adicionar opção
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'respostas' && (
                <motion.div
                  key="respostas"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="rounded-xl bg-gray-50 px-3 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {currentQuiz.question?.trim() || 'Pergunta'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Resposta correta
                    </p>
                    {alternatives.map((opt, i) => {
                      const style = getOptionStyle(i);
                      const isCorrect = opt.isAnswer;
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border-2 py-3 px-4',
                            style.card,
                            isCorrect
                              ? 'border-green-400 ring-1 ring-green-200'
                              : 'border-transparent opacity-70'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                              style.badge
                            )}
                          >
                            {OPTION_LETTERS[i] ?? ''}
                          </div>
                          <span
                            className={cn(
                              'flex-1 text-sm',
                              isCorrect
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-600'
                            )}
                          >
                            {opt.text || '—'}
                          </span>
                          {isCorrect && (
                            <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              <CheckCircleIcon className="size-4" />
                              Correta
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'qrcode' && (
                <motion.div
                  key="qrcode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      URL do QR Code
                    </label>
                    <Input
                      value={qrUrl}
                      onChange={(e) => setQuizQrCodeUrl(e.target.value)}
                      placeholder="https://exemplo.com/quiz"
                      className="rounded-xl border-gray-200 py-2.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
                    <QRCodeSVG
                      value={displayQrUrl}
                      size={200}
                      level="M"
                      marginSize={1}
                      bgColor="#ffffff"
                      fgColor="#111827"
                      className="rounded-xl"
                    />
                    <p className="text-center text-xs text-gray-500">
                      Escaneie para acessar o link
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.aside>
  );

  return sidebarShell;
}
