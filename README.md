# Sleep4Fajr - Web Extension

This is a web extension that helps users calculate the best times to sleep to wake up for Fajr prayer. It is built using Bun as the runtime and supports both Firefox and Chrome.

---

## Build Instructions

Follow these steps to create an exact copy of the add-on code:

### 1. Prerequisites

- **Operating System**: Windows, macOS, or Linux.
- **Bun Runtime**: Install Bun (version 1.0 or higher).
- **Node.js**: Not required (Bun is used instead of Node.js).

### 2. Install Bun

If you don’t have Bun installed, follow these steps:

On macOS, Linux, or Windows (WSL):

Run the following command in your terminal:

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify Installation:

Check that Bun is installed correctly:

```bash
bun --version
```

### 3. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/okcha4ever/sleep4fajr
cd sleep4fajr
```

### 4. Install Dependencies

Install the required dependencies using Bun:

```bash
bun install
```

### 5. Configure Environment Variables

Create a `.env` file in the root of the project (at the same level as `src/` or the `dist` folders) with the following content:

```env
API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your API key from [MuslimSalat.com](https://www.muslimsalat.com/).

### 6. Build the Extension

The project includes two build scripts:

- **Firefox**: `bun run build:firefox`
- **Chrome**: `bun run build:chrome`

#### Build for Firefox:

Run the following command:

```bash
bun run build:firefox
```

This will generate a `dist_firefox` folder containing the Firefox-compatible extension.

#### Build for Chrome:

Run the following command:

```bash
bun run build:chrome
```

This will generate a `dist_chrome` folder containing the Chrome-compatible extension.

### 7. Test the Extension

#### Firefox:

1. Go to `about:debugging` in Firefox.
2. Click **This Firefox** in the sidebar.
3. Click **Load Temporary Add-on**.
4. Select the `manifest.json` file from the `dist_firefox` folder.

#### Chrome:

1. Go to `chrome://extensions/` in Chrome.
2. Enable Developer Mode (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `dist_chrome` folder.

### 8. Package the Extension

To create a `.zip` file for submission (you can use a different method from this):

#### Firefox:

```bash
cd dist_firefox
zip -r sleep4fajr-firefox.zip .
```

#### Chrome:

```bash
cd dist_chrome
zip -r sleep4fajr-chrome.zip .
```

---

## Development Instructions

For development purposes, the project includes scripts to run the extension in development mode:

- **Firefox**: `bun run dev:firefox`
- **Chrome**: `bun run dev:chrome`

#### Run for Firefox:

```bash
bun run dev:firefox
```

This will generate a `dist_firefox` folder containing the Firefox-compatible extension.
This will start the development server and allow live reloading for the Firefox extension.

#### Run for Chrome:

```bash
bun run dev:chrome
```

This will start the development server and allow live reloading for the Chrome extension.

---

## Build Scripts

The following scripts are defined in `package.json`:

- **build:firefox**: Builds the extension for Firefox.
- **build:chrome**: Builds the extension for Chrome.
- **dev:firefox**: Runs the extension in development mode for Firefox.
- **dev:chrome**: Runs the extension in development mode for Chrome.

---

## Environment Requirements

- **Bun**: Version 1.0 or higher.
- **Operating System**: Windows, macOS, or Linux.
- **Browser**: Firefox or Chrome (latest versions recommended).

---

## Required Programs

- **Bun**: Install using the instructions above.
- **Git**: Required for cloning the repository (if not already installed).

---

## Folder Structure

```plaintext
sleep4fajr/
├── dist_firefox/         # Firefox build output
├── dist_chrome/          # Chrome build output
├── src/                  # Source code
├── package.json          # Project dependencies and scripts
├── bun.lockb             # Bun lock file
└── README.md             # This file
└── dot.files             # Other config or dotfiles
```

---

## Submission Notes

- The `dist_firefox` and `dist_chrome` folders contain the exact build outputs for Firefox and Chrome, respectively.
- The `bun run build:firefox` and `bun run build:chrome` scripts execute all necessary technical steps to generate the builds.
- Bun is used as the runtime, and no additional programs (e.g., Node.js) are required.

---

## Support

For any issues or questions, please open an issue on the GitHub repository.
