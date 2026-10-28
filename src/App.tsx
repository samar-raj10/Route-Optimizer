import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Ambulance,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GitCompareArrows,
  Info,
  MapPinned,
  Menu,
  Play,
  RotateCcw,
  Route,
  ShieldAlert,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { search } from "./algorithms/search";
import {
  SIZE,
  type AlgorithmName,
  type CellKind,
  type Grid,
  type Point,
  type SearchResult,
  samePoint,
} from "./algorithms/types";
import { cloneGrid, createScenarios, type Scenario } from "./data/scenarios";
import { Sun, Moon } from "lucide-react";

type Page =
  | "Home"
  | "Route Planner"
  | "Scenarios"
  | "Algorithm Comparison"
  | "About";
const algorithms: AlgorithmName[] = [
  "A* Search",
  "Dijkstra's Algorithm",
  "Greedy Best-First",
  "Breadth-First Search",
];
const point = (r: number, c: number): Point => ({ row: r, col: c });
const initialScenarios = createScenarios();
const initial = initialScenarios[0];
const coord = (p: Point) => `(${p.row}, ${p.col})`;

function App() {
  const [page, setPage] = useState<Page>("Home");
  const [grid, setGrid] = useState<Grid>(() => cloneGrid(initial.grid));
  const [start, setStart] = useState<Point>(initial.start);
  const [goal, setGoal] = useState<Point>(initial.goal);
  const [algorithm, setAlgorithm] = useState<AlgorithmName>("A* Search");
  const [mode, setMode] = useState<
    "start" | "goal" | "block" | "cost" | "view"
  >("view");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [comparison, setComparison] = useState<SearchResult[]>([]);
  const [notice, setNotice] = useState("");
  const [animatedExplored, setAnimatedExplored] = useState<Point[]>([]);
  const [showPath, setShowPath] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const timerRef = useRef<number[]>([]);
  const scenarioList = useMemo(() => createScenarios(), []);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ero-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("ero-theme", theme);
  }, [theme]);
  const clearAnimation = () => {
    timerRef.current.forEach(window.clearTimeout);
    timerRef.current = [];
    setAnimating(false);
  };
  useEffect(
    () => () => {
      timerRef.current.forEach(window.clearTimeout);
    },
    [],
  );
  const clearResults = () => {
    clearAnimation();
    setResult(null);
    setComparison([]);
    setAnimatedExplored([]);
    setShowPath(false);
  };
  const loadScenario = (scenario: Scenario) => {
    clearResults();
    setGrid(cloneGrid(scenario.grid));
    setStart({ ...scenario.start });
    setGoal({ ...scenario.goal });
    setMode("view");
    setNotice(`${scenario.title} loaded.`);
    setPage("Route Planner");
  };
  const clickCell = (p: Point) => {
    if (mode === "view") return;
    if (mode === "start" || mode === "goal") {
      if (grid[p.row][p.col] === "blocked") {
        setNotice("Choose a traversable cell, not a blocked road.");
        return;
      }
      if (mode === "start" && samePoint(p, goal)) {
        setNotice("Start and destination must be different cells.");
        return;
      }
      if (mode === "goal" && samePoint(p, start)) {
        setNotice("Start and destination must be different cells.");
        return;
      }
      if (mode === "start") setStart(p);
      else setGoal(p);
      clearResults();
      setNotice(
        `${mode === "start" ? "Start" : "Destination"} updated to ${coord(p)}.`,
      );
    } else {
      if (samePoint(p, start) || samePoint(p, goal)) {
        setNotice("Start and destination cells cannot be edited as roads.");
        return;
      }
      const next = cloneGrid(grid);
      if (mode === "block")
        next[p.row][p.col] =
          next[p.row][p.col] === "blocked" ? "road" : "blocked";
      if (mode === "cost")
        next[p.row][p.col] =
          next[p.row][p.col] === "highCost" ? "road" : "highCost";
      setGrid(next);
      clearResults();
      setNotice(
        mode === "block" ? "Road blockage updated." : "Road cost updated.",
      );
    }
  };
  const findRoute = (alg = algorithm) => {
    clearAnimation();
    const next = search(grid, start, goal, alg);
    setResult(next);
    setAlgorithm(alg);
    setAnimatedExplored(next.exploredNodes);
    setShowPath(true);
    setNotice(next.success ? `Route calculated using ${alg}.` : next.message);
    return next;
  };
  const animate = () => {
    clearAnimation();
    const next = search(grid, start, goal, algorithm);
    setResult(next);
    setAnimatedExplored([]);
    setShowPath(false);
    setAnimating(true);
    const nodes = next.exploredNodes;
    nodes.forEach((p, i) => {
      const id = window.setTimeout(
        () => setAnimatedExplored((prev) => [...prev, p]),
        Math.min(i * 18, 1100),
      );
      timerRef.current.push(id);
    });
    const end = window.setTimeout(
      () => {
        setShowPath(true);
        setAnimating(false);
        setNotice(next.success ? "Search animation complete." : next.message);
      },
      Math.min(nodes.length * 18, 1100) + 180,
    );
    timerRef.current.push(end);
  };
  const runComparison = () => {
    clearAnimation();
    const rows = algorithms.map((a) => search(grid, start, goal, a));
    setComparison(rows);
    setNotice("Comparison completed using the current map.");
  };
  const resetMap = () => {
    const s = initialScenarios[0];
    clearResults();
    setGrid(cloneGrid(s.grid));
    setStart(s.start);
    setGoal(s.goal);
    setMode("view");
    setNotice("Map reset to the default city.");
  };
  const clearObstacles = () => {
    const next = cloneGrid(grid);
    next.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell === "blocked") next[r][c] = "road";
      }),
    );
    setGrid(next);
    clearResults();
    setNotice("All blocked roads cleared.");
  };
  const navItems: Page[] = [
    "Home",
    "Route Planner",
    "Scenarios",
    "Algorithm Comparison",
    "About",
  ];
  const go = (p: Page) => {
    setPage(p);
    setMobileMenu(false);
    if (p !== "Algorithm Comparison") setComparison([]);
  };
  return (
    <div className={`app-shell ${theme}-theme`}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => go("Home")}
          aria-label="Emergency Route Optimizer home"
        >
          <span className="brand-icon">
            <Ambulance size={21} />
          </span>
          <span>
            Emergency Route <b>Optimizer</b>
          </span>
        </button>
        <button
          className="mobile-menu"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
        <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
          {navItems.map((item) => (
            <button
              key={item}
              className={page === item ? "nav-link active" : "nav-link"}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>
        <button className="nav-cta" onClick={() => go("Route Planner")}>
          <Route size={16} /> Plan a route
        </button>
      </header>
      {notice && (
        <div className="notice" role="status">
          <Info size={15} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={14} />
          </button>
        </div>
      )}
      <main>
        {page === "Home" && (
          <Home
            onStart={() => go("Route Planner")}
            onAbout={() => go("About")}
          />
        )}
        {page === "Route Planner" && (
          <Planner
            grid={grid}
            start={start}
            goal={goal}
            mode={mode}
            setMode={setMode}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            result={result}
            explored={animatedExplored}
            showPath={showPath}
            animating={animating}
            onCell={clickCell}
            onFind={() => findRoute()}
            onAnimate={animate}
            onStop={clearAnimation}
            onClear={clearResults}
            onReset={resetMap}
            onClearObstacles={clearObstacles}
            onCompare={() => {
              runComparison();
              setPage("Algorithm Comparison");
            }}
          />
        )}
        {page === "Scenarios" && (
          <Scenarios scenarios={scenarioList} onLoad={loadScenario} />
        )}
        {page === "Algorithm Comparison" && (
          <Comparison
            grid={grid}
            start={start}
            goal={goal}
            results={comparison}
            onRun={runComparison}
            onLoadScenario={loadScenario}
            scenarios={scenarioList}
          />
        )}
        {page === "About" && <About />}
      </main>
      <footer>
        <span>
          <Ambulance size={15} /> Emergency Route Optimizer
        </span>
        <span>
          AISC Algorithmic Implementation · Educational simulation only
        </span>
      </footer>
    </div>
  );
}

function Home({
  onStart,
  onAbout,
}: {
  onStart: () => void;
  onAbout: () => void;
}) {
  const preview = createScenarios()[0];
  const demo = search(preview.grid, preview.start, preview.goal, "A* Search");
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> AI SEARCH · A* ALGORITHM
          </div>
          <h1>
            Every second matters.
            <br />
            <span>Find a better route.</span>
          </h1>
          <p>
            An interactive emergency route planning simulation that finds
            low-cost paths, avoids blocked roads, and shows how heuristic search
            works.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={onStart}>
              Start route planning <ArrowRight size={17} />
            </button>
            <button className="button secondary" onClick={onAbout}>
              Explore the algorithm
            </button>
          </div>
          <div className="hero-footnote">
            <ShieldAlert size={16} /> Simulated city map — not for real-world
            emergency navigation.
          </div>
        </div>
        <div className="hero-visual">
          <div className="map-preview-head">
            <span>
              <MapPinned size={16} /> Sample city grid
            </span>
            <span className="live-pill">DEMO</span>
          </div>
          <MiniGrid
            grid={preview.grid}
            start={preview.start}
            goal={preview.goal}
            path={demo.path}
          />
          <div className="preview-caption">
            <span>
              <i className="dot green" /> Ambulance start
            </span>
            <span>
              <i className="dot blue" /> Calculated route
            </span>
            <span>
              <i className="dot red" /> Destination
            </span>
          </div>
          <div className="preview-stats">
            <div>
              <small>Path cost</small>
              <b>{demo.pathCost}</b>
            </div>
            <div>
              <small>Nodes explored</small>
              <b>{demo.nodesExplored}</b>
            </div>
            <div>
              <small>Algorithm</small>
              <b>A* Search</b>
            </div>
          </div>
        </div>
      </section>
      <section className="feature-section">
        <div className="section-heading">
          <span className="eyebrow">WHAT IT CAN DO</span>
          <h2>A small project with a real problem to solve.</h2>
          <p>
            Explore route planning through an interactive grid and compare how
            search algorithms behave.
          </p>
        </div>
        <div className="feature-grid">
          <Feature
            icon={<Target />}
            title="Optimal pathfinding"
            text="Use A* to find a minimum-cost route under the map's movement and cost rules."
          />
          <Feature
            icon={<ShieldAlert />}
            title="Avoid road blockages"
            text="Mark roads as blocked and calculate an alternative route without restarting the app."
          />
          <Feature
            icon={<GitCompareArrows />}
            title="Compare algorithms"
            text="Run four search methods on the same map and inspect cost, explored nodes, and timing."
          />
        </div>
      </section>
      <section className="how-strip">
        <div>
          <span className="step-num">01</span>
          <div>
            <b>Set the map</b>
            <p>Choose start, destination, and road conditions.</p>
          </div>
        </div>
        <div>
          <span className="step-num">02</span>
          <div>
            <b>Run the search</b>
            <p>Watch the algorithm explore possible routes.</p>
          </div>
        </div>
        <div>
          <span className="step-num">03</span>
          <div>
            <b>Review the result</b>
            <p>Inspect path cost and compare search strategies.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function MiniGrid({
  grid,
  start,
  goal,
  path = [],
}: {
  grid: Grid;
  start: Point;
  goal: Point;
  path?: Point[];
}) {
  const pathKeys = new Set(path.map((p) => `${p.row},${p.col}`));
  return (
    <div
      className="mini-grid"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const p = point(r, c),
            isStart = samePoint(p, start),
            isGoal = samePoint(p, goal),
            isPath = pathKeys.has(`${r},${c}`);
          const cls = isStart
            ? "start"
            : isGoal
              ? "goal"
              : cell === "blocked"
                ? "blocked"
                : cell === "highCost"
                  ? "high-cost"
                  : cell === "building"
                    ? "building"
                    : cell === "park"
                      ? "park"
                      : isPath
                        ? "path"
                        : "";
          return <span key={`${r}-${c}`} className={`mini-cell ${cls}`} />;
        }),
      )}
    </div>
  );
}

