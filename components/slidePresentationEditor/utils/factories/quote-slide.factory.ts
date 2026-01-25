import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  getColoredFillSvg,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IQuoteSlideFactory } from './slide-factory.interface';

const leftQuoteSvg = `<svg width="895" height="525" viewBox="0 0 895 525" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M-145 380.429C-145 320.96 -129.195 262.365 -97.5854 204.645C-64.2195 146.924 -22.0732 98.8241 28.8537 60.344C81.5366 20.1147 136.854 0 194.805 0C214.122 0 234.317 7.87096 255.39 23.6129C278.22 39.3548 289.634 66.4658 289.634 104.946C289.634 143.426 276.463 167.039 250.122 175.785C225.537 184.53 204.463 193.276 186.902 202.021C164.073 214.265 145.634 229.132 131.585 246.623C119.293 262.365 113.146 282.48 113.146 306.967C113.146 324.458 121.927 341.075 139.488 356.817C158.805 372.559 183.39 380.429 213.244 380.429C223.781 380.429 236.073 379.555 250.122 377.806C264.171 374.308 276.463 369.06 287 362.064C306.317 369.06 322.122 379.555 334.415 393.548C346.707 407.541 352.854 429.404 352.854 459.139C352.854 513.361 327.39 560.587 276.463 600.816C227.293 639.297 169.341 658.537 102.61 658.537C27.0976 658.537 -33.4878 633.175 -79.1463 582.451C-123.049 531.727 -145 464.386 -145 380.429ZM397.146 380.429C397.146 320.96 412.951 262.365 444.561 204.645C477.927 146.924 520.073 98.8241 571 60.344C623.683 20.1147 679 0 736.951 0C756.268 0 776.463 7.87096 797.537 23.6129C820.366 39.3548 831.781 66.4658 831.781 104.946C831.781 143.426 818.61 167.039 792.268 175.785C767.683 184.53 746.61 193.276 729.049 202.021C706.219 214.265 687.781 229.132 673.732 246.623C661.439 262.365 655.293 282.48 655.293 306.967C655.293 324.458 664.073 341.075 681.634 356.817C700.951 372.559 725.537 380.429 755.39 380.429C765.927 380.429 778.22 379.555 792.268 377.806C806.317 374.308 818.61 369.06 829.146 362.064C848.463 369.06 864.268 379.555 876.561 393.548C888.854 407.541 895 429.404 895 459.139C895 513.361 869.537 560.587 818.61 600.816C769.439 639.297 711.488 658.537 644.756 658.537C569.244 658.537 508.659 633.175 463 582.451C419.098 531.727 397.146 464.386 397.146 380.429Z"
    fill="#000000"
  />
</svg>
`;

export class QuoteSlideFactory implements IQuoteSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    quote_text: string,
    author: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    const maxQuoteWidth = 1186;
    const quoteX = 598;

    const authorTextHtml = `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic;">- ${processMarkdownFormatting(author)}</span>`;

    const authorHeight = getTextHeight({
      text: authorTextHtml,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: maxQuoteWidth,
    });

    const quoteTextHtml = `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-weight: bold;">"${processMarkdownFormatting(quote_text)}"</span>`;

    const quoteHeight = getTextHeight({
      text: quoteTextHtml,
      fontSize: 64,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: maxQuoteWidth,
    });

    const quoteY = 106 + quoteHeight;

    const quoteElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: quoteTextHtml,
      x: quoteX,
      y: quoteY,
      width: maxQuoteWidth,
      height: quoteHeight,
      options: { isVisible: true, label: 'Quote' },
      fontSize: 64,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    const authorY = quoteY + quoteHeight + 30;

    const authorElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: authorTextHtml,
      x: quoteX,
      y: authorY,
      width: maxQuoteWidth,
      height: authorHeight,
      options: { isVisible: true, label: 'Author' },
      fontSize: 36,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    const svgWithColor = getColoredFillSvg(
      leftQuoteSvg,
      this.colors.rectangleColor
    );

    const leftQuoteDecoration: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svgWithColor
      )}`,
      x: 0,
      y: 555,
      width: 895,
      height: 525,
      options: { isVisible: true, label: 'Left Quote Decoration' },
    };

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.QUOTE,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        leftQuoteDecoration,
        quoteElement,
        authorElement,
        logoImageElement,
      ],
    };
  }
}
