import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface SelectionParserSettings {
	debug: boolean;
}

const DEFAULT_SETTINGS: SelectionParserSettings = {
	debug: false
}

export function parseTimestamp(text: string): string | null {
	// Extract numbers from text (handle cases like "s_at_ms": 1755599313784)
	const numberMatch = text.match(/\d{10,13}/);
	if (!numberMatch) {
		return null;
	}
	
	const timestamp = parseInt(numberMatch[0]);
	
	// Check if it's a valid timestamp (reasonable range)
	// Timestamps should be between 2001 and 2100
	const minTimestamp = 978307200; // 2001-01-01
	const maxTimestamp = 4102444800; // 2100-01-01
	
	let timestampInSeconds: number;
	
	// Determine if it's milliseconds (13 digits) or seconds (10 digits)
	if (timestamp.toString().length === 13) {
		timestampInSeconds = Math.floor(timestamp / 1000);
	} else if (timestamp.toString().length === 10) {
		timestampInSeconds = timestamp;
	} else {
		return null;
	}
	
	// Validate range
	if (timestampInSeconds < minTimestamp || timestampInSeconds > maxTimestamp) {
		return null;
	}
	
	// Convert to ISO string
	const date = new Date(timestampInSeconds * 1000);
	return date.toISOString().replace('.000Z', 'Z');
}

export default class SelectionParserPlugin extends Plugin {
	settings: SelectionParserSettings;
	private debounceTimer: number | null = null;
	private statusBarItemEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('');
		this.statusBarItemEl.addClass('clickable-icon');
		this.statusBarItemEl.addEventListener('click', () => {
			const text = this.statusBarItemEl.getText();
			if (text) {
				navigator.clipboard.writeText(text);
				new Notice('Timestamp copied to clipboard');
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.

		// Debounced selection change listener (300ms delay)
		this.registerDomEvent(document, 'selectionchange', () => {
			if (this.debounceTimer) {
				window.clearTimeout(this.debounceTimer);
			}
			this.debounceTimer = window.setTimeout(() => {
				const selection = window.getSelection();
				if (selection && selection.toString().trim()) {
					this.handleSelection(selection.toString());
				}
			}, 300);
		});

		// Mouse up listener for immediate selection end detection
		this.registerDomEvent(document, 'mouseup', () => {
			// Small delay to ensure selection is finalized
			setTimeout(() => {
				const selection = window.getSelection();
				if (selection && selection.toString().trim()) {
					this.handleSelection(selection.toString());
				}
			}, 10);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	private handleSelection(selectedText: string) {
		if (this.settings.debug) {
			console.log('Selected text:', selectedText);
		}
		
		const parsedTimestamp = parseTimestamp(selectedText);
		if (parsedTimestamp) {
			this.statusBarItemEl.setText(parsedTimestamp);
		} else {
			this.statusBarItemEl.setText('');
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: SelectionParserPlugin;

	constructor(app: App, plugin: SelectionParserPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Debug')
			.setDesc('Enable debug logging of selected text to console')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debug)
				.onChange(async (value) => {
					this.plugin.settings.debug = value;
					await this.plugin.saveSettings();
				}));
	}
}
