import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { ColorScaleRange } from './ColorScaleRange';
import { MouseTooltip } from './MouseTooltip';

type Props = {
  colorPalette: string[];
  min: number;
  max: number;

  // Show a value as string -- when not defined, the raw values will not be shown
  display?: (v: number) => string;
};

type HoverState = {
  isShown: boolean;
  value: number;
};

export const ColorScale = ({ colorPalette, min, max, display }: Props) => {
  const [colors, setColors] = useState<string[]>([]);
  const [hover, setHover] = useState<HoverState>({ isShown: false, value: 0 });
  const [rangeValue, setRangeValue] = useState<number[]>([min, max]);

  useEffect(() => {
    setColors(getGradientStops({ colorArray: colorPalette }));
  }, [colorPalette]);

  const theme = useTheme2();
  const styles = getStyles(theme);

  const onScaleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const divOffset = event.nativeEvent.offsetX;
    const offsetWidth = (event.target as any).offsetWidth as number;
    const normPercentage = Math.floor((divOffset * 100) / offsetWidth + 1);
    const scaleValue = Math.floor(((max - min) * normPercentage) / 100 + min);
    setHover({ isShown: true, value: scaleValue });
  };

  const onScaleMouseLeave = () => {
    setHover({ isShown: false, value: 0 });
  };

  const onRangeChange = (val: number[]) => {
    setRangeValue(val);
    onScaleMouseLeave();
  };

  return (
    <div className={styles.scaleWrapper}>
      <div className={styles.sliderWrapper}>
        <ColorScaleRange
          bgColors={colors}
          min={min}
          max={max}
          value={rangeValue}
          onChange={onRangeChange}
          onMouseMove={onScaleMouseMove}
          onMouseLeave={onScaleMouseLeave}
          isTooltipVisible={hover.isShown}
        />
        {display && hover.isShown && (
          <MouseTooltip visible={hover.isShown} offsetX={10} offsetY={10}>
            <span>{display(hover.value)}</span>
          </MouseTooltip>
        )}
      </div>
    </div>
  );
};

const getGradientStops = ({ colorArray, stops = 10 }: { colorArray: string[]; stops?: number }): string[] => {
  const colorCount = colorArray.length;
  if (colorCount <= 20) {
    const incr = (1 / colorCount) * 100;
    let per = 0;
    const stops: string[] = [];
    for (const color of colorArray) {
      if (per > 0) {
        stops.push(`${color} ${per}%`);
      } else {
        stops.push(color);
      }
      per += incr;
      stops.push(`${color} ${per}%`);
    }
    return stops;
  }

  const gradientEnd = colorArray[colorCount - 1];
  const skip = Math.ceil(colorCount / stops);
  const gradientStops = new Set<string>();

  for (let i = 0; i < colorCount; i += skip) {
    gradientStops.add(colorArray[i]);
  }

  gradientStops.add(gradientEnd);

  return [...gradientStops];
};

const getStyles = (theme: GrafanaTheme2) => ({
  scaleWrapper: css`
    margin: 0 27px;
    padding-top: 10px;
    width: 100%;
    max-width: 300px;
    color: #ccccdc;
    font-size: 11px;
  `,
  sliderWrapper: css`
    height: 34px;
  `,
});
