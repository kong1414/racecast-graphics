# APEX Race Graphics

[English](README.md) | [简体中文](README.zh-CN.md)

APEX Race Graphics is a local Windows broadcast console for racing events. It combines a preview/program workflow, live timing data, 28 graphic templates, and transparent HTML5 output for OBS Studio and vMix.

The application runs entirely on the local computer. It does not require cloud services, online fonts, or remote images.

![APEX control console](artifacts/控制台.png)

## Features

- Preview (PVW) and program (PGM) monitors with full-scene or single-layer take.
- 28 racing graphic templates, including timing tower, driver profile, starting grid, results, pit timing, flags, weather, and schedules.
- Manual timing, CSV import/export, JSON projects, and a local HTTP timing API.
- Independent timing data for practice, qualifying, and race sessions.
- Transparent 1920 × 1080 HTML5 output, single-layer URLs, and black/green test backgrounds.
- Local autosave, a previous-version backup, scene presets, and portable project export.
- Offline Electron desktop app and a browser-based control server.

All built-in event, driver, team, and timing data is fictional sample content.

## Quick start

### Portable Windows app

Download or build the portable Windows package, then run `APEX-Race-Graphics-1.0.0-portable.exe`. No Node.js installation is needed for the packaged app. Keep the app running while the HTML5 output is in use.

The first launch may take a short time while the portable executable extracts its runtime files.

### Run from source

Requirements: Windows 10/11 x64 and Node.js 24 (the verified development environment).

```powershell
npm ci
npm start
```

To use the console in a browser instead of Electron:

```powershell
npm run server
```

Open `http://127.0.0.1:9860`. If the desktop app finds port 9860 occupied, it tries ports 9861–9869; always use the address shown under **Output & Settings**.

## Basic workflow

1. Open **Event Management** and enter the event, circuit, session, weather, and clock information.
2. Open **Drivers & Teams** to edit the roster or import a CSV file.
3. Enter live data under **Live Timing**, import timing CSV, or use the local HTTP API.
4. In **Broadcast Control**, click a layer to edit it. Right-click it or use **Add to Preview** to include it in PVW.
5. Press **Space** or **Take to Program** to publish the complete preview. Double-click a layer to take only that layer without clearing other program layers.
6. Press **Esc** or **Clear** to remove all program graphics while keeping the preview intact.
7. Copy the actual output URL from **Output & Settings** and add it to OBS or vMix.

Layer layout, properties, and theme changes are applied to preview first. Event, roster, timing, flag, and official-result data update shared graphics immediately.

## OBS and vMix

### OBS Studio

1. Add a **Browser** source.
2. Paste `http://127.0.0.1:9860/output`, or the actual URL shown by the app.
3. Set width to `1920` and height to `1080`.
4. Use 50 or 60 fps to match the production setting.

### vMix

Add a **Web Browser** input with the same URL and a 1920 × 1080 canvas.

The output background is transparent. The checkerboard visible in the control monitors is only a transparency indicator.

| URL | Purpose |
| --- | --- |
| `/output` | Transparent program output |
| `/preview` | Transparent preview output; not intended for broadcast |
| `/output?layer=tower` | Only the active timing tower; replace `tower` with another template ID |
| `/output?background=black` | Black-background layout check |
| `/output?background=green` | Green-background output |
| `/output?guides=1` | 90% safe-area guide for layout checks |

## Projects and data

- `examples/空白赛事.apex.json`: blank event project.
- `examples/演示工程.apex.json`: fictional Silverstone demonstration project.
- `examples/车手导入模板.csv`: roster CSV template.
- `examples/计时导入模板.csv`: timing CSV template.

Use **Export Project** or **Ctrl+S** to download a complete `.apex.json` project. Opening a project replaces current data and clears program output.

The desktop app normally stores data under `%APPDATA%/apex-race-graphics/projects`. The source server stores data in `data/`. Set `APEX_DATA_DIR` to use another directory. The exact active path is shown under **Output & Settings**.

Every change is autosaved. The previous saved version is retained as `.bak`.

## Documentation

- [中文用户手册](docs/USER_GUIDE.md) — detailed setup and operating instructions
- [中文说明](README.zh-CN.md)
- [Local data API](docs/API.md)
- [Feature and data behavior](docs/功能分析.md)
- [Verification notes](docs/验证记录.md)

## Development

```powershell
npm test                  # Model, timing, API, and persistence tests
npm run test:ui           # Browser end-to-end tests using installed Microsoft Edge
npm run package:win       # Build the Windows portable EXE and unpacked directory
node tests/smoke-exe.cjs  # Exercise the packaged app and refresh documentation screenshots
```

Project structure:

- `electron/` — desktop lifecycle and window security
- `server/` — local HTTP service, state validation, and persistence
- `public/` — control console, shared model, and HTML5 renderer
- `examples/` — sample projects and CSV templates
- `tests/` — automated tests
- `docs/` — user and integration documentation

## Scope and limitations

This release provides local manual, CSV, and HTTP-driven HTML5 graphics. It does not include SDI Fill/Key, DeckLink, NDI, video capture, replay recording, or proprietary timing-provider protocols. Replay templates display broadcast labels only.

The software does not calculate official penalties, points, or results. Race positions and official status must come from the operator or an authorized timing source. The portable executable is not commercially code-signed.

The service listens on the local computer only. Do not expose its control API to an untrusted network.

## License

[MIT](LICENSE) © APEX Graphics contributors