function Planner(props: {
  grid: Grid;
  start: Point;
  goal: Point;
  mode: "start" | "goal" | "block" | "cost" | "view";
  setMode: (m: "start" | "goal" | "block" | "cost" | "view") => void;
  algorithm: AlgorithmName;
  setAlgorithm: (a: AlgorithmName) => void;
  result: SearchResult | null;
  explored: Point[];
  showPath: boolean;
  animating: boolean;
  onCell: (p: Point) => void;
  onFind: () => void;
  onAnimate: () => void;
  onStop: () => void;
  onClear: () => void;
  onReset: () => void;
  onClearObstacles: () => void;
  onCompare: () => void;
}) {
  const {
    grid,
    start,
    goal,
    mode,
    setMode,
    algorithm,
    setAlgorithm,
    result,
    explored,
    showPath,
    animating,
  } = props;
  const exploredKeys = new Set(explored.map((p) => `${p.row},${p.col}`));
  const pathKeys = new Set(
    (showPath ? (result?.path ?? []) : []).map((p) => `${p.row},${p.col}`),
  );
  return (
    <div className="page">
      <PageTitle
        eyebrow="INTERACTIVE DEMO"
        title="Route planner"
        description="Edit the city grid, choose a search algorithm, and inspect the route it calculates."
      />
      <div className="planner-layout">
        <aside className="panel controls-panel">
          <div className="panel-title">
            <span className="panel-title-icon">
              <Route size={18} />
            </span>
            <div>
              <h2>Route settings</h2>
              <p>Configure your simulation</p>
            </div>
          </div>
          <label className="field-label" htmlFor="algorithm">
            Search algorithm
          </label>
          <select
            id="algorithm"
            className="select-input"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmName)}
          >
            {algorithms.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <div className="coord-grid">
            <div className="coord-card">
              <span className="legend-dot green" />
              <div>
                <small>Start location</small>
                <b>{coord(start)}</b>
              </div>
            </div>
            <div className="coord-card">
              <span className="legend-dot red" />
              <div>
                <small>Destination</small>
                <b>{coord(goal)}</b>
              </div>
            </div>
          </div>
          <div className="control-divider" />
          <label className="field-label">Map editing mode</label>
          <div className="mode-list">
            <ModeButton
              active={mode === "view"}
              onClick={() => setMode("view")}
              icon={<MapPinned size={16} />}
              title="View map"
              detail="Inspect current route"
            />
            <ModeButton
              active={mode === "start"}
              onClick={() => setMode("start")}
              icon={<span className="legend-dot green" />}
              title="Set start"
              detail="Click a traversable cell"
            />
            <ModeButton
              active={mode === "goal"}
              onClick={() => setMode("goal")}
              icon={<span className="legend-dot red" />}
              title="Set destination"
              detail="Choose the goal cell"
            />
            <ModeButton
              active={mode === "block"}
              onClick={() => setMode("block")}
              icon={<X size={16} />}
              title="Block / unblock road"
              detail="Toggle road availability"
            />
            <ModeButton
              active={mode === "cost"}
              onClick={() => setMode("cost")}
              icon={<span className="legend-dot orange" />}
              title="High-cost road"
              detail="Add or remove travel penalty"
            />
          </div>
          <div className="button-stack">
            <button className="button primary full" onClick={props.onFind}>
              <Route size={16} /> Find route
            </button>
            <button
              className="button secondary full"
              onClick={animating ? props.onStop : props.onAnimate}
            >
              {animating ? <X size={16} /> : <Play size={16} />}{" "}
              {animating ? "Stop animation" : "Animate search"}
            </button>
          </div>
          <div className="small-actions">
            <button onClick={props.onClearObstacles}>Clear blockages</button>
            <button onClick={props.onClear}>Clear result</button>
            <button onClick={props.onReset}>
              <RotateCcw size={13} /> Reset map
            </button>
          </div>
        </aside>
        <section className="panel map-panel">
          <div className="map-panel-header">
            <div>
              <h2>City grid</h2>
              <p>15 × 15 · Four-directional movement</p>
            </div>
            <span className={`mode-badge ${mode !== "view" ? "editing" : ""}`}>
              {mode === "view" ? "View mode" : "Editing map"}
            </span>
          </div>
          <div className="grid-wrap">
            <div className="axis-labels top">
              {Array.from({ length: SIZE }, (_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
            <div className="grid-with-axis">
              <div className="axis-labels side">
                {Array.from({ length: SIZE }, (_, i) => (
                  <span key={i}>{i}</span>
                ))}
              </div>
              <div
                className="city-grid"
                style={{
                  gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
                }}
              >
                {grid.flatMap((row, r) =>
                  row.map((cell, c) => {
                    const p = point(r, c),
                      k = `${r},${c}`,
                      isStart = samePoint(p, start),
                      isGoal = samePoint(p, goal),
                      isPath = pathKeys.has(k),
                      isExplored = exploredKeys.has(k);
                    let cls =
                      cell === "blocked"
                        ? "cell-blocked"
                        : cell === "highCost"
                          ? "cell-highcost"
                          : cell === "building"
                            ? "cell-building"
                            : cell === "park"
                              ? "cell-park"
                              : "";
                    if (isExplored && !isStart && !isGoal && !isPath)
                      cls += " cell-explored";
                    if (isPath && !isStart && !isGoal) cls = "cell-path";
                    return (
                      <button
                        key={k}
                        title={`Row ${r}, column ${c}${cell === "highCost" ? ", high-cost road" : ""}`}
                        aria-label={`Cell ${r}, ${c}`}
                        className={`city-cell ${cls} ${isStart ? "cell-start" : ""} ${isGoal ? "cell-goal" : ""}`}
                        onClick={() => props.onCell(p)}
                      >
                        {isStart ? (
                          <Ambulance size={15} />
                        ) : isGoal ? (
                          <Target size={15} />
                        ) : cell === "blocked" ? (
                          <X size={13} />
                        ) : cell === "building" ? (
                          <span className="building-mark" />
                        ) : cell === "park" ? (
                          <span className="park-mark" />
                        ) : cell === "highCost" ? (
                          <span className="cost-mark">4</span>
                        ) : isPath ? (
                          <span className="path-mark" />
                        ) : null}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </div>
          <div className="legend">
            <Legend color="green" text="Start" />
            <Legend color="red" text="Destination" />
            <Legend color="blue" text="Route" />
            <Legend color="yellow" text="Explored" />
            <Legend color="blocked" text="Blocked" />
            <Legend color="orange" text="High cost" />
          </div>
          <div className="map-hint">
            <Info size={15} />
            <span>
              {mode === "view"
                ? "Choose an editing mode from Route settings to change the map."
                : mode === "block"
                  ? "Click any cell except the start and destination to toggle a blockage."
                  : mode === "cost"
                    ? "Click a cell to add or remove a high-cost road (cost = 4)."
                    : `Click a traversable cell to set the ${mode === "start" ? "start" : "destination"}.`}
            </span>
          </div>
        </section>
      </div>
      <section className="metrics-grid">
        <Metric
          icon={<Route />}
          label="Path cost"
          value={result?.success ? String(result.pathCost) : "—"}
          sub="Lower is better"
        />
        <Metric
          icon={<Target />}
          label="Steps"
          value={result?.success ? String(result.steps) : "—"}
          sub="Cell-to-cell moves"
        />
        <Metric
          icon={<GitCompareArrows />}
          label="Nodes explored"
          value={result ? String(result.nodesExplored) : "—"}
          sub="Search effort"
        />
        <Metric
          icon={<Clock3 />}
          label="Execution time"
          value={result ? `${result.executionTimeMs.toFixed(3)} ms` : "—"}
          sub="Browser measurement"
        />
      </section>
      <section className="panel result-panel">
        <div className="result-head">
          <div>
            <h2>Route result</h2>
            <p>Current search output and algorithm status</p>
          </div>
          {result && (
            <span
              className={`result-status ${result.success ? "success" : "failure"}`}
            >
              {result.success ? (
                <CheckCircle2 size={15} />
              ) : (
                <ShieldAlert size={15} />
              )}{" "}
              {result.success ? "Route found" : "No route"}
            </span>
          )}
        </div>
        {!result ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Route size={22} />
            </div>
            <b>No route calculated yet</b>
            <p>
              Choose your settings and click “Find route” to see the computed
              result.
            </p>
          </div>
        ) : (
          <div className="result-detail">
            <div>
              <small>Algorithm</small>
              <b>{result.algorithm}</b>
            </div>
            <div>
              <small>Start → Destination</small>
              <b>
                {coord(start)} → {coord(goal)}
              </b>
            </div>
            <div>
              <small>Optimality</small>
              <b>{result.optimality}</b>
            </div>
            <div className="result-message">
              {result.success ? <CheckCircle2 size={17} /> : <Info size={17} />}{" "}
              {result.message}
            </div>
          </div>
        )}
        <div className="result-bottom">
          <span>
            <Info size={14} /> Timings are approximate and can vary between
            runs.
          </span>
          <button className="text-button" onClick={props.onCompare}>
            Compare algorithms <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
function ModeButton({
  active,
  onClick,
  icon,
  title,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <button
      className={`mode-button ${active ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="mode-icon">{icon}</span>
      <span>
        <b>{title}</b>
        <small>{detail}</small>
      </span>
      <span className="mode-radio" />
    </button>
  );
}
function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="legend-item">
      <i className={`legend-swatch ${color}`} />
      {text}
    </span>
  );
}
function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <article className="metric-card">
      <span className="metric-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
    </article>
  );
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function Scenarios({
  scenarios,
  onLoad,
}: {
  scenarios: Scenario[];
  onLoad: (s: Scenario) => void;
}) {
  const icons = [<MapPinned />, <ShieldAlert />, <Clock3 />, <X />];
  return (
    <div className="page">
      <PageTitle
        eyebrow="PREDEFINED TEST CASES"
        title="Explore scenarios"
        description="Load a prepared city map to test how the algorithms respond to different road conditions."
      />
      <div className="scenario-grid">
        {scenarios.map((s, i) => {
          const r = search(s.grid, s.start, s.goal, "A* Search");
          return (
            <article className="scenario-card" key={s.id}>
              <div className={`scenario-icon scenario-${s.id}`}>{icons[i]}</div>
              <div className="scenario-copy">
                <h2>{s.title}</h2>
                <p>{s.description}</p>
              </div>
              <MiniGrid
                grid={s.grid}
                start={s.start}
                goal={s.goal}
                path={r.path}
              />
              <div className="scenario-meta">
                <span>
                  {r.success
                    ? `A* path cost: ${r.pathCost}`
                    : "A* detects no path"}
                </span>
                <span
                  className={r.success ? "tiny-status good" : "tiny-status bad"}
                >
                  {r.success ? "Reachable" : "Unreachable"}
                </span>
              </div>
              <button
                className="button secondary full"
                onClick={() => onLoad(s)}
              >
                Load scenario <ArrowRight size={15} />
              </button>
            </article>
          );
        })}
      </div>
      <div className="callout">
        <Info size={18} />
        <div>
          <b>Experiment tip</b>
          <p>
            For a fair comparison, keep the same start, destination, grid, and
            movement rules when comparing algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}
function Comparison({
  grid,
  start,
  goal,
  results,
  onRun,
  onLoadScenario,
  scenarios,
}: {
  grid: Grid;
  start: Point;
  goal: Point;
  results: SearchResult[];
  onRun: () => void;
  onLoadScenario: (s: Scenario) => void;
  scenarios: Scenario[];
}) {
  const [selectedScenario, setSelectedScenario] = useState("current");
  const data = results.map((r) => ({
    name:
      r.algorithm === "Breadth-First Search"
        ? "BFS"
        : r.algorithm === "Dijkstra's Algorithm"
          ? "Dijkstra"
          : r.algorithm === "Greedy Best-First"
            ? "Greedy"
            : "A*",
    cost: r.pathCost ?? 0,
    nodes: r.nodesExplored,
    time: Number(r.executionTimeMs.toFixed(3)),
    found: r.success,
  }));
  const successful = results.filter((r) => r.success && r.pathCost !== null);
  const minCost = successful.length
    ? Math.min(...successful.map((r) => r.pathCost!))
    : null;
  const observation = !results.length
    ? ""
    : !successful.length
      ? "No algorithm found a valid route for this map. Try removing a blockage or selecting another scenario."
      : (() => {
          const a = results.find((r) => r.algorithm === "A* Search"),
            d = results.find((r) => r.algorithm === "Dijkstra's Algorithm"),
            g = results.find((r) => r.algorithm === "Greedy Best-First"),
            b = results.find((r) => r.algorithm === "Breadth-First Search");
          const parts: string[] = [];
          if (a?.success && d?.success && a.pathCost === d.pathCost)
            parts.push(
              `A* and Dijkstra both found a minimum-cost route of ${a.pathCost}.`,
            );
          if (g?.success && g.pathCost !== minCost)
            parts.push(
              "Greedy Best-First returned a higher-cost route on this map.",
            );
          if (b?.success && b.pathCost !== minCost)
            parts.push(
              "BFS found a route, but its shortest-step objective did not minimize weighted path cost.",
            );
          if (!parts.length)
            parts.push(
              "Compare the metrics below: path cost measures route expense, while explored nodes and time describe search effort for this run.",
            );
          return parts.join(" ");
        })();
  return (
    <div className="page">
      <PageTitle
        eyebrow="EXPERIMENTAL RESULTS"
        title="Algorithm comparison"
        description="Run every algorithm on the same map and compare the results from actual executions."
      />
      <section className="panel comparison-controls">
        <div>
          <h2>Comparison setup</h2>
          <p>Use the current route planner map or load a test scenario.</p>
        </div>
        <div className="comparison-actions">
          <select
            className="select-input"
            value={selectedScenario}
            onChange={(e) => {
              setSelectedScenario(e.target.value);
              if (e.target.value !== "current") {
                const s = scenarios.find((x) => x.id === e.target.value);
                if (s) onLoadScenario(s);
              }
            }}
          >
            <option value="current">Current route planner map</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <button className="button primary" onClick={onRun}>
            <GitCompareArrows size={16} /> Run comparison
          </button>
        </div>
      </section>
      {!results.length ? (
        <section className="panel empty-comparison">
          <div className="empty-icon">
            <GitCompareArrows size={24} />
          </div>
          <h2>Ready to compare?</h2>
          <p>
            Run all four algorithms against the current map to generate the
            table and charts.
          </p>
          <button className="button primary" onClick={onRun}>
            Run all algorithms <ArrowRight size={16} />
          </button>
        </section>
      ) : (
        <>
          <section className="panel table-panel">
            <div className="section-inline">
              <div>
                <h2>Results table</h2>
                <p>
                  Start {coord(start)} · Destination {coord(goal)}
                </p>
              </div>
              <span className="tiny-status good">Live computed results</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Path found</th>
                    <th>Path cost</th>
                    <th>Steps</th>
                    <th>Nodes explored</th>
                    <th>Time (ms)</th>
                    <th>Optimality</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr
                      key={r.algorithm}
                      className={
                        r.success && r.pathCost === minCost ? "best-row" : ""
                      }
                    >
                      <td>
                        <b>{r.algorithm}</b>
                        {r.success && r.pathCost === minCost && (
                          <span className="best-label">Lowest cost</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`table-status ${r.success ? "good" : "bad"}`}
                        >
                          {r.success ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>{r.pathCost ?? "N/A"}</td>
                      <td>{r.steps ?? "N/A"}</td>
                      <td>{r.nodesExplored}</td>
                      <td>{r.executionTimeMs.toFixed(3)}</td>
                      <td>{r.optimality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-note">
              Execution time is measured with browser performance timing and may
              fluctuate between runs. Tiny differences are not proof of general
              superiority.
            </p>
          </section>
          <div className="chart-grid">
            <ChartCard
              title="Path cost"
              description="Lower is better"
              data={data}
              dataKey="cost"
              color="#2877d4"
            />
            <ChartCard
              title="Nodes explored"
              description="Search effort for this run"
              data={data}
              dataKey="nodes"
              color="#d69b37"
            />
            <ChartCard
              title="Execution time (ms)"
              description="Browser measurement"
              data={data}
              dataKey="time"
              color="#438b72"
            />
          </div>
          <section className="callout observation">
            <Sparkles size={19} />
            <div>
              <b>What these results suggest</b>
              <p>{observation}</p>
            </div>
          </section>
        </>
      )}
      <section className="method-note">
        <BookOpen size={19} />
        <div>
          <b>How to interpret the comparison</b>
          <p>
            A* and Dijkstra guarantee minimum path cost under the implemented
            nonnegative costs. Greedy Best-First is guided by distance-to-goal
            and is not guaranteed optimal. BFS minimizes number of steps only
            when edges are treated equally; with high-cost cells, it may not
            minimize travel cost.
          </p>
        </div>
      </section>
    </div>
  );
}
function ChartCard({
  title,
  description,
  data,
  dataKey,
  color,
}: {
  title: string;
  description: string;
  data: {
    name: string;
    cost: number;
    nodes: number;
    time: number;
    found: boolean;
  }[];
  dataKey: "cost" | "nodes" | "time";
  color: string;
}) {
  const plotted = data.map((d) => ({
    ...d,
    [dataKey]: d.found ? d[dataKey] : null,
  }));
  return (
    <section className="panel chart-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={plotted}
            margin={{ top: 8, right: 8, left: -18, bottom: 3 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8edf3"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#627187" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#8290a2" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: any) =>
                v === null || v === undefined ? "No path" : v
              }
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
function About() {
  return (
    <div className="page">
      <PageTitle
        eyebrow="PROJECT OVERVIEW"
        title="How the optimizer works"
        description="A practical demonstration of heuristic search, path costs, and algorithm evaluation."
      />
      <section className="about-intro panel">
        <div className="about-icon">
          <Ambulance size={28} />
        </div>
        <div>
          <h2>Problem statement</h2>
          <p>
            An ambulance needs to travel from a starting location to a
            destination while avoiding blocked roads and accounting for slower
            routes. The city is modeled as a weighted grid, and search
            algorithms calculate a route through traversable cells.
          </p>
        </div>
      </section>
      <section className="about-grid">
        <article className="panel explanation-card">
          <span className="number-tag">01</span>
          <h2>Why A* search?</h2>
          <p>
            A* chooses which location to explore using both the cost already
            paid and an estimate of the cost still remaining. This helps guide
            the search toward the destination without ignoring the route taken
            so far.
          </p>
          <div className="formula">f(n) = g(n) + h(n)</div>
          <ul>
            <li>
              <b>g(n)</b> — cost from the start to node n.
            </li>
            <li>
              <b>h(n)</b> — estimated cost from n to the goal.
            </li>
            <li>
              <b>f(n)</b> — estimated total route cost through n.
            </li>
          </ul>
        </article>
        <article className="panel explanation-card">
          <span className="number-tag">02</span>
          <h2>Manhattan heuristic</h2>
          <p>
            Movement is allowed only up, down, left, and right. Manhattan
            distance estimates how many grid moves remain without accounting for
            obstacles.
          </p>
          <div className="formula small-formula">
            h(n) = |r − r goal| + |c − c goal|
          </div>
          <p className="muted">
            Each normal cell costs 1 and high-cost cells cost 4. Because every
            move costs at least 1, Manhattan distance remains a lower-bound
            estimate.
          </p>
        </article>
      </section>
      <section className="panel workflow-panel">
        <div className="section-inline">
          <div>
            <h2>Search workflow</h2>
            <p>The main steps performed by A*.</p>
          </div>
        </div>
        <div className="workflow">
          {[
            "Initialize start",
            "Pick lowest f-score",
            "Check destination",
            "Expand valid neighbors",
            "Update costs & parents",
            "Reconstruct route",
          ].map((s, i) => (
            <div className="workflow-step" key={s}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{s}</b>
              {i < 5 && <ArrowRight size={16} />}
            </div>
          ))}
        </div>
      </section>
      <section className="panel algorithms-explainer">
        <h2>Algorithms included</h2>
        <div className="algorithm-explain-grid">
          {[
            {
              name: "A* Search",
              desc: "Uses path cost plus heuristic. Optimal here with Manhattan distance and the defined costs.",
            },
            {
              name: "Dijkstra's Algorithm",
              desc: "Expands the lowest accumulated-cost node. Finds a minimum-cost path with nonnegative costs.",
            },
            {
              name: "Greedy Best-First",
              desc: "Chooses the node that looks closest to the goal. It can be fast, but may return a costly route.",
            },
            {
              name: "Breadth-First Search",
              desc: "Explores by number of edges. It minimizes steps in an unweighted grid, not necessarily weighted cost.",
            },
          ].map((a, i) => (
            <div className="algorithm-explain" key={a.name}>
              <span className="algo-number">{i + 1}</span>
              <div>
                <h3>{a.name}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="about-grid">
        <article className="panel explanation-card">
          <h2>Where this idea applies</h2>
          <ul>
            <li>Emergency route planning simulations</li>
            <li>Robot and warehouse navigation</li>
            <li>Game character pathfinding</li>
            <li>General graph-search problems</li>
          </ul>
        </article>
        <article className="panel explanation-card">
          <h2>Limitations</h2>
          <ul>
            <li>The map is simulated, not a real street network.</li>
            <li>Execution time varies by browser and device.</li>
            <li>Static obstacles do not model changing traffic.</li>
            <li>
              This is an educational demo, not emergency dispatch software.
            </li>
          </ul>
        </article>
      </section>
      <div className="callout">
        <Info size={18} />
        <div>
          <b>Academic note</b>
          <p>
            The project demonstrates an algorithmic model. Real-world navigation
            would require road-network data, traffic updates, turn restrictions,
            and safety validation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
