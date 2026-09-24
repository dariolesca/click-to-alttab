import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

export default class ClickToAltTabPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Recupera le impostazioni memorizzate nello schema
        const settings = this.getSettings();

        // Pagina principale delle opzioni (stile moderno Adwaita)
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: 'Configurazione Estensione' });
        page.add(group);

        // 1. SOLUZIONE: Creiamo l'adjustment usando il costruttore base di GObject per GTK4
        const timeoutAdjustment = new Gtk.Adjustment({
            lower: 0.5,
            upper: 10.0,
            step_increment: 0.1,
            page_increment: 1.0,
            value: settings.get_double('timeout-seconds')
        });

        // Assegniamo l'adjustment appena creato al componente Adw.SpinRow
        const timeoutRow = new Adw.SpinRow({
            title: 'Tempo di inattività (secondi)',
            subtitle: 'Secondi da attendere prima di confermare lo switch',
            digits: 1,
            adjustment: timeoutAdjustment
        });

        // Connette il cambio di valore direttamente allo schema double
        timeoutRow.connect('changed', (spinRow) => {
            settings.set_double('timeout-seconds', spinRow.get_value());
        });
        group.add(timeoutRow);

        // 2. Opzione per attivare/disattivare il Debug tramite un Adw.SwitchRow
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

