import { Loader2 } from 'lucide-react';

const optionLetters = ['A', 'B', 'C', 'D'];

function getOptionStyle(index: number) {
  switch (index) {
    case 0:
      return {
        card: 'bg-[#EDF2FF] border-ds-blue-light',
        item: 'bg-ds-blue-normal',
      };
    case 1:
      return {
        card: 'bg-ds-success-light border-ds-green-normal',
        item: 'bg-ds-green-dark',
      };
    case 2:
      return {
        card: 'bg-[#FFF7E0] border-ds-yellow-normal',
        item: 'bg-ds-yellow-dark',
      };
    case 3:
      return {
        card: 'bg-[#FFEDE0] border-[#FA7942]',
        item: 'bg-[#FA7942]',
      };
    default:
      return {
        card: 'bg-[#EDF2FF] border-ds-blue-light',
        item: 'bg-ds-blue-normal',
      };
  }
}

export function SlideQuizOption({
  text,
  index,
  optionPlaceholder,
  onClick,
  studentView,
  disabled,
  isSubmitting,
  isSelected,
}: {
  text: string;
  index: number;
  optionPlaceholder: string;
  onClick?: () => void;
  studentView?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  isSelected?: boolean;
}) {
  const { card: cardStyle, item: itemStyle } = getOptionStyle(index);

  return (
    <div
      onClick={(e) => {
        if (onClick && !disabled) {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative z-[100] flex items-center rounded-lg border-2 w-full
        ${!studentView ? 'gap-8 py-6 px-8' : 'gap-6 py-4 px-6'}
        transition duration-300 ease-in-out
        ${cardStyle}
        ${onClick && !disabled && !isSelected ? 'cursor-pointer hover:scale-105' : ''}
        ${disabled ? 'opacity-50' : 'opacity-100'}`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center font-quicksand text-white font-bold ${!studentView ? 'text-[2rem]' : ''}`}
      >
        <div
          className={`absolute ${!studentView ? 'size-12' : 'size-8'} rounded-full ${itemStyle}`}
        />
        {!isSubmitting ? (
          <span className="z-10">{optionLetters[index]}</span>
        ) : (
          <Loader2 className="z-10 size-6 animate-spin" />
        )}
      </div>
      {text ? (
        <span
          className={`font-rubik text-ds-gray-900 ${!studentView ? 'text-[2rem] leading-[1.2]' : 'text-base leading-[1.4] sm:text-lg sm:leading-[1.3] md:text-xl md:leading-[1.3]'}`}
        >
          {text}
        </span>
      ) : (
        <span className="font-rubik text-ds-gray-400/80 text-[2rem]">
          {optionPlaceholder}
        </span>
      )}
    </div>
  );
}
