import { pack, packState } from 'lib/datapacks/pack';
import { BasePath, scoreboard } from 'sandstone';
import type { AdvancementInstance, AdvancementJSON, MCFunctionInstance, BasePathInstance } from 'sandstone';

export type VTBasePathOptions = {
	/** The string to be used to prefix scoreboard objective names and entity tags, and to identify NBT tags. */
	shortName?: string
};

/** The properties of all `VTBasePath`s which are not on `BasePathInstance`. */
export type VTBasePathProperties = {
	/**
	 * Get a child path of the current `BasePath`.
	 *
	 * The namespace cannot be provided in a child path.
	 */
	child: (...args: Parameters<BasePathInstance['child']>) => VTBasePath,
	/**
	 * Adds an Advancement to be used only for the sake of its reward function.
	 *
	 * Use this instead of Advancement whenever applicable.
	 */
	FunctionalAdvancement: (name: string, criterion: AdvancementJSON['criteria'][0], ...args: (
		[MCFunctionInstance]
		| Parameters<typeof pack.MCFunction>
	)) => AdvancementInstance
};

/** A VT `BasePath`. */
export type VTBasePath = (
	BasePathInstance extends (...args: infer Args) => infer ReturnValue
		? (
			((...args: Args) => ReturnValue)
			& Omit<BasePathInstance, 'child'>
			& VTBasePathProperties
		)
		: never
);

/**
 * Any function `shortMCFunction(callback)` which acts like:
 * ```
 * MCFunction(someImplicitBasePath, callback)
 * ```
 */
export type ShortMCFunction = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	callback: () => ReturnValue
) => MCFunctionInstance<ReturnValue>;

/**
 * Any function `eventMCFunction(callback, onConflict)` which acts like:
 * ```
 * MCFunction(someImplicitBasePath, callback, { onConflict })
 * ```
 *
 * Like `ShortMCFunction` but with an extra `onConflict` parameter.
 */
export type EventMCFunction = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	callback: () => ReturnValue,
	onConflict?: 'append' | 'prepend'
) => MCFunctionInstance<ReturnValue>;

/** The properties of all `RootVTBasePath`s which are not on `VTBasePath`s. */
type RootVTBasePathProperties = {
	/**
	 * A child of this `BasePath` whose directory is named to discourage users from running functions and function tags created in it.
	 *
	 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
	 *
	 * ⚠️ Please use `basePath_` instead of `basePath.internal` wherever possible.
	 */
	internal: VTBasePath,
	options: VTBasePathOptions,
	/** Adds code to the pack's load function. */
	onLoad: EventMCFunction,
	/** Adds code to the pack's uninstall function. */
	onUninstall: EventMCFunction,
	/**
	 * A template tag function which prepends the `BasePath`'s `options.shortName` to the input, separated by a period.
	 *
	 * This should always be used instead of writing a `BasePath`'s short name prefix explicitly.
	 *
	 * Example:
	 * ```
	 * VT.pre`example` === 'vt.example' // true
	 * ```
	 */
	pre: (template: TemplateStringsArray, ...substitutions: any[]) => string,
	/** Sets the pack's config function. */
	ConfigFunction: ShortMCFunction
};

/** A VT `BasePath` which was *not* returned from `basePath.child(...)`. Extends `VTBasePath`. */
export type RootVTBasePath = VTBasePath & RootVTBasePathProperties;

/** This function extends `BasePath`s and should wrap every new instance of one. */
export const useVT = (
	basePath: BasePathInstance,
	options: VTBasePathOptions = {}
): RootVTBasePath => {
	const originalChildFunction = basePath.child.bind(basePath);

	/** Properties assigned to all `VTBasePath`s. */
	const vtProperties: VTBasePathProperties = {
		// `useVT` normally returns a `RootVTBasePath`, but child `BasePath`s should not be `RootVTBasePath`s, so the assertion `as VTBasePath` is necessary.
		child: (...args) => useVT(originalChildFunction(...args)) as VTBasePath,
		FunctionalAdvancement: (name, criterion, ...args) => self.Advancement(name, {
			display: {
				icon: {
					item: 'minecraft:air'
				},
				title: '',
				description: '',
				show_toast: false,
				announce_to_chat: false,
				hidden: true
			},
			criteria: {
				[`${self.namespace}:${name}`]: criterion
			},
			rewards: {
				function: (
					typeof args[0] === 'function'
						? args[0]
						// The below type assertion sucks, but I don't think there's a better way. If there is then please tell me.
						: pack.internal.MCFunction(...args as unknown as Parameters<typeof pack.MCFunction>)
				)
			}
		})
	};

	const self: VTBasePath = Object.assign(basePath, vtProperties);

	if (!basePath.directory) {
		/** Properties assigned to all `RootVTBasePath`s. */
		const vtRootProperties: RootVTBasePathProperties = {
			options,
			internal: self.child({ directory: 'zz/do_not_run_or_the_pack_may_break' }),
			onLoad: (callback, onConflict = 'append') => rootSelf.internal.MCFunction('load', callback, {
				runOnLoad: true,
				onConflict
			}),
			onUninstall: (callback, onConflict = 'prepend') => {
				if (rootSelf.namespace === pack.namespace) {
					packState.hasUninstallFunction = true;
				}
				return rootSelf.MCFunction('uninstall', callback, {
					tags: [VT.Tag('functions', 'uninstall')],
					onConflict
				});
			},
			pre: (template, ...substitutions) => options.shortName + template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join(''),
			ConfigFunction: callback => {
				if (rootSelf.namespace === pack.namespace) {
					packState.hasConfigFunction = true;
				}
				return rootSelf.MCFunction('config', callback);
			}
		};

		const rootSelf: RootVTBasePath = Object.assign(self, vtRootProperties);

		return rootSelf;
	}

	// `self` is not actually a `RootVTBasePath`, but `vtProperties.child` should be the only case where this `return` is executed, in which case it is asserted back `as VTBasePath`.
	return self as RootVTBasePath;
};

/** Properties only assigned to the `BasePath` for the VT namespace. */
const vtProperties = {
	temp: {
		toString: () => {
			pack.onLoad(() => {
				scoreboard.objectives.add(VT.pre`temp`, 'dummy');
			}, 'prepend');

			VT.onUninstall(() => {
				scoreboard.objectives.remove(VT.pre`temp`);
			}, 'append');

			return VT.pre`temp`;
		},
		get length() {
			return vtProperties.temp.toString().length;
		}
	} as string
} as {
	/**
	 * When stringified, evaluates to `'vt.temp'`, the name of the VT temp scoreboard objective, and creates that objective if it has not already been created.
	 *
	 * For scoreboard objective names, this should always be used instead of `VT.pre` or `'vt.temp'`.
	 */
	temp: string
};

/** The `BasePath` for the Vanilla Tweaks namespace. */
export const VT: RootVTBasePath & typeof vtProperties = Object.assign(
	useVT(
		BasePath({
			namespace: 'vanillatweaks'
			// TODO: Uncomment this when it is implemented.
			// onConflict: {
			// 	// I don't remember why I set these.
			// 	mcfunction: 'ignore',
			// 	tag: 'ignore'
			// }
		}),
		{
			shortName: 'vt'
		}
	),
	vtProperties
);

/**
 * A child `BasePath` of `VT` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
 */
export const VT_ = VT.internal;