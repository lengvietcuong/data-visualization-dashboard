<!-- markdownlint-disable MD013 MD033 -->
<h1 align="center">🌍 OECD Environmental & Agricultural Indicators Dashboard</h1>

<p align="center">
  <strong>Explore over a decade of environmental, agricultural &amp; livestock data for every OECD member country – all in one interactive place.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Built%20with-Next.js%2015-000000?logo=nextdotjs"/>
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?logo=supabase&logoColor=ffffff"/>
  </a>
</p>

---

## 📜 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech&nbsp;Stack](#-tech-stack)
- [Project&nbsp;Structure](#-project-structure)
- [Components](#-components)

## ✨ Features

- **Rich interactive visualisations** – leverages Plotly.js, Recharts and custom D3-powered components for maps, treemaps, scatterplots and trend charts.
- **Drill-down analytics** – quickly switch between global view and country-specific insights.
- **Dynamic leaderboards** – rank countries by raw values, total growth, average yearly growth, growth rate and more.
- **Flexible normalisation** – view absolute indicator values or normalise by population, land area, density or agricultural land.
- **Year range & region filters** – focus on any time slice or geographical region.

## 📸 Screenshots

**Global Emissions.** Quick insights into emissions of CO₂, GHG, CH₄, N₂O and NH₃ globally.

<figure>
  <img src="./screenshots/global-emissions.png" alt="Global emissions chart" width="100%"/>
</figure>

<br>

**Country Trends.** Shows trends across various metrics for a particular country.

<figure>
  <img src="./screenshots/country-stats.png" alt="Country statistics" width="100%"/>
</figure>

<br>

**Leaderboard – Horizontal Bar Chart.** Ranks all OECD members across various metrics, with options for normalization and growth metrics.

<figure>
  <img src="./screenshots/leaderboard-bar-chart.png" alt="Leaderboard bar chart" width="100%"/>
</figure>

<br>

**Leaderboard – Treemap.** Visualises each country’s contribution to the OECD total, emphasising relative magnitude.

<figure>
  <img src="./screenshots/leaderboard-treemap.png" alt="Leaderboard treemap" width="100%"/>
</figure>

<br>

**Leaderboard – Scatter Plot.** Explores bivariate relationships (e.g., emissions vs. population) to identify patterns and outliers.

<figure>
  <img src="./screenshots/leaderboard-scatterplot.png" alt="Leaderboard scatterplot" width="100%"/>
</figure>

## 📦 Tech Stack

- **Next.js 15** – React 19, App Router, Server Actions ready.
- **TypeScript** – static type-safety.
- **Supabase** – hosted PostgresSQL.
- **Plotly.js / react-plotly.js** – heavy-duty interactive charts.
- **Recharts** – lightweight composable charts.
- **Radix UI + shadcn** – accessible unstyled primitives & beautiful components.
- **Tailwind CSS** – utility-first styling.
- **Lucide React & React-Icons** – iconography.

## 🗄️ Database Schema

<figure>
  <img src="./screenshots/database-schema.png" alt="Database schema" width="100%"/>
  <figcaption align="center">Database Entity-Relationship Diagram</figcaption>
</figure>

### Table `countries`

| Column           | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| `ref_area`       | varchar | ISO-3166 alpha-3 country code (primary key). |
| `population`     | integer | Total resident population (persons).         |
| `area_km2`       | numeric | Land area in square kilometres.              |
| `reference_area` | text    | Human-readable country or territory name.    |

### Table `oecd`

| Column               | Type                    | Description                                                            |
| -------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `id`                 | serial                  | Surrogate primary key for the fact table.                              |
| `ref_area`           | varchar(10)             | Foreign key linking to `countries.ref_area`.                           |
| `measure`            | measure_enum            | Indicator measured                                                     |
| `erosion_risk_level` | erosion_risk_level_enum | Soil-erosion risk category for land-quality measures.                  |
| `water_type`         | water_type_enum         | Water body classification for water-quality measures.                  |
| `nutrients`          | nutrients_enum          | Nutrient type (e.g., `nitrogen`, `phosphorus`) for run-off indicators. |
| `unit_of_measure`    | unit_of_measure_enum    | Unit in which the observation is recorded.                             |
| `time_period`        | smallint                | Calendar year of the observation.                                      |
| `obs_value`          | numeric(15,2)           | Observed value.                                                        |

### Table `oecd_agricultural_land_area`

| Column        | Type          | Description                           |
| ------------- | ------------- | ------------------------------------- |
| `id`          | serial        | Surrogate primary key.                |
| `ref_area`    | varchar(10)   | Foreign key to `countries.ref_area`.  |
| `time_period` | smallint      | Calendar year.                        |
| `obs_value`   | numeric(15,2) | Agricultural land area (thousand ha). |

## 🗂️ Project Structure

| Path          | Purpose                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | Next.js **App Router** pages – top-level layout and root route rendering the dashboard component.                         |
| `components/` | Reusable UI and chart components. Sub-folder `ui/` contains Radix-based primitives styled with Tailwind.                  |
| `hooks/`      | React hooks for data fetching (`use-dashboard-data`, `use-country-data`, etc.) and utilities (`use-mobile`, `use-toast`). |
| `lib/`        | Client-side libraries – currently just the Supabase client + generic helpers.                                             |
| `utils/`      | Pure utility functions (regions, number formatters, colour scales, etc.).                                                 |
| `styles/`     | Global Tailwind CSS imports.                                                                                              |
| `public/`     | Static assets such as images, icons and og-tags.                                                                          |

## 🧩 Components

| Component                              | Purpose                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **World Map (Choropleth)**             | Spatially compares normalised indicator values across all OECD members to highlight geographic hot-spots and outliers.   |
| **Global Emissions Chart (KPI Cards)** | Presents multi-gas emission KPIs with absolute values and percentage deltas, enabling rapid high-level trend assessment. |
| **Country Trends**                     | Time-series line/area chart for a single country – supports comparing multiple indicators and annotating regime changes. |
| **Leaderboard Bar Chart**              | Ranks countries on absolute or per-capita values; ideal for Pareto assessment and top-N analyses.                        |
| **Leaderboard Treemap**                | Visualises proportional contribution of each country to the OECD aggregate, aiding share-of-total reasoning.             |
| **Leaderboard Scatter Plot**           | Explores bivariate relationships (e.g., emissions vs. intensity) uncovering clusters, correlations and outliers.         |
| **Dashboard Filters & Selectors**      | Provides faceting by measurement domain, normalisation basis, region, and year range for robust subgroup analysis.       |
