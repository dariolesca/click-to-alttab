# Alt+Tab Click Button (GNOME 50+ Shell Extension)

A lightweight and modern shell extension for **GNOME 50+** that adds an interactive button to the top-right status area. It allows you to seamlessly manage and switch between open windows using only your mouse.

## ✨ Features

- **Left-Click (Cycle Forward):** Cycles forward through all open windows in the current workspace (using Most Recently Used - MRU order).
- **Auto-Confirm Timer:** Staying idle on the highlighted window for a set amount of time automatically brings it to the foreground, with no need to click anywhere else.
- **Right-Click (Window List Menu):** Instantly displays a clean, vertical dropdown menu containing the titles of all open windows for direct selection.
- **Auto-Close Menu:** The right-click window menu automatically closes as soon as you click anywhere else on the screen or select a window.
- **Middle-Click (Scroll Wheel):** Instantly toggles the native **GNOME Activities Overview** for a complete bird's-eye view of your workspace.
- **Native Preferences Panel (Libadwaita):** Features an integrated graphical interface to adjust the idle timeout (supporting decimal fractions of a second), toggle between current or all workspaces, include minimized windows, and toggle debug logging.

## 🛠️ Manual Installation

To install this extension manually from source, open your terminal and run the following commands:

```bash
# 1. Create the official local extensions directory
mkdir -p ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it

# 2. Clone this repository into the created folder
git clone https://github.com/dariolesca/click-to-alttab.git ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it

# 3. Compile the settings schema (GSettings)
cd ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it
glib-compile-schemas schemas/

# 4. Enable the extension
gnome-extensions enable click-to-alttab@solinos.it
```
*Note: After enabling it, please log out and log back into your session (if using Wayland) or restart the shell (if using X11) to fully load the ESM modules.*

## ⚙️ Configuration

You can easily adjust the inactivity timer or toggle settings by opening the built-in preferences dialog via terminal:
```bash
gnome-extensions prefs click-to-alttab@solinos.it
```
Alternatively, you can manage it graphically using the official **GNOME Extensions** application.

## 📄 License

This project is open-source software. Feel free to fork it, open issues, or submit pull requests to make it even better!

