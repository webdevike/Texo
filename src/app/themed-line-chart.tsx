import { areaY, defineChart, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo } from 'react';

interface ChartDatum {
  x: number;
  y: number;
}

export interface ThemedChartSeries {
  area?: boolean;
  fill?: string;
  points: readonly number[];
  stroke: string;
}

export function ThemedLineChart({
  ariaLabel,
  height,
  series,
}: {
  ariaLabel: string;
  height: number;
  series: readonly ThemedChartSeries[];
}) {
  const definition = useMemo(() => {
    const marks = series.flatMap((item) => {
      const data: ChartDatum[] = item.points.map((y, x) => ({ x, y }));
      const line = lineY(data, {
        stroke: item.stroke,
        strokeWidth: 1.5,
        x: 'x',
        y: 'y',
      });

      return item.area
        ? [
            areaY(data, {
              fill: item.fill ?? item.stroke,
              fillOpacity: 0.2,
              x: 'x',
              y: 'y',
            }),
            line,
          ]
        : [line];
    });

    return defineChart({
      guides: false,
      marks,
      scales: {
        x: { scale: scaleLinear },
        y: { nice: true, scale: scaleLinear },
      },
      tooltip,
      svgAnimation: true,
    });
  }, [series]);

  return <Chart ariaLabel={ariaLabel} definition={definition} height={height} />;
}
