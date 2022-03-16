import React from 'react';
import { css as cssCore, Global } from '@emotion/react';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { Range as RangeComponent, createSliderWithTooltip } from 'rc-slider';

type Props = {
  bgColors: string[];
  min: number;
  max: number;
  value?: number[];
  onChange?: (value: number[]) => void;
  onAfterChange?: (value?: number[]) => void;
  onMouseMove?: any;
  onMouseLeave?: any;
  tooltipAlwaysVisible?: boolean;
  isTooltipVisible?: boolean;
};

const RangeWithTooltip = createSliderWithTooltip(RangeComponent);

export const ColorScaleRange = ({
  bgColors,
  min,
  max,
  value = [min, max],
  onChange,
  onAfterChange,
  onMouseMove,
  onMouseLeave,
  tooltipAlwaysVisible = true,
  isTooltipVisible,
}: Props) => {
  const isHorizontal = true;
  const theme = useTheme2();
  const styles = getStyles(theme, isHorizontal, false, bgColors, isTooltipVisible);

  return (
    <div className={cx(styles.container, styles.slider)} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <Global styles={styles.tooltip} />
      <RangeWithTooltip
        tipProps={{
          visible: tooltipAlwaysVisible,
          placement: isHorizontal ? 'top' : 'right',
        }}
        min={min}
        max={max}
        defaultValue={value}
        reverse={false}
        onChange={onChange}
        onAfterChange={onAfterChange}
        tabIndex={[0, 1]}
        allowCross={false}
      />
    </div>
  );
};

const getStyles = (
  theme: GrafanaTheme2,
  isHorizontal: boolean,
  hasMarks = false,
  colors: string[],
  isTooltipVisible: boolean
) => {
  const { spacing } = theme;
  const railColor = theme.colors.border.strong;

  return {
    container: css`
      width: 100%;
      max-width: 300px;
      margin: ${isHorizontal ? 'inherit' : `${spacing(1, 3, 1, 1)}`};
      padding-bottom: ${isHorizontal && hasMarks ? theme.spacing(1) : 'inherit'};
      height: ${isHorizontal ? 'auto' : '100%'};
    `,
    slider: css`
      .rc-slider {
        display: flex;
        flex-grow: 1;
        margin-left: 3px; // half the size of the handle to align handle to the left on 0 value
      }
      .rc-slider-mark {
        top: ${theme.spacing(1.75)};
      }
      .rc-slider-mark-text {
        color: ${theme.colors.text.disabled};
        font-size: ${theme.typography.bodySmall.fontSize};
      }
      .rc-slider-mark-text-active {
        color: ${theme.colors.text.primary};
      }
      .rc-slider-vertical .rc-slider-handle {
        margin-top: -10px;
      }
      .rc-slider-handle {
        border: 1px solid #ffffff;
        background-color: transparent;
        box-shadow: none;
        cursor: ew-resize;
        margin-top: -2px;
        width: 6px;
        height: 10px;
        border-radius: 2px;
        transform: none;
      }
      .rc-slider-handle:hover,
      .rc-slider-handle:active,
      .rc-slider-handle:focus,
      .rc-slider-handle-click-focused:focus,
      .rc-slider-dot-active {
        box-shadow: none;
      }
      .rc-slider-track {
        height: 6px;
        background: linear-gradient(90deg, ${colors.join()});
        background-size: 300px 100%;
      }
      .rc-slider-rail {
        height: 6px;
        background-color: ${railColor};
        cursor: ew-resize;
        background-size: 300px 100%;
      }
    `,
    /** Global component from @emotion/core doesn't accept computed classname string returned from css from emotion.
     * It accepts object containing the computed name and flattened styles returned from css from @emotion/core
     * */
    tooltip: cssCore`
      body {
        .rc-slider-tooltip {
          cursor: ew-resize;
          user-select: none;
          z-index: ${theme.zIndex.tooltip};
        }

        .rc-slider-tooltip-inner {
          color: ${theme.colors.text.primary};
          background-color: transparent !important;
          border-radius: 0;
          box-shadow: none;

          ${
            isTooltipVisible &&
            `
            opacity: 0.6;
            transition: 0.3s;
          `
          }
        }

        .rc-slider-tooltip-placement-top .rc-slider-tooltip-arrow {
          display: none;
        }

        .rc-slider-tooltip-placement-top {
          padding: 0;
        }
      }
    `,
    sliderInput: css`
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
    `,
    sliderInputVertical: css`
      flex-direction: column;
      height: 100%;

      .rc-slider {
        margin: 0;
        order: 2;
      }
    `,
    sliderInputField: css`
      margin-left: ${theme.spacing(3)};
      width: 60px;
      input {
        text-align: center;
      }
    `,
    sliderInputFieldVertical: css`
      margin: 0 0 ${theme.spacing(3)} 0;
      order: 1;
    `,
  };
};
