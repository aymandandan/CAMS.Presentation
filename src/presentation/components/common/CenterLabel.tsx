import { useTheme } from "@mui/material/styles";
import { useDrawingArea } from "@mui/x-charts/hooks";

export function CenterLabel({ total }: { total: number }) {
  const theme = useTheme();
  const { width, height, left, top } = useDrawingArea();
  return (
    <>
      <text
        x={left + width / 2}
        y={top + height / 2 - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fill={theme.palette.text.secondary}
        fontSize={16}
        fontWeight={600}
      >
        {total}
      </text>
      <text
        x={left + width / 2}
        y={top + height / 2 + 14}
        textAnchor="middle"
        dominantBaseline="central"
        fill={theme.palette.text.secondary}
        fontSize={12}
      >
        Total
      </text>
    </>
  );
}