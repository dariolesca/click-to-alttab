import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export default class EnhancedAltTabExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        
        this._log(`--- INIZIO METODO ENABLE (Advanced Mode) ---`);
        this._timerId = 0;
        this._windowList = [];
        this._targetIndex = 0;
        this._isCycling = false;
        this._signalId = 0; // Traccia l'ID del segnale

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

            // CORREZIONE EGO-L-003: Salva l'ID restituito dalla connessione del segnale
            this._signalId = this._indicator.connect('button-press-event', (actor, event) => {
                const button = event.get_button();

                if (button === Clutter.BUTTON_PRIMARY) {
                    this._log(`Click tasto SINISTRO rilevato.`);
                    this._cycleToNextWindow();
                    return Clutter.EVENT_STOP;
                } 
                else if (button === Clutter.BUTTON_MIDDLE) {
                    this._log(`Click tasto CENTRALE rilevato. Attivo l'Overview.`);
                    this._toggleOverview();
                    return Clutter.EVENT_STOP;
                }
                
                return Clutter.EVENT_PROPAGATE;
            });

            Main.panel._rightBox.insert_child_at_index(this._indicator, 0);
            Main.panel.statusArea[this.metadata.uuid] = this._indicator;

            this._log(`Pulsante configurato e integrato.`);
        } catch (error) {
            console.error(`[AltTabDebug] Errore in enable(): ${error.message}`);
        }
    }

    disable() {
        this._log(`--- METODO DISABLE ---`);
        this._clearTimer();

        // CORREZIONE EGO-L-003: Disconnette esplicitamente il segnale prima di distruggere l'oggetto
        if (this._indicator && this._signalId > 0) {
            this._indicator.disconnect(this._signalId);
            this._signalId = 0;
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

    _log(message) {
        if (this._settings && this._settings.get_boolean('enable-debug')) {
            console.log(`[AltTabDebug] ${message}`);
        }
    }

    _toggleOverview() {
        if (Main.overview) {
            this._clearTimer();
            this._isCycling = false;
            this._windowList = [];
            Main.overview.toggle();
            this._log(`Main.overview.toggle() eseguito.`);
        }
    }

    _cycleToNextWindow() {
        try {
            this._clearTimer();

            if (!this._isCycling || this._windowList.length === 0) {
                this._log(`Nuova sessione di click. Blocco elenco finestre.`);
                this._isCycling = true;
                
                let workspace = global.workspace_manager.get_active_workspace();
                let allWindows = workspace.list_windows().filter(w => w.get_window_type() === 0);

                if (allWindows.length <= 1) {
                    this._log(`Finestre insufficienti nello spazio di lavoro.`);
                    this._isCycling = false;
                    return;
                }

                this._windowList = allWindows.sort((a, b) => b.get_user_time() - a.get_user_time());
                this._targetIndex = 0;
            }

            this._targetIndex++;
            if (this._targetIndex >= this._windowList.length) {
                this._targetIndex = 0;
            }

            let nextWindow = this._windowList[this._targetIndex];
            if (nextWindow) {
                this._log(`Avanzamento a: ${nextWindow.get_title()} (Indice: ${this._targetIndex})`);
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
            this._log(`Timer di ${seconds}s scaduto. Finestra consolidata.`);
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

