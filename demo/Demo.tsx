import { useState, useEffect, useRef } from 'react';

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const METRICS = [
  { key: 'cpu', label: 'CPU Usage', unit: '%', color: '#60a5fa', bgColor: 'rgba(96,165,250,0.1)', max: 100 },
  { key: 'memory', label: 'Memory', unit: 'GB', color: '#f472b6', bgColor: 'rgba(244,114,182,0.1)', max: 32 },
  { key: 'requests', label: 'Requests/sec', unit: '', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.1)', max: 2000 },
  { key: 'latency', label: 'Latency', unit: 'ms', color: '#34d399', bgColor: 'rgba(52,211,153,0.1)', max: 500 },
];

export default function ChartsDemo() {
  const [data, setData] = useState<number[][]>(METRICS.map(() => []));
  const [labels, setLabels] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const initLabels: string[] = [];
    const initData: number[][] = METRICS.map(() => []);
    for (let i = 29; i >= 0; i--) {
      initLabels.push(`-${i * 5}s`);
      initData[0].push(randomInt(15, 85));
      initData[1].push(randomInt(6, 26));
      initData[2].push(randomInt(200, 1600));
      initData[3].push(randomInt(10, 350));
    }
    setData(initData);
    setLabels(initLabels);

    const tick = () => {
      if (paused) return;
      setData((prev) =>
        prev.map((series, i) => {
          const m = METRICS[i];
          const last = series[series.length - 1] || 50;
          const delta = randomInt(-Math.floor(m.max * 0.05), Math.floor(m.max * 0.08));
          const next = Math.max(m.max * 0.01, Math.min(m.max * 0.95, last + delta));
          return [...series.slice(1), next];
        })
      );
      setLabels((prev) => [...prev.slice(1), new Date().toLocaleTimeString()]);
    };
    intervalRef.current = setInterval(tick, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const series = data[selected];
  const metric = METRICS[selected];
  const max = Math.max(...series, 1);
  const min = Math.min(...series);
  const avg = Math.round(series.reduce((a, b) => a + b, 0) / series.length);
  const current = Math.round(series[series.length - 1]);
  const trend = series.length > 1 ? ((series[series.length - 1] - series[0]) / series[0] * 100) : 0;

  const allMetrics = METRICS.map((m, i) => ({
    ...m,
    value: Math.round(data[i]?.[data[i].length - 1] || 0),
    min: Math.round(Math.min(...(data[i] || [0]))),
    max: Math.round(Math.max(...(data[i] || [0]))),
  }));

  return (
    <div className="liquid-glass rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
            <h3 className="text-base font-semibold">SynthFlow Analytics</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[var(--color-text-muted)] font-mono">v3.2.1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{labels[labels.length - 1] || '--:--:--'}</span>
          <button onClick={() => setPaused(!paused)} className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${paused ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/15 text-green-400 border border-green-500/20'}`}>
            {paused ? 'â–¶ Resume' : 'â¸ Live'}
          </button>
        </div>
      </div>

      {/* Metric selector */}
      <div className="grid grid-cols-4 gap-2">
        {allMetrics.map((m, i) => (
          <button key={m.key} onClick={() => setSelected(i)}
            className={`text-left p-3 rounded-xl transition-all duration-300 cursor-pointer border ${selected === i ? 'border-white/[0.12]' : 'border-transparent'}`}
            style={{ background: selected === i ? m.bgColor : 'rgba(255,255,255,0.02)' }}>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{m.label}</div>
            <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}{m.unit}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[var(--color-text-muted)]">min {m.min}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">max {m.max}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-end gap-[2px] h-52 px-1">
          {series.map((val, i) => {
            const h = Math.max(2, ((val - min) / (max - min || 1)) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col justify-end group/chart cursor-crosshair">
                <div className="h-full flex flex-col justify-end transition-all duration-300 rounded-t-sm hover:opacity-100 opacity-80"
                  style={{ height: `${h}%`, backgroundColor: metric.color }}>
                </div>
                <div className="absolute opacity-0 group-hover/chart:opacity-100 bg-[#0a0c18] border border-white/[0.1] rounded-lg px-2 py-1 -translate-y-full -translate-x-1/4 text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-20"
                  style={{ marginBottom: '4px' }}>
                  {Math.round(val)}{metric.unit} Â· {labels[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Average', value: avg + metric.unit, color: 'text-white' },
          { label: 'Current', value: current + metric.unit, color: `text-[${metric.color}]` },
          { label: 'Peak', value: max + metric.unit, color: 'text-[var(--color-text-secondary)]' },
          { label: 'Trend', value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`, color: trend >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.02]">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

