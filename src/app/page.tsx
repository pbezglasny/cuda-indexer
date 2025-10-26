"use client";

import { useEffect, useMemo, useState } from "react";

type CellInfo = {
  row: number;
  column: number;
  linearIndex: number;
  blockIdxX: number;
  blockIdxY: number;
  threadIdxX: number;
  threadIdxY: number;
  withinArray: boolean;
  withinLogicalGrid: boolean;
};

const DEFAULT_GRID_DIM_X = 3;
const DEFAULT_GRID_DIM_Y = 2;
const DEFAULT_BLOCK_DIM_X = 8;
const DEFAULT_BLOCK_DIM_Y = 4;
const DEFAULT_ARRAY_LENGTH = 96;

const MAX_GRID_DIMENSION = 10;
const MAX_BLOCK_DIMENSION = 32;
const MAX_ARRAY_LENGTH = 4096;

const blockPalette = [
  "139,92,246",
  "14,165,233",
  "16,185,129",
  "249,115,22",
  "236,72,153",
  "217,119,6",
];

const clampIntegerInput = (
  rawValue: string,
  fallback: number,
  maxValue: number,
) => {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(maxValue, parsed);
};

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;

const describeCell = (cell?: CellInfo) => {
  if (!cell) {
    return "Hover any cell to inspect CUDA coordinates.";
  }
  if (!cell.withinArray) {
    return "Index exceeds input array length. Threads in this area are idle.";
  }
  if (!cell.withinLogicalGrid) {
    return "There is data here, but no CUDA thread is mapped to it with the current grid.";
  }
  return "This cell belongs to both the data matrix and an active CUDA thread.";
};

