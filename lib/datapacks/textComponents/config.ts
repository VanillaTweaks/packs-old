import minify from 'lib/datapacks/textComponents/minify';
import { tellraw } from 'sandstone';
import type { JSONTextComponent } from 'sandstone';

const configSymbols = {
	disabled: '❌',
	enabled: '✔',
	input: '✎',
	preview: 'ℹ'
} as const;

const configColors = {
	disabled: 'red',
	enabled: 'green',
	input: 'aqua',
	preview: 'gray'
} as const;

/**
 * Returns a function which runs a `tellraw @s` command for a config line.
 *
 * Examples:
 * * ```
 * configLine(...)();
 * ```
 * * ```
 * execute.as('@s').run(configLine(...));
 * ```
 */
export const configLine = (
	options: (
		{
			/** The text displayed as the name of the config option. */
			label: string,
			/**
			 * The command to run if the user clicks the preview button on this line.
			 *
			 * Leave this undefined to hide the preview button.
			 */
			previewCommand?: string
		} & (
			(
				{
					type: 'disabled' | 'enabled',
					suggestCommand?: never,
					accepts?: never,
					default?: 'Disabled' | 'Enabled',
					current?: never
				} & (
					{
						description?: never,
						runCommand?: never
					} | {
						description?: JSONTextComponent,
						runCommand: string
					}
				)
			) | {
				type: 'input',
				description: JSONTextComponent,
				suggestCommand: string,
				runCommand?: never,
				accepts?: string,
				default?: string,
				current?: {
					value: JSONTextComponent,
					unit?: string
				}
			}
		)
	)
) => {
	const color = configColors[options.type];

	const component: JSONTextComponent & {
		hoverEvent?: {
			contents: JSONTextComponent[]
		},
		extra: JSONTextComponent[]
	} = {
		text: '',
		extra: [
			{ text: `[ ${configSymbols[options.type]} ]`, color },
			' '
		]
	};

	if (options.suggestCommand || options.runCommand) {
		component.hoverEvent = {
			action: 'show_text',
			contents: ['']
		};

		if (options.type === 'disabled') {
			component.hoverEvent.contents.push(
				{ text: 'Click to enable ', color: configColors.enabled },
				options.label,
				{ text: '.', color: configColors.enabled }
			);
		} else if (options.type === 'enabled') {
			component.hoverEvent.contents.push(
				{ text: 'Click to disable ', color: configColors.disabled },
				options.label,
				{ text: '.', color: configColors.disabled }
			);
		}

		if (options.description) {
			if (component.hoverEvent.contents.length > 1) {
				component.hoverEvent.contents.push('\n');
			}

			if (typeof options.description === 'string') {
				component.hoverEvent.contents.push(
					{ text: options.description, color: 'gray' }
				);
			} else {
				component.hoverEvent.contents.push(options.description);
			}
		}

		if (options.accepts) {
			component.hoverEvent.contents.push(
				{ text: `\nAccepts: ${options.accepts}`, color: 'dark_gray' }
			);
		}

		if (options.default) {
			component.hoverEvent.contents.push(
				{ text: `\nDefault: ${options.default}`, color: 'dark_gray' }
			);
		}
	}

	if (options.previewCommand) {
		component.extra.push(
			{
				text: `[ ${configSymbols[options.type]} ]`,
				color: configColors.preview,
				hoverEvent: {
					action: 'show_text',
					contents: [
						'',
						{ text: 'Click to preview ', color: configColors.preview },
						options.label,
						{ text: '.', color: configColors.preview }
					]
				},
				clickEvent: {
					action: 'run_command',
					value: `/${options.previewCommand}`
				}
			},
			' '
		);
	}

	if (options.suggestCommand) {
		component.clickEvent = {
			action: 'suggest_command',
			value: `/${options.suggestCommand}`
		};
	} else if (options.runCommand) {
		component.clickEvent = {
			action: 'run_command',
			value: `/${options.runCommand}`
		};
	}

	component.extra.push(options.label);

	if (options.current) {
		component.extra.push({
			text: ' (Current: ',
			color: 'gray',
			extra: [
				options.current.value,
				`${options.current.unit || ''})`
			]
		});
	}
	return () => {
		tellraw('@s', [
			'',
			minify(component)
		]);
	};
};