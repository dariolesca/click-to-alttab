import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

export default class ClickToAltTabPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: 'Configurazione Estensione' });
        page.add(group);

        // 1. Timer di inattività
        const timeoutAdjustment = new Gtk.Adjustment({
            lower: 0.5,
            upper: 10.0,
            step_increment: 0.1,
            page_increment: 1.0,
            value: settings.get_double('timeout-seconds')
        });

        const timeoutRow = new Adw.SpinRow({
            title: 'Tempo di inattività (secondi)',
            subtitle: 'Secondi da attendere prima di confermare lo switch',
            digits: 1,
            adjustment: timeoutAdjustment
        });

        timeoutRow.connect('changed', (spinRow) => {
            settings.set_double('timeout-seconds', spinRow.get_value());
        });
        group.add(timeoutRow);

        // 2. FLAG: Includi minimizzate (Default: OFF)
        const minimizedRow = new Adw.SwitchRow({
            title: 'Includi finestre ridotte a icona',
            subtitle: 'Inserisce nel ciclo anche le finestre minimizzate',
            active: settings.get_boolean('include-minimized')
        });
        minimizedRow.connect('notify::active', (widget) => {
            settings.set_boolean('include-minimized', widget.active);
        });
        group.add(minimizedRow);

        // 3. FLAG: Solo workspace corrente (Default: ON)
        const workspaceRow = new Adw.SwitchRow({
            title: 'Solo spazio di lavoro corrente',
            subtitle: 'Limita lo switch alle finestre del workspace attivo',
            active: settings.get_boolean('current-workspace-only')
        });
        workspaceRow.connect('notify::active', (widget) => {
            settings.set_boolean('current-workspace-only', widget.active);
        });
        group.add(workspaceRow);

        // 4. Log di debug
        const debugRow = new Adw.SwitchRow({
            title: 'Abilita Log di Debug',
            subtitle: 'Stampa le azioni nel registro di sistema (journalctl)',
            active: settings.get_boolean('enable-debug')
        });
        debugRow.connect('notify::active', (widget) => {
            settings.set_boolean('enable-debug', widget.active);
        });
        group.add(debugRow);

        window.add(page);
    }
}