export default function Home() {
  const [gridDimXInput, setGridDimXInput] = useState(
    DEFAULT_GRID_DIM_X.toString(),
  );
  const [gridDimYInput, setGridDimYInput] = useState(
    DEFAULT_GRID_DIM_Y.toString(),
  );
  const [blockDimXInput, setBlockDimXInput] = useState(
    DEFAULT_BLOCK_DIM_X.toString(),
  );
  const [blockDimYInput, setBlockDimYInput] = useState(
    DEFAULT_BLOCK_DIM_Y.toString(),
  );
  const [arrayLengthInput, setArrayLengthInput] = useState(
    DEFAULT_ARRAY_LENGTH.toString(),
  );
  const [hoveredCell, setHoveredCell] = useState<CellInfo | undefined>(
    undefined,
  );

  const gridDimX = clampIntegerInput(
    gridDimXInput,
    DEFAULT_GRID_DIM_X,
    MAX_GRID_DIMENSION,
  );
  const gridDimY = clampIntegerInput(
    gridDimYInput,
    DEFAULT_GRID_DIM_Y,
    MAX_GRID_DIMENSION,
  );
  const blockDimX = clampIntegerInput(
    blockDimXInput,
    DEFAULT_BLOCK_DIM_X,
    MAX_BLOCK_DIMENSION,
  );
  const blockDimY = clampIntegerInput(
    blockDimYInput,
    DEFAULT_BLOCK_DIM_Y,
    MAX_BLOCK_DIMENSION,
  );
  const arrayLength = clampIntegerInput(
    arrayLengthInput,
    DEFAULT_ARRAY_LENGTH,
    MAX_ARRAY_LENGTH,
  );

  const blockCount = gridDimX * gridDimY;
  const threadsPerBlock = blockDimX * blockDimY;
  const totalThreads = blockCount * threadsPerBlock;
  const totalColumns = gridDimX * blockDimX;
  const logicalGridRows = gridDimY * blockDimY;
  const matrixRows = Math.max(
    logicalGridRows,
    Math.ceil(arrayLength / totalColumns),
  );

  const cells = useMemo<CellInfo[]>(() => {
    const items: CellInfo[] = [];
    for (let row = 0; row < matrixRows; row += 1) {
      for (let column = 0; column < totalColumns; column += 1) {
        const linearIndex = row * totalColumns + column;
        const withinArray = linearIndex < arrayLength;
        const withinLogicalGrid = row < logicalGridRows;
        const blockIdxX = Math.floor(column / blockDimX);
        const blockIdxY = Math.floor(row / blockDimY);
        const threadIdxX = column % blockDimX;
        const threadIdxY = row % blockDimY;

        items.push({
          row,
          column,
          linearIndex,
          blockIdxX,
          blockIdxY,
          threadIdxX,
          threadIdxY,
          withinArray,
          withinLogicalGrid,
        });
      }
    }
    return items;
  }, [
    arrayLength,
    blockDimX,
    blockDimY,
    logicalGridRows,
    matrixRows,
    totalColumns,
  ]);

  useEffect(() => {
    setHoveredCell(undefined);
  }, [arrayLength, blockDimX, blockDimY, gridDimX, gridDimY]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            CUDA VISUALIZER
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
            Map CUDA blocks &amp; threads onto your input data
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            Tune grid dimensions, block dimensions, and input length to see how
            each CUDA thread covers the flattened array. Hover a cell to inspect
            its coordinates.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-900/70 bg-slate-900/50 p-6 shadow-[0_25px_80px_-40px] shadow-black/60 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-50">
              Input dimensions
            </h2>
            <p className="text-xs text-slate-400">
              Values are clamped: grid ≤ {MAX_GRID_DIMENSION}, block ≤{" "}
              {MAX_BLOCK_DIMENSION}, length ≤ {MAX_ARRAY_LENGTH}.
            </p>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-3">
            <fieldset className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
              <legend className="text-xs uppercase tracking-wide text-slate-500">
                Grid dimensions (blocks)
              </legend>
              <div className="mt-3 flex flex-col gap-3">
                <label className="text-sm text-slate-300">
                  gridDim.x
                  <input
                    type="number"
                    min={1}
                    max={MAX_GRID_DIMENSION}
                    value={gridDimXInput}
                    onChange={(event) => setGridDimXInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  gridDim.y
                  <input
                    type="number"
                    min={1}
                    max={MAX_GRID_DIMENSION}
                    value={gridDimYInput}
                    onChange={(event) => setGridDimYInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
              <legend className="text-xs uppercase tracking-wide text-slate-500">
                Block dimensions (threads)
              </legend>
              <div className="mt-3 flex flex-col gap-3">
                <label className="text-sm text-slate-300">
                  blockDim.x
                  <input
                    type="number"
                    min={1}
                    max={MAX_BLOCK_DIMENSION}
                    value={blockDimXInput}
                    onChange={(event) => setBlockDimXInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  blockDim.y
                  <input
                    type="number"
                    min={1}
                    max={MAX_BLOCK_DIMENSION}
                    value={blockDimYInput}
                    onChange={(event) => setBlockDimYInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
              <legend className="text-xs uppercase tracking-wide text-slate-500">
                Input data
              </legend>
              <div className="mt-3 flex flex-col gap-3">
                <label className="text-sm text-slate-300">
                  Array length
                  <input
                    type="number"
                    min={1}
                    max={MAX_ARRAY_LENGTH}
                    value={arrayLengthInput}
                    onChange={(event) => setArrayLengthInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  />
                </label>
                <p className="text-xs text-slate-400">
                  Matrix renders with width = gridDim.x × blockDim.x (
                  {totalColumns}) to keep CUDA blocks aligned vertically.
                </p>
              </div>
            </fieldset>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-900/70 bg-slate-900/50 p-6 shadow-[0_25px_80px_-40px] shadow-black/70 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Current totals
              </h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Blocks (gridDim.x × gridDim.y)
                  </dt>
                  <dd className="text-xl font-semibold text-slate-50">
                    {gridDimX} × {gridDimY} = {blockCount.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Threads / block
                  </dt>
                  <dd className="text-xl font-semibold text-slate-50">
                    {blockDimX} × {blockDimY} ={" "}
                    {threadsPerBlock.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Total threads
                  </dt>
                  <dd className="text-xl font-semibold text-emerald-300">
                    {totalThreads.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Matrix rows × cols
                  </dt>
                  <dd className="text-xl font-semibold text-slate-50">
                    {matrixRows.toLocaleString()} × {totalColumns} (
                    {(matrixRows * totalColumns).toLocaleString()} cells)
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Active cell
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Hover or focus any cell below to inspect the mapping.
              </p>
              <div className="mt-5 space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-200">
                <p className="font-mono text-base text-slate-50">
                  Global index:{" "}
                  {hoveredCell?.withinArray
                    ? hoveredCell.linearIndex
                    : "— (N/A)"}
                </p>
                <p className="font-mono">
                  blockIdx:{" "}
                  {hoveredCell?.withinLogicalGrid
                    ? `(${hoveredCell.blockIdxX}, ${hoveredCell.blockIdxY})`
                    : "—"}
                </p>
                <p className="font-mono">
                  threadIdx:{" "}
                  {hoveredCell?.withinLogicalGrid
                    ? `(${hoveredCell.threadIdxX}, ${hoveredCell.threadIdxY})`
                    : "—"}
                </p>
                <p className="font-mono">
                  Matrix coord:{" "}
                  {hoveredCell
                    ? `(${hoveredCell.row}, ${hoveredCell.column})`
                    : "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {describeCell(hoveredCell)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-50">
              CUDA grid overlay
            </h2>
            <p className="text-sm text-slate-400">
              The base matrix holds every index of the flattened input array.
              Colored overlays show CUDA blocks (gridDim.x × gridDim.y). Hover a
              tile to view its CUDA indices.
            </p>
          </header>
          <div className="rounded-3xl border border-slate-900/70 bg-slate-900/40 p-4 shadow-[0_35px_90px_-50px] shadow-black/70">
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((cell) => {
                const color =
                  blockPalette[
                    (cell.blockIdxY * gridDimX + cell.blockIdxX) %
                      blockPalette.length
                  ];
                const backgroundColor = cell.withinLogicalGrid
                  ? rgba(color, cell.withinArray ? 0.35 : 0.15)
                  : cell.withinArray
                    ? "rgba(148,163,184,0.12)"
                    : "transparent";
                const borderColor =
                  cell.threadIdxX === 0 || cell.threadIdxY === 0
                    ? "rgba(15,23,42,0.85)"
                    : "rgba(51,65,85,0.7)";
                const isHovered =
                  hoveredCell &&
                  hoveredCell.row === cell.row &&
                  hoveredCell.column === cell.column;

                return (
                  <button
                    key={`${cell.row}-${cell.column}`}
                    type="button"
                    onMouseEnter={() => setHoveredCell(cell)}
                    onFocus={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(undefined)}
                    onBlur={() => setHoveredCell(undefined)}
                    className="group relative aspect-square w-full border text-[0.65rem] font-medium text-slate-200 outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400/70"
                    style={{
                      backgroundColor,
                      borderColor,
                      color: cell.withinArray ? "rgb(226,232,240)" : "rgb(100,116,139)",
                      boxShadow: isHovered
                        ? "0 0 0 2px rgba(250,204,21,0.7)"
                        : undefined,
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-1 text-center">
                      {cell.withinArray ? cell.linearIndex : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
