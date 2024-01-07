import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Diffusion Centrality per node over time",
    },
  },
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Component needs to be rewritten
function convertToDataFormat() {
  // data: Map<string, Map<string, Map<string, number>>>
  const diffcen = {
    "1": {
      u: { w: 0.875, u: 0.22285507026263682, v: 0.125 },
      w: {
        v: 0.8333333333333333,
        w: 1.899891188788434,
        u: 0.16666666666666666,
      },
      v: {
        v: 1.0028478161818657,
        u: 0.027777777777777776,
        w: 0.9722222222222222,
      },
    },
    "5": {
      w: {
        u: 0.11447557860207201,
        v: 0.5253881911125526,
        w: 7.548832973261137,
      },
      u: {
        u: 1.1971055926702734,
        v: 0.3869554744587899,
        w: 0.5306180750216268,
      },
      v: {
        u: 0.08736238508669167,
        v: 5.302357097157161,
        w: 0.5498104456545143,
      },
    },
    "3": {
      u: {
        w: 0.5846156302145143,
        u: 0.7100239287446046,
        v: 0.3458195569108133,
      },
      w: {
        u: 0.12356102280699693,
        v: 0.5789979029092013,
        w: 3.3594015098012524,
      },
      v: { v: 3.15260229690905, u: 0.07788491452768159, w: 0.6169780536897971 },
    },
    "4": {
      w: {
        v: 0.4474437258633965,
        u: 0.10132558606505494,
        w: 4.382201150288006,
      },
      u: {
        u: 0.9657539481298845,
        v: 0.44933065647196085,
        w: 0.459774563353038,
      },
      v: {
        u: 0.10096360051946618,
        v: 4.298012880591784,
        w: 0.45620812795185256,
      },
    },
    "2": {
      v: {
        w: 0.4560563664334602,
        u: 0.1013954341203142,
        v: 2.1497846458869967,
      },
      u: {
        w: 0.46385720089360516,
        v: 0.4551294396765634,
        u: 0.4789370417123615,
      },
      w: {
        v: 0.4474339020518443,
        w: 2.191212980781382,
        u: 0.10138603482247471,
      },
    },
  };
  const labels = Object.keys(diffcen);

  const node_to_time_values = new Map<string, number[]>();

  for (const [time, time_map] of Object.entries(diffcen)) {
    for (const [source_node, node_map] of Object.entries(time_map)) {
      for (const [destination_node, value] of Object.entries(node_map)) {
        if (!node_to_time_values.has(source_node)) {
          node_to_time_values.set(source_node, []);
        }
        if (source_node === destination_node) {
          node_to_time_values.get(source_node)?.push(value);
        }
      }
    }
  }

  const datasets: {
    fill: boolean;
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[] = [];
  const colors = [
    "53B3AD",
    "4146C2",
    "E78B37",
    "CD4B81",
    "7F83F3",
    "8EDE78",
    "3878EB",
    "6A2BCB",
    "E2C742",
    "BE6325",
  ];

  // sort by value and assign color from left to right
  const sorted = new Map(
    [...node_to_time_values.entries()].sort((a, b) => b[1][0] - a[1][0]),
  );
  let i = 0;
  for (const [node_name, values] of sorted) {
    const color_rgb = hexToRgb(colors[i]);
    if (color_rgb) {
      colors[i] = `rgba(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b}, 0.9)`;
    }

    datasets.push({
      fill: true,
      label: node_name,
      data: values,
      borderColor: colors[i],
      backgroundColor: colors[i],
    });
    i++;
  }

  // reverse the order of the datasets so that the legend is in the same order as the graph
  datasets.reverse();

  return {
    labels,
    datasets: datasets,
  };
}

// Credit: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const updated_hex = hex.replace(
    shorthandRegex,
    (m: string, r: string, g: string, b: string): string =>
      r + r + g + g + b + b,
  );

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(updated_hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// data : Map<string, Map<string, Map<string, number>>>
export function DiffSimTotalChartTimeline() {
  return <Line options={options} data={convertToDataFormat()} />;
}
