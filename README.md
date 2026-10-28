# 🚑 Emergency Route Optimizer

### An Interactive AI Search Algorithm Visualization for Emergency Navigation

**Emergency Route Optimizer** is an interactive web application that demonstrates how artificial intelligence search algorithms solve pathfinding problems in an emergency-navigation scenario. Users can create road environments, configure obstacles and high-cost roads, visualize search execution, and compare different algorithms on the same grid.

🔗 **Live Demo:** [View Emergency Route Optimizer](https://route-optimizer-murex.vercel.app/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Search Algorithms](#-search-algorithms)
- [Technology Stack](#-technology-stack)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Use Cases](#-use-cases)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)

---

## 🧭 Overview

Finding a suitable route between two locations is a classic pathfinding problem in Artificial Intelligence. Different search algorithms use different strategies to explore possible routes, and their results can vary depending on obstacles, movement costs, and the structure of the environment.

Emergency Route Optimizer turns this concept into a visual and interactive experience. It represents a simplified road environment as a **15 × 15 grid** and allows users to observe how search algorithms explore the grid and identify a route from a starting point to a destination.

The application supports four search algorithms, interactive environment editing, predefined scenarios, animated visualization, and algorithm comparison tools.

> **Note:** This project is an educational simulation of emergency route planning. It does not use live GPS, real road networks, traffic feeds, or emergency dispatch data.

---

## 🎯 Problem Statement

How can different AI search algorithms be used to find a path between an emergency vehicle's starting location and a destination when some roads are inaccessible and others have higher traversal costs?

The project addresses this problem by providing an interactive environment in which users can:

- Represent a simplified road network as a grid.
- Configure obstacles and high-cost roads.
- Execute different search algorithms.
- Observe the exploration process and resulting route.
- Compare algorithm behavior under different environmental conditions.

### Project Objectives

1. Implement multiple AI search strategies in a common environment.
2. Visualize the search process instead of displaying only the final path.
3. Demonstrate the effect of obstacles and movement costs on pathfinding.
4. Help users understand the differences between uninformed and heuristic-based search.
5. Provide an interactive platform for experimenting with algorithm behavior.

---

## ✨ Key Features

### 🗺️ Interactive Grid Environment

- A 15 × 15 grid representing a simplified road network.
- Start and destination markers for defining the pathfinding task.
- Different cell types representing roads, blocked locations, high-cost roads, buildings, and parks.
- Interactive environment editing for testing different map configurations.

### 🧠 Four AI Search Algorithms

Run and explore four different search strategies:

- **Breadth-First Search (BFS):** Explores locations level by level.
- **Dijkstra's Algorithm:** Finds a minimum-cost path using accumulated path costs.
- **Greedy Best-First Search:** Prioritizes locations estimated to be closer to the destination.
- **A* Search:** Combines accumulated path cost with a heuristic estimate of the remaining cost.

### 🎬 Animated Search Visualization

- Observe the algorithm's exploration process.
- Visualize explored locations and the final path.
- Understand how different search strategies expand through the environment.
- See how obstacles and high-cost roads influence route selection.

### 🚧 Road Obstacles and Traversal Costs

- Blocked cells cannot be traversed.
- Normal traversable cells have a movement cost of **1**.
- High-cost road cells have a movement cost of **4**.
- Test how weighted movement costs affect the route chosen by cost-aware algorithms.

### 🧪 Predefined Scenarios

- Explore four predefined scenarios.
- Test different road configurations and obstacle arrangements.
- Observe how algorithm behavior changes between scenarios.
- Reuse scenarios to make comparisons more consistent.

### 📊 Algorithm Comparison

- Compare the behavior of different search algorithms.
- Examine the resulting paths and available search metrics.
- Use comparison tables and charts to understand differences in search behavior.
- Run multiple algorithms against the same environment for a more meaningful comparison.

### 🎨 Interactive User Interface

- Light and dark themes.
- Theme preference saved locally in the browser.
- Algorithm explanations and an About section.
- Reset controls for repeated experiments.
- Responsive styling for different screen sizes.

---

## 🔍 Search Algorithms

The application demonstrates four algorithms commonly studied in AI search and pathfinding.

| Algorithm | Search Strategy | Uses a Heuristic? | Pathfinding Characteristics |
|---|---|---|---|
| Breadth-First Search (BFS) | Explores level by level | No | Finds a minimum-step path when all moves have equal cost |
| Dijkstra's Algorithm | Expands the location with the lowest accumulated cost | No | Finds a minimum-cost path with non-negative edge costs |
| Greedy Best-First Search | Prioritizes estimated closeness to the goal | Yes | Can find a route quickly, but does not guarantee minimum cost |
| A* Search | Combines accumulated cost and estimated remaining cost | Yes | Can find a minimum-cost path when its heuristic and implementation satisfy the required conditions |

### The A* Evaluation Function

A* evaluates candidate locations using:

\[
f(n) = g(n) + h(n)
\]

Where:

- \(g(n)\) is the accumulated cost from the starting point to the current location.
- \(h(n)\) estimates the remaining distance to the destination.
- \(f(n)\) estimates the total cost of a path through the current location.

The application uses **Manhattan distance** as its heuristic for four-directional grid movement:

\[
h(n) = |x_{\text{goal}} - x_n| + |y_{\text{goal}} - y_n|
\]

This heuristic estimates the number of horizontal and vertical steps remaining, without accounting for obstacles.

**Important distinction:** BFS focuses on the number of steps in an unweighted setting, while Dijkstra and appropriately configured A* account for traversal costs. Greedy Best-First Search prioritizes estimated proximity rather than guaranteed minimum path cost.

---

## 🛠️ Technology Stack

The following technologies support the application's interface, algorithm implementation, visualization, and build process.

| Technology | Purpose in the Project |
|---|---|
| React | Builds the interactive user interface using reusable components and state-driven rendering |
| TypeScript | Provides static typing for application logic, grid representations, and algorithm-related data |
| Vite | Provides the development server and generates the optimized production build |
| CSS | Styles the grid, cell states, layout, responsive interface, and light/dark themes |
| Lucide React | Provides icons used in navigation, controls, and interface elements |
| Recharts | Renders charts used for visual comparison of algorithm results |
| Git | Tracks source-code changes throughout development |
| GitHub | Hosts the source code and project documentation |
| Vercel | Hosts the deployed web application and can automatically redeploy updates pushed to the connected repository |

---

## ⚙️ How It Works

The application follows a simple pathfinding workflow:

1. **Environment creation:** The grid represents the simplified road network.
2. **Endpoint selection:** The start and destination define the pathfinding task.
3. **Algorithm selection:** The user chooses BFS, Dijkstra, Greedy Best-First, or A*.
4. **Search execution:** The selected algorithm explores valid neighboring cells according to its search strategy.
5. **Path reconstruction:** When a route is found, the application reconstructs it using the search information recorded during execution.
6. **Visualization:** The interface displays the explored cells and resulting route.
7. **Comparison:** Users can execute other algorithms on the same scenario and examine the available results.

### Environment Rules

- Grid dimensions: 15 × 15.
- Movement: Up, down, left, and right.
- Normal traversable cell cost: 1.
- High-cost cell cost: 4.
- Blocked cells: Inaccessible.

These rules provide a controlled environment for studying pathfinding behavior.

---

## 🚀 Getting Started

Follow these instructions to run the project on your local machine.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — includes npm.
- [Git](https://git-scm.com/) — for cloning the repository.
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/).

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd emergency-route-optimizer
```

If your repository uses a different directory name, navigate to that directory instead.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal, typically:

```text
http://localhost:5173
```

If your Vite configuration specifies a different port, use the URL shown in the terminal.

### 5. Build for Production

```bash
npm run build
```

Vite runs the TypeScript build checks and creates the optimized production files in the `dist/` directory.

### 6. Preview the Production Build

```bash
npm run preview
```

Open the local URL displayed by Vite to inspect the production build.

---

## 📁 Project Structure

The main project files are organized as follows:

```text
emergency-route-optimizer/
├── public/                  # Static assets
├── src/
│   ├── algorithms/
│   │   ├── search.ts        # Search algorithm implementations
│   │   ├── priorityQueue.ts # Priority queue implementation
│   │   └── types.ts         # Grid and algorithm-related types
│   ├── App.tsx              # Main React application and interface
│   ├── styles.css           # Application styling and themes
│   └── main.tsx             # Application entry point
├── index.html               # HTML entry point
├── package.json             # Dependencies and npm scripts
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── .gitignore               # Files excluded from version control
└── README.md                # Project documentation
```

*Note: This describes the expected main files. Adjust the structure if your actual repository differs.*

---

## 💡 Use Cases

Emergency Route Optimizer can be used for:

- **AI education:** Understanding classical search algorithms through visualization.
- **Algorithm comparison:** Exploring the differences between uninformed and heuristic-guided search.
- **Pathfinding experiments:** Studying the effect of obstacles and non-uniform movement costs.
- **Academic demonstrations:** Presenting AI search concepts in an interactive university project.
- **Algorithm design discussions:** Examining the trade-offs between path cost, search strategy, and exploration behavior.

---

## ⚠️ Limitations

- The environment is a simplified grid rather than a real-world road network.
- The application does not use live traffic, GPS, real geographic data, or emergency service integrations.
- Cell-based traversal costs are simulated and do not directly represent actual driving time.
- Algorithm results depend on the environment, movement rules, heuristic, and implementation.
- Performance comparisons should be interpreted using the metrics actually collected and displayed by the application.

---

## 🔮 Future Enhancements

Potential future improvements include:

- Integration with real geographic road networks.
- Dynamic road closures and traffic conditions.
- Additional search algorithms and heuristic strategies.
- More detailed performance measurements, including nodes explored, path cost, and execution time where appropriate.
- Reproducible benchmarks across different map configurations.
- Multi-vehicle routing and emergency fleet coordination.
- Improved accessibility and mobile-device interaction.

---

## 👨‍💻 Project Information

**Project:** Emergency Route Optimizer  
**Domain:** Artificial Intelligence and Soft Computing  
**Frontend:** React, TypeScript, Vite, CSS  
**Visualization:** Interactive grid, animated search, comparison tables, and charts  
**Deployment:** Vercel  
**Source Control:** Git and GitHub
