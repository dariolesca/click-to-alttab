# Alt+Tab Click Button (GNOME 50+ Shell Extension)

A lightweight and modern shell extension for **GNOME 50+** that adds an interactive button to the top-right status area. It allows you to cycle through open windows using only your mouse, emulating the native `Alt+Tab` switcher and the Activities Overview.

## ✨ Features

- **Left-Click:** Cycles forward through all open windows in the current workspace (using Most Recently Used - MRU order).
- **Auto-Confirm:** Staying idle on the highlighted window for a set amount of time automatically brings it to the foreground, with no need to click anywhere else.
- **Middle-Click (Scroll Wheel):** Instantly toggles the native **GNOME Overview** for a complete bird's-eye view of your workspaces.
- **Native Preferences Panel (Libadwaita):** Features an integrated graphical interface to adjust the idle timeout (supporting decimal fractions of a second) and toggle debug logging in the system journal.

## 🛠️ Manual Installation

To install this extension manually from source, open your terminal and run the following commands:

```bash
# 1. Create the official local extensions directory
mkdir -p ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it

# 2. Clone this repository into the created folder
git clone https://github.com ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it

# 3. Compile the settings schema (GSettings)
cd ~/.local/share/gnome-shell/extensions/click-to-alttab@solinos.it
glib-compile-schemas schemas/

# 4. Enable the extension
gnome-extensions enable click-to-alttab@solinos.it
```
*Note: After enabling it, please log out and log back into your session (if using Wayland) or restart the shell (if using X11) to fully load the ESM modules.*

## ⚙️ Configuration

You can easily adjust the inactivity timer or toggle logs by opening the built-in preferences dialog via terminal:
```bash
gnome-extensions prefs click-to-alttab@solinos.it
```
Alternatively, you can manage it graphically using the official **GNOME Extensions** application.

## 📄 License

This project is open-source software. Feel free to fork it, open issues, or submit pull requests to make it even better!

