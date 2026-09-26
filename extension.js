import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

export default class EnhancedAltTabExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._timerId = 0;
        this._windowList = [];
        this._targetIndex = 0;
        this._isCycling = false;
        this._signalId = 0;

        try {
            this._indicator = new St.BoxLayout({
                style_class: 'panel-button',
                reactive: true,
                can_focus: true,
                track_hover: true,
                y_align: Clutter.ActorAlign.CENTER,
                x_align: Clutter.ActorAlign.CENTER
            });

            let icon = new St.Icon({
                icon_name: 'window-new-symbolic',
                style_class: 'system-status-icon'
            });
            this._indicator.add_child(icon);

            this._menu = new PopupMenu.PopupMenu(this._indicator, 0.5, St.Side.TOP);
            Main.uiGroup.add_child(this._menu.actor);
            this._menu.actor.hide();

            this._menuManager = new PopupMenu.PopupMenuManager(this);
            this._menuManager.addMenu(this._menu);

            this._signalId = this._indicator.connect('button-press-event', (actor, event) => {
                const button = event.get_button();

                if (button === Clutter.BUTTON_PRIMARY) {
                    this._menu.close();
                    this._cycleWindows(1);
                    return Clutter.EVENT_STOP;
                } 
                else if (button === Clutter.BUTTON_SECONDARY) {
                    this._clearTimer();
                    this._isCycling = false;
                    
                    this._populateWindowMenu();
                    this._menu.toggle();
                    return Clutter.EVENT_STOP;
                }
                else if (button === Clutter.BUTTON_MIDDLE) {
                    this._menu.close();
                    this._toggleOverview();
                    return Clutter.EVENT_STOP;
                }
                
                return Clutter.EVENT_PROPAGATE;
            });

            Main.panel._rightBox.insert_child_at_index(this._indicator, 0);
            Main.panel.statusArea[this.metadata.uuid] = this._indicator;

        } catch (error) {
            console.error(`[AltTabDebug] Errore in enable(): ${error.message}`);
        }
    }

    disable() {
        this._clearTimer();

        if (this._indicator && this._signalId > 0) {
            this._indicator.disconnect(this._signalId);
            this._signalId = 0;
        }

        if (this._menuManager) {
            this._menuManager.removeMenu(this._menu);
            this._menuManager.destroy();
            this._menuManager = null;
        }

        if (this._menu) {
            Main.uiGroup.remove_child(this._menu.actor);
            this._menu.destroy();
            this._menu = null;
        }

        if (this._indicator) {
            Main.panel._rightBox.remove_child(this._indicator);
            delete Main.panel.statusArea[this.metadata.uuid];
            this._indicator.destroy();
            this._indicator = null;
        }
        this._windowList = [];
        this._settings = null;
    }

    _toggleOverview() {
        if (Main.overview) {
            this._clearTimer();
            this._isCycling = false;
            this._windowList = [];
            Main.overview.toggle();
        }
    }

    _getFilteredWindows() {
        const currentWorkspaceOnly = this._settings.get_boolean('current-workspace-only');
        const includeMinimized = this._settings.get_boolean('include-minimized');
        
        let allWindows = [];
        
        if (currentWorkspaceOnly) {
            let activeWorkspace = global.workspace_manager.get_active_workspace();
            allWindows = activeWorkspace.list_windows();
        } else {
            let nWorkspaces = global.workspace_manager.n_workspaces;
            for (let i = 0; i < nWorkspaces; i++) {
                let ws = global.workspace_manager.get_workspace_by_index(i);
                if (ws) {
                    allWindows.push(...ws.list_windows());
                }
            }
        }

        let filtered = allWindows.filter(w => {
            const type = w.get_window_type();
            const isMinimized = w.minimized;
            
            const isValidType = (type === 0 || type === 1 || type === 2);
            
            if (!isValidType) return false;
            if (isMinimized && !includeMinimized) return false;
            
            return true;
        });

        return filtered.sort((a, b) => {
            let timeA = a.get_user_time() === 0 ? global.get_current_time() : a.get_user_time();
            let timeB = b.get_user_time() === 0 ? global.get_current_time() : b.get_user_time();
            return timeB - timeA;
        });
    }

    _populateWindowMenu() {
        this._menu.removeAll();
        let windows = this._getFilteredWindows();

        if (windows.length === 0) {
            this._menu.addAction('Nessuna finestra aperta', () => {});
            return;
        }

        let tracker = Shell.WindowTracker.get_default();

        windows.forEach(win => {
            let title = win.get_title() || 'Finestra senza nome';
            if (title.length > 40) {
                title = title.substring(0, 37) + '...';
            }
            if (win.minimized) {
                title = `[⬇] ${title}`;
            }

            let app = tracker.get_window_app(win);
            let gicon = app ? app.get_icon() : null;

            if (!gicon) {
                const Gio = imports.gi.Gio; 
                gicon = Gio.Icon.new_for_string('window-new-symbolic');
            }

            let menuItem = new PopupMenu.PopupImageMenuItem(title, gicon);
            
            menuItem.connect('activate', () => {
                if (win.minimized) {
                    win.unminimize();
                }
                win.activate(global.get_current_time());
            });
            this._menu.addMenuItem(menuItem);
        });
    }

    _cycleWindows(direction) {
        try {
            this._clearTimer();

            if (!this._isCycling || this._windowList.length === 0) {
                this._isCycling = true;
                this._windowList = this._getFilteredWindows();
                this._targetIndex = 0;

                if (this._windowList.length <= 1) {
                    this._isCycling = false;
                    return;
                }
            }

            this._targetIndex += direction;
            if (this._targetIndex >= this._windowList.length) {
                this._targetIndex = 0;
            } else if (this._targetIndex < 0) {
                this._targetIndex = this._windowList.length - 1;
            }

            let nextWindow = this._windowList[this._targetIndex];
            if (nextWindow) {
                if (nextWindow.minimized) {
                    nextWindow.unminimize();
                }
                nextWindow.activate(global.get_current_time());
            }

            this._startTimer();
        } catch (e) {
            console.error(`[AltTabDebug] Errore nel ciclo: ${e.message}`);
            this._isCycling = false;
            this._clearTimer();
        }
    }

    _startTimer() {
        const seconds = this._settings ? this._settings.get_double('timeout-seconds') : 2.0;
        const milliseconds = Math.round(seconds * 1000);

        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
            this._timerId = 0;
            this._isCycling = false;
            this._windowList = [];
            return GLib.SOURCE_REMOVE;
        });
    }

    _clearTimer() {
        if (this._timerId > 0) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }
    }
}

