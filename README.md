# Deflood

A working flood-awareness hackathon prototype for cities, towns and remote villages in Assam. Built with React, TypeScript, Vite, Lucide icons and locally bundled Outfit fonts. No API keys or external runtime services are required.

## Run

```sh
npm install
npm run dev
```

Open the Vite URL (default port 5173). The development server binds to `0.0.0.0` for hosted previews.

## Demo walkthrough

1. Start on **Overview**, with Tapesia selected.
2. Open **Local Risk Map**; select a location or toggle risk, report and road layers.
3. Open **Demo controls** and select **Yellow alert**. The area status, metrics, alert banner, map zone and notification inbox update together.
4. Read the **Safety Guide**, then submit a **Flooded road** report.
5. Open **Evacuate Safely**: the blocked 1.2 km shortcut is excluded. The 3.9 km ridge alternative is selected.
6. Simulate **Bridge closure** to exclude the bridge, or **Red emergency** to isolate the selected area. An unavailable-route message replaces route recommendations.
7. **Reset all demo conditions and reports** restores the original dataset.

Conditions are stored per location during the mounted app session. Refreshing resets all data, reports, photo previews and preferences. The interface explicitly labels reports as unverified and SMS as planned/demo only.

## Architecture

- `src/App.tsx`: application shell, navigation, screens and shared session state.
- `src/components.tsx`: risk badges, section headings, community reports, report form and safety guide.
- `src/RiskMap.tsx`: keyboard-selectable schematic map, layer controls, road details and route visualization.
- `src/data.ts`: typed fictional locations, scenarios, risk messages and community reports.
- `src/routing.ts`: pure road-condition transformations and eligible-route search.
- `src/styles.css`: centralized visual tokens and responsive flat styling. The supplied prompt's tokens were used; no `role.txt` existed in the checkout.

### Routing model

The tiny fictional road graph enumerates simple paths and excludes **Dangerous**, **Partially blocked** and **Unknown** edges. Eligible **Open** and **Caution** paths are ranked by distance. The safest tab ranks by fewest caution segments, then distance. Recommended is the shortest eligible route, not the shortest unrestricted route. Travel times assume an illustrative 3 km/h walking speed.

The report form has no specific road selector: a road incident conservatively blocks the selected area's shortest adjacent demo road. Bridge reports use an adjacent bridge when one exists, otherwise the shortest adjacent road. This deliberate simplification is not a production routing model. The graph and data functions are isolated so verified road/sensor/API sources can replace them later.

## Validation

```sh
npm run build         # TypeScript and production build
npm test              # Six pure routing tests (Node 22.6+)
npx playwright install --with-deps chromium
npm run test:e2e      # Three browser tests
```

Browser tests cover the yellow-alert flow, notifications, safety instructions, report submission, rerouting, unavailable routes, reset, village selection, preferences, map controls, modal focus trapping and mobile navigation without horizontal overflow. `DEFLOOD_BROWSER=/path/to/chromium` can select a system browser when Playwright browser downloads are unavailable.

## Safety and limitations

- All measurements, scenarios, shelters, road conditions and map geography are fictional. The map is a schematic, not to geographic scale.
- No live forecasts, official thresholds, GPS, real SMS, government integration or emergency-service dispatch.
- Preferences demonstrate planned delivery settings; language selection does not translate the interface.
- No route is guaranteed safe. Follow local authorities, rescue teams and official evacuation orders. Never cross moving water, flooded bridges or blocked roads.
- This is an awareness and decision-support prototype, **not an operational early-warning or navigation system**.
