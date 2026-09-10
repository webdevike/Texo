import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { IconActivity, IconArrowDown, IconArrowUp, IconBuilding, IconCalendar, IconChartBar, IconCheck, IconFilter, IconFocus2, IconGripHorizontal, IconGripVertical, IconHeart, IconHeartFilled, IconLink, IconList, IconPencil, IconPlayerStop, IconPlus, IconRocket, IconSearch, IconShieldCheck, IconShieldCheckFilled, IconSitemap, IconSparkles, IconSparklesFilled, IconToggleLeft, IconTrash, IconTypography, IconUsers, IconX } from "@tabler/icons-react";
import { Component, createContext, createElement, memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer } from "@tanstack/react-virtual";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
//#endregion
//#region src/mantine.ts
var mantine_exports = /* @__PURE__ */ __exportAll({});
import * as import__mantine_core from "@mantine/core";
__reExport(mantine_exports, import__mantine_core);
import * as import__mantine_code_highlight from "@mantine/code-highlight";
__reExport(mantine_exports, import__mantine_code_highlight);
import * as import__mantine_hooks from "@mantine/hooks";
__reExport(mantine_exports, import__mantine_hooks);
//#endregion
//#region src/components.ts
var BaseAccordion = mantine_exports.Accordion;
var BaseActionIcon = mantine_exports.ActionIcon;
var BaseAppShell = mantine_exports.AppShell;
var BaseBadge = mantine_exports.Badge;
var BaseCode = mantine_exports.Code;
var BaseCollapse = mantine_exports.Collapse;
var BaseBox = mantine_exports.Box;
var BaseCodeHighlight = mantine_exports.CodeHighlight;
var BaseCombobox = mantine_exports.Combobox;
var BaseComboboxPopover = mantine_exports.ComboboxPopover;
var BaseColorInput = mantine_exports.ColorInput;
var BaseButton = mantine_exports.Button;
var BaseCheckbox = mantine_exports.Checkbox;
var BaseCard = mantine_exports.Card;
var BaseDrawer = mantine_exports.Drawer;
var BaseFieldset = mantine_exports.Fieldset;
var BaseCenter = mantine_exports.Center;
var BaseGroup = mantine_exports.Group;
var BaseInputBase = mantine_exports.InputBase;
var BaseMenu = mantine_exports.Menu;
var BaseMultiSelect = mantine_exports.MultiSelect;
var BaseModal = mantine_exports.Modal;
var BaseKbd = mantine_exports.Kbd;
var BaseNavLink = mantine_exports.NavLink;
var BaseNumberInput = mantine_exports.NumberInput;
var BaseSelect = mantine_exports.Select;
var BaseScroller = mantine_exports.Scroller;
var BaseStack = mantine_exports.Stack;
var BaseScrollArea = mantine_exports.ScrollArea;
var BaseSwitch = mantine_exports.Switch;
var BaseTable = mantine_exports.Table;
var BaseTabs = mantine_exports.Tabs;
var BaseText = mantine_exports.Text;
var BaseTextInput = mantine_exports.TextInput;
var BaseTextarea = mantine_exports.Textarea;
var BaseTitle = mantine_exports.Title;
var BaseTooltip = mantine_exports.Tooltip;
var BaseTree = mantine_exports.Tree;
var BaseCloseButton = mantine_exports.CloseButton;
var BaseDivider = mantine_exports.Divider;
var BaseLoader = mantine_exports.Loader;
var BaseNotification = mantine_exports.Notification;
var BasePill = mantine_exports.Pill;
var BasePopover = mantine_exports.Popover;
var BaseAlert = mantine_exports.Alert;
var BaseAnchor = mantine_exports.Anchor;
var BaseBurger = mantine_exports.Burger;
var BaseContainer = mantine_exports.Container;
var BaseGrid = mantine_exports.Grid;
var BaseHoverCard = mantine_exports.HoverCard;
var BaseImage = mantine_exports.Image;
var BaseNativeSelect = mantine_exports.NativeSelect;
var BasePagination = mantine_exports.Pagination;
var BasePaper = mantine_exports.Paper;
var BasePasswordInput = mantine_exports.PasswordInput;
var BasePinInput = mantine_exports.PinInput;
var BaseSimpleGrid = mantine_exports.SimpleGrid;
var BaseThemeIcon = mantine_exports.ThemeIcon;
var BaseTimeline = mantine_exports.Timeline;
var BaseUnstyledButton = mantine_exports.UnstyledButton;
//#endregion
//#region src/hooks.ts
var useBaseCombobox = mantine_exports.useCombobox;
var useBaseDisclosure = mantine_exports.useDisclosure;
var useBaseDocumentTitle = mantine_exports.useDocumentTitle;
var useBaseLocalStorage = mantine_exports.useLocalStorage;
var useBaseMediaQuery = mantine_exports.useMediaQuery;
var useBaseMounted = mantine_exports.useMounted;
var useBaseViewportSize = mantine_exports.useViewportSize;
//#endregion
//#region src/theme.ts
var theme = (0, mantine_exports.createTheme)({
	primaryColor: "blue",
	defaultRadius: "md",
	fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
	headings: { fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif" }
});
//#endregion
//#region src/provider.tsx
function BaseProvider({ children, themeOverride = {}, ...props }) {
	return /* @__PURE__ */ jsx(mantine_exports.MantineProvider, {
		theme: (0, mantine_exports.mergeThemeOverrides)(theme, themeOverride),
		...props,
		children
	});
}
var texo_app_shell_module_default = {
	root: "_root_15bon_3",
	sidebar: "_sidebar_15bon_12",
	actions: "_actions_15bon_20",
	previewTabs: "_previewTabs_15bon_21",
	workspace: "_workspace_15bon_29",
	footer: "_footer_15bon_41",
	canvas: "_canvas_15bon_58"
};
//#endregion
//#region src/texo-app-shell.tsx
var SIDEBAR_WIDTH = 240;
/** Linear-style shell: one sidebar on a quiet surface, the workspace as an inset card. */
function TexoAppShell({ actions, children, footer, previewTabs, sidebar }) {
	const variables = { "--texo-sidebar-width": `${SIDEBAR_WIDTH}px` };
	return /* @__PURE__ */ jsxs(BaseBox, {
		className: texo_app_shell_module_default.root,
		style: variables,
		children: [
			/* @__PURE__ */ jsx(BaseBox, {
				component: "nav",
				"aria-label": "Sidebar",
				className: texo_app_shell_module_default.sidebar,
				children: sidebar
			}),
			/* @__PURE__ */ jsxs(BaseBox, {
				className: texo_app_shell_module_default.workspace,
				children: [
					/* @__PURE__ */ jsx(BaseBox, {
						className: texo_app_shell_module_default.actions,
						children: actions
					}),
					/* @__PURE__ */ jsx(BaseBox, {
						className: texo_app_shell_module_default.previewTabs,
						children: previewTabs
					}),
					/* @__PURE__ */ jsx(BaseBox, {
						component: "main",
						className: texo_app_shell_module_default.canvas,
						children
					})
				]
			}),
			footer ? /* @__PURE__ */ jsx(BaseBox, {
				className: texo_app_shell_module_default.footer,
				children: footer
			}) : null
		]
	});
}
//#endregion
//#region src/texo-panel.tsx
function TexoPanel({ children, contained = false, gutter = 16, onClose, opened, title }) {
	const [height, setHeight] = useState(320);
	useEffect(() => {
		if (!opened) return;
		const closeOnEscape = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [onClose, opened]);
	const startResize = (event) => {
		event.preventDefault();
		const startY = event.clientY;
		const startHeight = height;
		const resize = (pointerEvent) => {
			setHeight(Math.min(window.innerHeight - 96, Math.max(180, startHeight + startY - pointerEvent.clientY)));
		};
		const stopResize = () => {
			window.removeEventListener("pointermove", resize);
			window.removeEventListener("pointerup", stopResize);
		};
		window.addEventListener("pointermove", resize);
		window.addEventListener("pointerup", stopResize);
	};
	return /* @__PURE__ */ jsxs(BaseBox, {
		"aria-hidden": !opened,
		bg: "var(--mantine-color-body)",
		bottom: 0,
		component: "section",
		h: height,
		left: contained ? "50%" : `calc(var(--texo-navbar-width, 0px) + ${8 + gutter}px)`,
		pos: contained ? "absolute" : "fixed",
		right: contained ? void 0 : 8 + gutter,
		role: "dialog",
		w: contained ? "min(420px, calc(100% - 32px))" : void 0,
		style: {
			border: contained ? "1px solid var(--mantine-color-default-border)" : void 0,
			borderTop: "1px solid var(--mantine-color-default-border)",
			borderRadius: contained ? "var(--mantine-radius-default) var(--mantine-radius-default) 0 0" : void 0,
			overflow: "visible",
			pointerEvents: opened ? "auto" : "none",
			transform: opened ? contained ? "translate(-50%, 0)" : "translateY(0)" : contained ? `translate(-50%, calc(100% + ${gutter}px))` : `translateY(calc(100% + ${gutter}px))`,
			transition: "transform 180ms ease",
			zIndex: 200
		},
		children: [
			/* @__PURE__ */ jsx(BaseBox, {
				"aria-label": "Resize panel",
				bg: "var(--mantine-color-body)",
				h: 16,
				left: "50%",
				onPointerDown: startResize,
				pos: "absolute",
				role: "separator",
				top: 0,
				w: 28,
				style: {
					alignItems: "center",
					border: "1px solid var(--mantine-color-default-border)",
					borderRadius: "var(--mantine-radius-xl)",
					color: "var(--mantine-color-dimmed)",
					cursor: "row-resize",
					display: "flex",
					justifyContent: "center",
					touchAction: "none",
					transform: "translate(-50%, -50%)",
					zIndex: 1
				},
				children: /* @__PURE__ */ jsx(IconGripHorizontal, { size: 14 })
			}),
			/* @__PURE__ */ jsxs(BaseGroup, {
				h: 48,
				justify: "space-between",
				px: "md",
				children: [/* @__PURE__ */ jsx(BaseText, {
					fw: 500,
					children: title
				}), /* @__PURE__ */ jsx(BaseActionIcon, {
					"aria-label": "Close panel",
					variant: "subtle",
					onClick: onClose,
					children: /* @__PURE__ */ jsx(IconX, { size: 16 })
				})]
			}),
			/* @__PURE__ */ jsx(BaseBox, {
				h: "calc(100% - 48px)",
				style: { overflow: "auto" },
				children
			})
		]
	});
}
//#endregion
//#region src/texo-component.tsx
function defineTexoComponent(definition) {
	return definition;
}
var TexoComponentErrorBoundary = class extends Component {
	constructor(..._args) {
		super(..._args);
		this.state = { error: null };
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	componentDidCatch(_error, _info) {}
	render() {
		if (this.state.error) return /* @__PURE__ */ jsx(BaseCard, {
			padding: "md",
			withBorder: true,
			children: /* @__PURE__ */ jsxs(BaseStack, {
				gap: 4,
				children: [/* @__PURE__ */ jsxs(BaseText, {
					fw: 600,
					children: ["Could not render ", this.props.componentName]
				}), /* @__PURE__ */ jsx(BaseText, {
					c: "dimmed",
					size: "sm",
					children: this.state.error.message
				})]
			})
		});
		return this.props.children;
	}
};
function TexoComponent({ id, props, registry }) {
	const definition = registry[id];
	if (!definition) return /* @__PURE__ */ jsx(BaseCard, {
		padding: "md",
		withBorder: true,
		children: /* @__PURE__ */ jsxs(BaseText, {
			c: "dimmed",
			children: ["Unknown component: ", id]
		})
	});
	const componentProps = {
		...definition.defaultProps,
		...props
	};
	return /* @__PURE__ */ jsx(TexoComponentErrorBoundary, {
		componentName: definition.name,
		children: createElement(definition.component, componentProps)
	}, id);
}
//#endregion
//#region src/texo-icons.tsx
var TEXO_ICONS = {
	activity: IconActivity,
	building: IconBuilding,
	chart: IconChartBar,
	heart: IconHeart,
	rocket: IconRocket,
	shield: IconShieldCheck,
	sparkles: IconSparkles,
	users: IconUsers
};
var TEXO_FILLED_ICONS = {
	heart: IconHeartFilled,
	shield: IconShieldCheckFilled,
	sparkles: IconSparklesFilled
};
function TexoIcon({ value, ...props }) {
	const OutlineIcon = TEXO_ICONS[value.name] ?? IconActivity;
	const FilledIcon = TEXO_FILLED_ICONS[value.name];
	const Icon = value.variant === "filled" && FilledIcon ? FilledIcon : OutlineIcon;
	return /* @__PURE__ */ jsx(Icon, {
		...props,
		stroke: value.variant === "outline" ? value.stroke : void 0
	});
}
function TexoIconPicker({ label, onChange, value }) {
	const selectedName = value.name in TEXO_ICONS ? value.name : "activity";
	const supportsFilled = selectedName in TEXO_FILLED_ICONS;
	const selectedValue = {
		name: selectedName,
		stroke: Number.isFinite(value.stroke) ? value.stroke : 1.75,
		variant: value.variant === "filled" && supportsFilled ? "filled" : "outline"
	};
	return /* @__PURE__ */ jsxs(BaseStack, {
		gap: "xs",
		children: [
			/* @__PURE__ */ jsx(BaseComboboxPopover, {
				allowDeselect: false,
				data: Object.keys(TEXO_ICONS).map((name) => ({
					label: name,
					value: name
				})),
				onChange: (nextValue) => nextValue && onChange({
					...selectedValue,
					name: nextValue,
					variant: nextValue in TEXO_FILLED_ICONS ? selectedValue.variant : "outline"
				}),
				renderOption: ({ option }) => /* @__PURE__ */ jsxs(BaseGroup, {
					gap: "xs",
					children: [/* @__PURE__ */ jsx(TexoIcon, {
						value: {
							name: option.value,
							stroke: 1.75,
							variant: "outline"
						},
						size: 16
					}), /* @__PURE__ */ jsx(BaseText, {
						size: "sm",
						tt: "capitalize",
						children: option.label
					})]
				}),
				searchable: true,
				value: selectedName,
				children: /* @__PURE__ */ jsx(BaseComboboxPopover.Target, { children: /* @__PURE__ */ jsx(BaseInputBase, {
					label,
					leftSection: /* @__PURE__ */ jsx(TexoIcon, {
						value: selectedValue,
						size: 16
					}),
					pointer: true,
					readOnly: true,
					rightSection: /* @__PURE__ */ jsx(BaseCombobox.Chevron, {}),
					value: selectedName
				}) })
			}),
			/* @__PURE__ */ jsx(BaseSelect, {
				data: [{
					label: "Outline",
					value: "outline"
				}, {
					disabled: !supportsFilled,
					label: "Filled",
					value: "filled"
				}],
				label: "Variant",
				onChange: (variant) => variant && onChange({
					...selectedValue,
					variant
				}),
				value: selectedValue.variant
			}),
			selectedValue.variant === "outline" && /* @__PURE__ */ jsx(BaseTextInput, {
				label: "Stroke width",
				max: 3,
				min: .5,
				onChange: (event) => onChange({
					...selectedValue,
					stroke: Number(event.target.value)
				}),
				step: .25,
				type: "number",
				value: selectedValue.stroke
			})
		]
	});
}
var theme_components_module_default = {
	card: "_card_k8n3n_1",
	input: "_input_k8n3n_8",
	checkboxInput: "_checkboxInput_k8n3n_14",
	popover: "_popover_k8n3n_24"
};
//#endregion
//#region src/texo-theme-provider.tsx
/**
* Inline <head> script for server-rendered apps: sets the color scheme before
* hydration so the first paint matches the provider's forced scheme. Not a
* visual component, hence no Base* alias (the admin gallery renders those).
*/
var TexoColorSchemeScript = mantine_exports.ColorSchemeScript;
var TEXO_SIZE_KEYS = [
	"xs",
	"sm",
	"md",
	"lg",
	"xl"
];
var systemSans = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif";
var blue = [
	"#e7f5ff",
	"#d0ebff",
	"#a5d8ff",
	"#74c0fc",
	"#4dabf7",
	"#339af0",
	"#228be6",
	"#1c7ed6",
	"#1971c2",
	"#1864ab"
];
var cyan = [
	"#e3fafc",
	"#c5f6fa",
	"#99e9f2",
	"#66d9e8",
	"#3bc9db",
	"#22b8cf",
	"#15aabf",
	"#1098ad",
	"#0c8599",
	"#0b7285"
];
var teal = [
	"#e6fcf5",
	"#c3fae8",
	"#96f2d7",
	"#63e6be",
	"#38d9a9",
	"#20c997",
	"#12b886",
	"#0ca678",
	"#099268",
	"#087f5b"
];
var violet = [
	"#f3f0ff",
	"#e5dbff",
	"#d0bfff",
	"#b197fc",
	"#9775fa",
	"#845ef7",
	"#7950f2",
	"#7048e8",
	"#6741d9",
	"#5f3dc4"
];
var pink = [
	"#fff0f6",
	"#ffdeeb",
	"#fcc2d7",
	"#faa2c1",
	"#f783ac",
	"#f06595",
	"#e64980",
	"#d6336c",
	"#c2255c",
	"#a61e4d"
];
var orange = [
	"#fff4e6",
	"#ffe8cc",
	"#ffd8a8",
	"#ffc078",
	"#ffa94d",
	"#ff922b",
	"#fd7e14",
	"#f76707",
	"#e8590c",
	"#d9480f"
];
var defaultConfig = {
	autoContrast: true,
	chartColors: [
		"#228be6",
		"#15aabf",
		"#7950f2",
		"#fd7e14",
		"#e64980"
	],
	colorScheme: "light",
	cursorType: "pointer",
	effects: {
		cardShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
		controlShadow: "none"
	},
	defaultRadius: "md",
	focusRing: "auto",
	fontFamily: systemSans,
	fontFamilyHeadings: systemSans,
	fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, monospace",
	fontSizes: {
		xs: "0.75rem",
		sm: "0.875rem",
		md: "1rem",
		lg: "1.125rem",
		xl: "1.25rem"
	},
	fontSmoothing: true,
	lineHeights: {
		xs: "1.4",
		sm: "1.45",
		md: "1.55",
		lg: "1.6",
		xl: "1.65"
	},
	luminanceThreshold: .3,
	primaryColor: "blue",
	primaryPalette: blue,
	primaryShade: {
		light: 6,
		dark: 8
	},
	radius: {
		xs: "0.125rem",
		sm: "0.25rem",
		md: "0.5rem",
		lg: "0.75rem",
		xl: "1rem"
	},
	respectReducedMotion: true,
	scale: 1,
	semantic: {
		light: {
			body: "#ffffff",
			border: "#dee2e6",
			card: "#ffffff",
			dimmed: "#868e96",
			input: "#ffffff",
			muted: "#f1f3f5",
			placeholder: "#adb5bd",
			popover: "#ffffff",
			surface: "#f8f9fa",
			text: "#212529"
		},
		dark: {
			body: "#1a1b1e",
			border: "#373a40",
			card: "#1a1b1e",
			dimmed: "#909296",
			input: "#25262b",
			muted: "#2c2e33",
			placeholder: "#5c5f66",
			popover: "#25262b",
			surface: "#25262b",
			text: "#c1c2c5"
		}
	},
	shadows: {
		xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
		sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
		md: "0 4px 12px rgba(0, 0, 0, 0.10)",
		lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
		xl: "0 16px 40px rgba(0, 0, 0, 0.14)"
	},
	spacing: {
		xs: "0.625rem",
		sm: "0.75rem",
		md: "1rem",
		lg: "1.25rem",
		xl: "2rem"
	},
	sidebar: {
		activeIndicator: "subtle",
		collapsible: true,
		density: "comfortable",
		hierarchy: "flat",
		nestedIndent: "default",
		sections: "labeled",
		width: "default"
	},
	table: {
		borders: "horizontal",
		density: "comfortable",
		header: "muted",
		hover: true,
		stickyHeader: false,
		striped: false
	}
};
function preset(value, label, overrides) {
	return {
		value,
		label,
		config: {
			...defaultConfig,
			...overrides,
			primaryShade: {
				...defaultConfig.primaryShade,
				...overrides.primaryShade
			},
			semantic: {
				light: {
					...defaultConfig.semantic.light,
					...overrides.semantic?.light
				},
				dark: {
					...defaultConfig.semantic.dark,
					...overrides.semantic?.dark
				}
			}
		}
	};
}
var TEXO_THEME_PRESETS = [
	preset("default", "Default", {}),
	preset("ocean", "Ocean", {
		primaryColor: "cyan",
		primaryPalette: cyan,
		defaultRadius: "lg",
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#fafdff",
				surface: "#eef8fc"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#102027",
				surface: "#142a33"
			}
		}
	}),
	preset("forest", "Forest", {
		primaryColor: "teal",
		primaryPalette: teal,
		defaultRadius: "sm",
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#fbfdfb",
				surface: "#f0f7f2"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#17201a",
				surface: "#1d2921"
			}
		}
	}),
	preset("violet", "Violet", {
		primaryColor: "violet",
		primaryPalette: violet,
		defaultRadius: "xl",
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#fdfcff",
				surface: "#f5f1ff"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#1d1925",
				surface: "#282132"
			}
		}
	}),
	preset("amber-minimal", "Amber Minimal", {
		effects: {
			cardShadow: "none",
			controlShadow: "none"
		},
		primaryColor: "orange",
		primaryPalette: orange,
		defaultRadius: "xs",
		fontFamily: "Inter, Arial, sans-serif",
		fontFamilyHeadings: "Inter, Arial, sans-serif",
		radius: {
			xs: "0",
			sm: "0.125rem",
			md: "0.25rem",
			lg: "0.375rem",
			xl: "0.5rem"
		},
		shadows: {
			xs: "none",
			sm: "none",
			md: "none",
			lg: "none",
			xl: "none"
		},
		spacing: {
			xs: "0.5rem",
			sm: "0.625rem",
			md: "0.875rem",
			lg: "1.125rem",
			xl: "1.75rem"
		}
	}),
	preset("bold-tech", "Bold Tech", {
		primaryColor: "violet",
		primaryPalette: violet,
		defaultRadius: "sm",
		fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
		fontFamilyHeadings: "Arial Black, Arial, sans-serif",
		fontSizes: {
			xs: "0.6875rem",
			sm: "0.8125rem",
			md: "0.9375rem",
			lg: "1.125rem",
			xl: "1.375rem"
		},
		radius: {
			xs: "0",
			sm: "0.2rem",
			md: "0.35rem",
			lg: "0.5rem",
			xl: "0.75rem"
		},
		shadows: {
			xs: "2px 2px 0 rgba(0, 0, 0, 0.9)",
			sm: "3px 3px 0 rgba(0, 0, 0, 0.9)",
			md: "5px 5px 0 rgba(0, 0, 0, 0.9)",
			lg: "7px 7px 0 rgba(0, 0, 0, 0.9)",
			xl: "10px 10px 0 rgba(0, 0, 0, 0.9)"
		},
		effects: {
			cardShadow: "5px 5px 0 rgba(0, 0, 0, 0.9)",
			controlShadow: "3px 3px 0 rgba(0, 0, 0, 0.9)"
		}
	}),
	preset("bubblegum", "Bubblegum", {
		primaryColor: "pink",
		primaryPalette: pink,
		defaultRadius: "xl",
		fontFamily: "Trebuchet MS, Arial, sans-serif",
		fontFamilyHeadings: "Trebuchet MS, Arial, sans-serif",
		radius: {
			xs: "0.375rem",
			sm: "0.625rem",
			md: "0.875rem",
			lg: "1.25rem",
			xl: "2rem"
		},
		shadows: {
			xs: "0 1px 2px rgba(214, 51, 108, 0.08)",
			sm: "0 3px 8px rgba(214, 51, 108, 0.12)",
			md: "0 8px 20px rgba(214, 51, 108, 0.16)",
			lg: "0 14px 32px rgba(214, 51, 108, 0.18)",
			xl: "0 24px 48px rgba(214, 51, 108, 0.22)"
		},
		effects: {
			cardShadow: "0 8px 20px rgba(214, 51, 108, 0.16)",
			controlShadow: "4px 5px 0 rgba(214, 51, 108, 0.32)"
		},
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#f8e8f1",
				border: "#d63384",
				card: "#fff0cf",
				input: "#fff0cf",
				muted: "#b2e1eb",
				popover: "#fff8e7",
				surface: "#fff0f6",
				text: "#5b4b4b"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#281d26",
				border: "#f06595",
				card: "#33252d",
				input: "#33252d",
				muted: "#21444b",
				popover: "#352530",
				surface: "#352530",
				text: "#fff0f6"
			}
		}
	}),
	preset("attio", "Attio", {
		primaryColor: "blue",
		primaryPalette: blue,
		defaultRadius: "md",
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
		fontFamilyHeadings: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
		radius: {
			xs: "0.1875rem",
			sm: "0.375rem",
			md: "0.625rem",
			lg: "0.875rem",
			xl: "1.25rem"
		},
		shadows: {
			xs: "0 1px 2px rgba(20, 23, 31, 0.04)",
			sm: "0 2px 8px rgba(20, 23, 31, 0.06)",
			md: "0 12px 32px rgba(20, 23, 31, 0.10)",
			lg: "0 20px 48px rgba(20, 23, 31, 0.12)",
			xl: "0 28px 64px rgba(20, 23, 31, 0.16)"
		},
		effects: {
			cardShadow: "none",
			controlShadow: "none"
		},
		sidebar: {
			activeIndicator: "subtle",
			collapsible: true,
			density: "compact",
			hierarchy: "tree",
			nestedIndent: "tight",
			sections: "collapsible",
			width: "compact"
		},
		table: {
			borders: "grid",
			density: "compact",
			header: "plain",
			hover: true,
			stickyHeader: true,
			striped: false
		},
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#ffffff",
				border: "#e6e7ea",
				card: "#ffffff",
				dimmed: "#92959d",
				input: "#ffffff",
				muted: "#f3f4f6",
				placeholder: "#a7aab1",
				popover: "#ffffff",
				surface: "#f7f7f8",
				text: "#202124"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#17181b",
				border: "#34363c",
				card: "#202126",
				dimmed: "#9699a2",
				input: "#202126",
				muted: "#292b30",
				placeholder: "#6f727a",
				popover: "#24252a",
				surface: "#1d1e22",
				text: "#f1f2f4"
			}
		}
	}),
	preset("caffeine", "Caffeine", {
		primaryColor: "orange",
		primaryPalette: orange,
		defaultRadius: "md",
		fontFamily: "Georgia, serif",
		fontFamilyHeadings: "Georgia, serif",
		radius: {
			xs: "0.125rem",
			sm: "0.25rem",
			md: "0.375rem",
			lg: "0.5rem",
			xl: "0.75rem"
		},
		shadows: {
			xs: "0 1px 2px rgba(71, 48, 35, 0.08)",
			sm: "0 2px 6px rgba(71, 48, 35, 0.10)",
			md: "0 6px 16px rgba(71, 48, 35, 0.12)",
			lg: "0 12px 28px rgba(71, 48, 35, 0.14)",
			xl: "0 20px 40px rgba(71, 48, 35, 0.18)"
		},
		effects: {
			cardShadow: "0 6px 16px rgba(71, 48, 35, 0.12)",
			controlShadow: "2px 3px 0 rgba(71, 48, 35, 0.18)"
		},
		semantic: {
			light: {
				...defaultConfig.semantic.light,
				body: "#fffaf3",
				border: "#d8c3ad",
				surface: "#f4eadf",
				text: "#473023"
			},
			dark: {
				...defaultConfig.semantic.dark,
				body: "#211914",
				border: "#6f5545",
				surface: "#2d211a",
				text: "#f5e7d8"
			}
		}
	})
];
var TexoThemeContext = createContext(null);
function TexoThemeProvider({ children, initial, onChange }) {
	const [history, setHistory] = useState({
		future: [],
		past: [],
		present: initial?.config ?? TEXO_THEME_PRESETS[0].config,
		preset: initial?.preset ?? TEXO_THEME_PRESETS[0].value
	});
	const seeded = useRef(true);
	useEffect(() => {
		if (seeded.current) {
			seeded.current = false;
			return;
		}
		onChange?.(history.present, history.preset);
	}, [history.present, history.preset]);
	const updateConfig = (update) => {
		setHistory((current) => ({
			future: [],
			past: [...current.past, current.present],
			present: update(current.present),
			preset: "custom"
		}));
	};
	const applyPreset = (presetName) => {
		const selected = TEXO_THEME_PRESETS.find((item) => item.value === presetName);
		if (!selected) return;
		setHistory((current) => ({
			future: [],
			past: [...current.past, current.present],
			present: selected.config,
			preset: selected.value
		}));
	};
	const undo = () => setHistory((current) => {
		const previous = current.past.at(-1);
		if (!previous) return current;
		return {
			future: [current.present, ...current.future],
			past: current.past.slice(0, -1),
			present: previous,
			preset: "custom"
		};
	});
	const redo = () => setHistory((current) => {
		const next = current.future[0];
		if (!next) return current;
		return {
			future: current.future.slice(1),
			past: [...current.past, current.present],
			present: next,
			preset: "custom"
		};
	});
	const themeOverride = useMemo(() => ({
		autoContrast: history.present.autoContrast,
		colors: {
			[history.present.primaryColor]: history.present.primaryPalette,
			primary: history.present.primaryPalette
		},
		components: {
			Card: BaseCard.extend({ classNames: { root: theme_components_module_default.card } }),
			Checkbox: BaseCheckbox.extend({ classNames: { input: theme_components_module_default.checkboxInput } }),
			ColorInput: BaseColorInput.extend({ classNames: { input: theme_components_module_default.input } }),
			InputBase: BaseInputBase.extend({ classNames: { input: theme_components_module_default.input } }),
			Menu: BaseMenu.extend({ classNames: { dropdown: theme_components_module_default.popover } }),
			Select: BaseSelect.extend({ classNames: { input: theme_components_module_default.input } }),
			Textarea: BaseTextarea.extend({ classNames: { input: theme_components_module_default.input } }),
			TextInput: BaseTextInput.extend({ classNames: { input: theme_components_module_default.input } })
		},
		cursorType: history.present.cursorType,
		defaultRadius: history.present.defaultRadius,
		focusRing: history.present.focusRing,
		fontFamily: history.present.fontFamily,
		fontFamilyMonospace: history.present.fontFamilyMonospace,
		fontSizes: history.present.fontSizes,
		fontSmoothing: history.present.fontSmoothing,
		headings: { fontFamily: history.present.fontFamilyHeadings },
		lineHeights: history.present.lineHeights,
		luminanceThreshold: history.present.luminanceThreshold,
		primaryColor: history.present.primaryColor,
		primaryShade: history.present.primaryShade,
		radius: history.present.radius,
		respectReducedMotion: history.present.respectReducedMotion,
		scale: history.present.scale,
		shadows: history.present.shadows,
		spacing: history.present.spacing
	}), [history.present]);
	const cssVariablesResolver = useMemo(() => () => ({
		variables: {
			"--texo-sidebar-active-background": history.present.sidebar.activeIndicator === "text" ? "transparent" : history.present.sidebar.activeIndicator === "fill" ? "var(--mantine-primary-color-filled)" : "var(--mantine-primary-color-light)",
			"--texo-sidebar-active-color": history.present.sidebar.activeIndicator === "fill" ? "var(--mantine-primary-color-contrast)" : "var(--mantine-primary-color-light-color)",
			"--texo-sidebar-indent": history.present.sidebar.hierarchy === "flat" ? "0px" : history.present.sidebar.nestedIndent === "tight" ? "14px" : "24px",
			"--texo-sidebar-section-display": history.present.sidebar.sections === "plain" ? "none" : "block",
			"--texo-sidebar-row-height": history.present.sidebar.density === "compact" ? "28px" : "34px",
			"--texo-sidebar-width": history.present.sidebar.width === "compact" ? "220px" : history.present.sidebar.width === "wide" ? "300px" : "260px",
			"--texo-chart-1": history.present.chartColors[0],
			"--texo-chart-2": history.present.chartColors[1],
			"--texo-chart-3": history.present.chartColors[2],
			"--texo-chart-4": history.present.chartColors[3],
			"--texo-chart-5": history.present.chartColors[4],
			"--texo-table-border-style": history.present.table.borders,
			"--texo-table-header-background": history.present.table.header === "primary" ? "var(--mantine-primary-color-light)" : history.present.table.header === "muted" ? "var(--texo-color-muted)" : "transparent",
			"--texo-table-row-height": history.present.table.density === "compact" ? "36px" : "46px"
		},
		light: {
			"--mantine-color-body": history.present.semantic.light.body,
			"--mantine-color-default": history.present.semantic.light.body,
			"--mantine-color-default-border": history.present.semantic.light.border,
			"--mantine-color-dimmed": history.present.semantic.light.dimmed,
			"--mantine-color-placeholder": history.present.semantic.light.placeholder,
			"--mantine-color-text": history.present.semantic.light.text,
			"--texo-color-card": history.present.semantic.light.card,
			"--texo-color-input": history.present.semantic.light.input,
			"--texo-color-muted": history.present.semantic.light.muted,
			"--texo-color-popover": history.present.semantic.light.popover,
			"--texo-color-surface": history.present.semantic.light.surface,
			"--texo-chat-context-background": history.present.semantic.light.surface,
			"--texo-card-shadow": history.present.effects.cardShadow,
			"--texo-control-shadow": history.present.effects.controlShadow
		},
		dark: {
			"--mantine-color-body": history.present.semantic.dark.body,
			"--mantine-color-default": history.present.semantic.dark.body,
			"--mantine-color-default-border": history.present.semantic.dark.border,
			"--mantine-color-dimmed": history.present.semantic.dark.dimmed,
			"--mantine-color-placeholder": history.present.semantic.dark.placeholder,
			"--mantine-color-text": history.present.semantic.dark.text,
			"--texo-color-card": history.present.semantic.dark.card,
			"--texo-color-input": history.present.semantic.dark.input,
			"--texo-color-muted": history.present.semantic.dark.muted,
			"--texo-color-popover": history.present.semantic.dark.popover,
			"--texo-color-surface": history.present.semantic.dark.surface,
			"--texo-chat-context-background": "color-mix(in srgb, var(--mantine-color-body), var(--mantine-color-black) 25%)",
			"--texo-control-shadow": history.present.effects.controlShadow,
			"--texo-card-shadow": history.present.effects.cardShadow
		}
	}), [history.present]);
	const value = useMemo(() => ({
		applyPreset,
		canRedo: history.future.length > 0,
		canUndo: history.past.length > 0,
		config: history.present,
		preset: history.preset,
		redo,
		undo,
		updateConfig
	}), [history]);
	return /* @__PURE__ */ jsx(TexoThemeContext.Provider, {
		value,
		children: /* @__PURE__ */ jsx(BaseProvider, {
			cssVariablesResolver,
			forceColorScheme: history.present.colorScheme,
			themeOverride,
			children
		})
	});
}
function useTexoTheme() {
	const context = useContext(TexoThemeContext);
	if (!context) throw new Error("useTexoTheme must be used within TexoThemeProvider");
	return context;
}
var texo_theme_picker_module_default = { option: "_option_1cpxr_1" };
//#endregion
//#region src/texo-theme-picker.tsx
function ThemeSwatches({ config }) {
	const colors = [
		config.primaryPalette[6],
		config.semantic[config.colorScheme].surface,
		config.semantic[config.colorScheme].border,
		config.semantic[config.colorScheme].text
	];
	return /* @__PURE__ */ jsx(BaseGroup, {
		gap: "calc(var(--mantine-spacing-xs) / 3)",
		wrap: "nowrap",
		children: colors.map((color, index) => /* @__PURE__ */ jsx(BaseBox, {
			bg: color,
			h: 12,
			w: 12,
			style: {
				border: "1px solid var(--mantine-color-default-border)",
				borderRadius: "var(--mantine-radius-default)"
			}
		}, `${color}-${index}`))
	});
}
function TexoThemePicker({ onChange, options, value }) {
	const selected = options.find((option) => option.value === value) ?? options[0];
	return /* @__PURE__ */ jsx(BaseComboboxPopover, {
		allowDeselect: false,
		checkIconPosition: "right",
		classNames: { option: texo_theme_picker_module_default.option },
		comboboxProps: {
			dropdownPadding: 0,
			offset: {
				crossAxis: 12,
				mainAxis: 8
			},
			position: "bottom-start",
			transitionProps: {
				duration: 150,
				transition: "pop-top-left"
			},
			width: "calc(min(var(--texo-inspector-width), 100vw) - 2 * var(--mantine-spacing-sm))"
		},
		data: options.map((option) => ({
			label: option.label,
			value: option.value
		})),
		maxDropdownHeight: 360,
		nothingFoundMessage: "No themes found",
		onChange: (nextValue) => nextValue && onChange(nextValue),
		renderOption: ({ option, checked }) => {
			const theme = options.find((item) => item.value === option.value);
			return /* @__PURE__ */ jsxs(BaseGroup, {
				gap: "sm",
				justify: "space-between",
				wrap: "nowrap",
				w: "100%",
				children: [/* @__PURE__ */ jsxs(BaseGroup, {
					gap: "sm",
					wrap: "nowrap",
					children: [theme && /* @__PURE__ */ jsx(ThemeSwatches, { config: theme.config }), /* @__PURE__ */ jsx(BaseText, { children: option.label })]
				}), checked && /* @__PURE__ */ jsx(IconCheck, {
					"aria-hidden": true,
					color: "var(--mantine-color-dimmed)",
					opacity: .65,
					size: 15,
					stroke: 1.75
				})]
			});
		},
		searchable: true,
		selectFirstOptionOnDropdownOpen: true,
		withCheckIcon: false,
		value,
		children: /* @__PURE__ */ jsx(BaseComboboxPopover.Target, { children: /* @__PURE__ */ jsx(BaseInputBase, {
			component: "button",
			pointer: true,
			rightSection: /* @__PURE__ */ jsx(BaseCombobox.Chevron, {}),
			rightSectionPointerEvents: "none",
			w: "100%",
			styles: {
				input: {
					border: 0,
					borderRadius: 0,
					boxShadow: "none",
					height: "100%",
					paddingInlineStart: "var(--mantine-spacing-sm)"
				},
				root: { height: "100%" },
				wrapper: { height: "100%" }
			},
			children: /* @__PURE__ */ jsxs(BaseGroup, {
				gap: "xs",
				wrap: "nowrap",
				children: [/* @__PURE__ */ jsx(ThemeSwatches, { config: selected.config }), /* @__PURE__ */ jsx(BaseText, {
					fw: 500,
					size: "sm",
					truncate: true,
					children: selected.label
				})]
			})
		}) })
	});
}
/**
* Compact picker: the current theme's swatches as a button; clicking opens a
* menu of themes. For chrome where a full select would be too loud.
*/
function TexoThemeSwatchMenu({ onChange, options, value }) {
	const selected = options.find((option) => option.value === value) ?? options[0];
	return /* @__PURE__ */ jsxs(BaseMenu, {
		position: "bottom-start",
		shadow: "md",
		width: 240,
		withinPortal: true,
		children: [/* @__PURE__ */ jsx(BaseMenu.Target, { children: /* @__PURE__ */ jsx(BaseUnstyledButton, {
			"aria-label": `Theme: ${selected.label}`,
			p: 4,
			style: {
				borderRadius: "var(--mantine-radius-default)",
				display: "flex"
			},
			title: selected.label,
			children: /* @__PURE__ */ jsx(ThemeSwatches, { config: selected.config })
		}) }), /* @__PURE__ */ jsx(BaseMenu.Dropdown, { children: options.map((option) => /* @__PURE__ */ jsx(BaseMenu.Item, {
			leftSection: /* @__PURE__ */ jsx(ThemeSwatches, { config: option.config }),
			onClick: () => onChange(option.value),
			rightSection: option.value === selected.value ? /* @__PURE__ */ jsx(IconCheck, {
				"aria-hidden": true,
				color: "var(--mantine-color-dimmed)",
				size: 15,
				stroke: 1.75
			}) : null,
			children: option.label
		}, option.value)) })]
	});
}
var texo_table_module_default = {
	viewport: "_viewport_1h3gr_1",
	table: "_table_1h3gr_6"
};
var texo_table_skin_module_default = {
	shell: "_shell_131rp_1",
	surface: "_surface_131rp_13",
	header: "_header_131rp_17",
	cell: "_cell_131rp_26",
	tableCell: "_tableCell_131rp_31",
	gridCell: "_gridCell_131rp_36",
	selectionCell: "_selectionCell_131rp_45"
};
//#endregion
//#region src/texo-table.tsx
function TexoTable({ columns, rows, selectable = false }) {
	const { config } = useTexoTheme();
	const [selected, setSelected] = useState([]);
	const allSelected = rows.length > 0 && selected.length === rows.length;
	const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
	const toggleRow = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
	return /* @__PURE__ */ jsx(BaseBox, {
		className: `${texo_table_skin_module_default.shell} ${texo_table_module_default.viewport}`,
		children: /* @__PURE__ */ jsxs(BaseTable, {
			className: `${texo_table_skin_module_default.surface} ${texo_table_module_default.table}`,
			"data-borders": config.table.borders,
			"data-hover": config.table.hover || void 0,
			"data-sticky": config.table.stickyHeader || void 0,
			"data-striped": config.table.striped || void 0,
			children: [/* @__PURE__ */ jsx(BaseTable.Thead, { children: /* @__PURE__ */ jsxs(BaseTable.Tr, { children: [selectable && /* @__PURE__ */ jsx(BaseTable.Th, {
				className: `${texo_table_skin_module_default.header} ${texo_table_skin_module_default.tableCell} ${texo_table_skin_module_default.selectionCell}`,
				children: /* @__PURE__ */ jsx(BaseCheckbox, {
					"aria-label": "Select all rows",
					checked: allSelected,
					indeterminate: selected.length > 0 && !allSelected,
					onChange: toggleAll,
					size: "xs"
				})
			}), columns.map((column) => /* @__PURE__ */ jsx(BaseTable.Th, {
				className: `${texo_table_skin_module_default.header} ${texo_table_skin_module_default.tableCell}`,
				style: {
					textAlign: column.align,
					width: column.width
				},
				children: column.label
			}, column.key))] }) }), /* @__PURE__ */ jsx(BaseTable.Tbody, { children: rows.map((row) => /* @__PURE__ */ jsxs(BaseTable.Tr, {
				"data-selected": selected.includes(row.id) || void 0,
				children: [selectable && /* @__PURE__ */ jsx(BaseTable.Td, {
					className: `${texo_table_skin_module_default.cell} ${texo_table_skin_module_default.tableCell} ${texo_table_skin_module_default.selectionCell}`,
					children: /* @__PURE__ */ jsx(BaseCheckbox, {
						"aria-label": `Select ${row.id}`,
						checked: selected.includes(row.id),
						onChange: () => toggleRow(row.id),
						size: "xs"
					})
				}), columns.map((column) => /* @__PURE__ */ jsx(BaseTable.Td, {
					className: `${texo_table_skin_module_default.cell} ${texo_table_skin_module_default.tableCell}`,
					style: { textAlign: column.align },
					children: row[column.key]
				}, column.key))]
			}, row.id)) })]
		})
	});
}
//#endregion
//#region src/texo-nav.tsx
function TexoNavItem({ active, icon, label, onClick, href }) {
	return /* @__PURE__ */ jsx(BaseNavLink, {
		active,
		component: href ? "a" : "button",
		href,
		label,
		leftSection: icon,
		onClick,
		styles: { root: {
			height: "var(--texo-sidebar-row-height)",
			minHeight: "var(--texo-sidebar-row-height)",
			paddingBlock: 0,
			borderRadius: "var(--mantine-radius-default)",
			...active ? {
				background: "var(--texo-sidebar-active-background)",
				color: "var(--texo-sidebar-active-color)"
			} : {}
		} },
		variant: "subtle"
	});
}
function TexoNavSection({ children, label, defaultCollapsed = false }) {
	const { config } = useTexoTheme();
	const { hierarchy, sections } = config.sidebar;
	if (sections === "collapsible") return /* @__PURE__ */ jsx(BaseNavLink, {
		childrenOffset: hierarchy === "tree" ? "var(--texo-sidebar-indent)" : 0,
		defaultOpened: !defaultCollapsed,
		label,
		styles: {
			root: {
				height: "var(--texo-sidebar-row-height)",
				minHeight: "var(--texo-sidebar-row-height)",
				paddingBlock: 0
			},
			label: {
				fontSize: "calc(var(--mantine-font-size-xs) * 0.875)",
				fontWeight: 600,
				textTransform: "uppercase",
				color: "var(--mantine-color-dimmed)"
			}
		},
		variant: "subtle",
		children: /* @__PURE__ */ jsx(BaseStack, {
			gap: 2,
			children
		})
	});
	return /* @__PURE__ */ jsxs(BaseStack, {
		gap: 2,
		children: [/* @__PURE__ */ jsx(BaseText, {
			c: "dimmed",
			fw: 600,
			px: "sm",
			style: {
				display: "var(--texo-sidebar-section-display)",
				fontSize: "calc(var(--mantine-font-size-xs) * 0.875)",
				marginTop: "var(--mantine-spacing-sm)"
			},
			tt: "uppercase",
			children: label
		}), /* @__PURE__ */ jsx(BaseStack, {
			gap: 2,
			pl: hierarchy === "tree" ? "var(--texo-sidebar-indent)" : 0,
			children
		})]
	});
}
var texo_field_list_module_default = {
	root: "_root_r4xt3_1",
	list: "_list_r4xt3_8",
	row: "_row_r4xt3_13",
	rowMain: "_rowMain_r4xt3_28",
	handle: "_handle_r4xt3_37",
	kind: "_kind_r4xt3_47",
	label: "_label_r4xt3_65",
	description: "_description_r4xt3_69",
	trailing: "_trailing_r4xt3_77",
	editor: "_editor_r4xt3_81",
	children: "_children_r4xt3_86",
	add: "_add_r4xt3_112"
};
//#endregion
//#region src/texo-field-list.tsx
var KIND_META = {
	text: {
		color: "green",
		icon: /* @__PURE__ */ jsx(IconTypography, { size: 16 }),
		label: "Text"
	},
	number: {
		color: "red",
		icon: /* @__PURE__ */ jsx(BaseText, {
			fw: 700,
			size: "xs",
			children: "123"
		}),
		label: "Number"
	},
	boolean: {
		color: "yellow",
		icon: /* @__PURE__ */ jsx(IconToggleLeft, { size: 16 }),
		label: "Boolean"
	},
	enum: {
		color: "grape",
		icon: /* @__PURE__ */ jsx(IconList, { size: 16 }),
		label: "Enumeration"
	},
	date: {
		color: "orange",
		icon: /* @__PURE__ */ jsx(IconCalendar, { size: 16 }),
		label: "Date"
	},
	relation: {
		color: "indigo",
		icon: /* @__PURE__ */ jsx(IconLink, { size: 16 }),
		label: "Relation"
	},
	group: {
		color: "gray",
		icon: /* @__PURE__ */ jsx(IconSitemap, { size: 16 }),
		label: "Component"
	}
};
function texoFieldKindLabel(kind) {
	return KIND_META[kind].label;
}
function Row({ item, depth, props }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
	const meta = KIND_META[item.kind];
	const open = props.editing === item.id;
	return /* @__PURE__ */ jsxs(BaseBox, {
		className: texo_field_list_module_default.row,
		"data-dragging": isDragging || void 0,
		"data-open": open || void 0,
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition
		},
		children: [
			/* @__PURE__ */ jsxs(BaseGroup, {
				className: texo_field_list_module_default.rowMain,
				gap: "sm",
				wrap: "nowrap",
				children: [
					/* @__PURE__ */ jsx(BaseActionIcon, {
						"aria-label": `Reorder ${item.label}`,
						className: texo_field_list_module_default.handle,
						size: "sm",
						variant: "subtle",
						...attributes,
						...listeners,
						children: /* @__PURE__ */ jsx(IconGripVertical, { size: 14 })
					}),
					/* @__PURE__ */ jsx(BaseBox, {
						className: texo_field_list_module_default.kind,
						"data-color": meta.color,
						children: meta.icon
					}),
					/* @__PURE__ */ jsx(BaseText, {
						className: texo_field_list_module_default.label,
						fw: 600,
						size: "sm",
						children: item.label
					}),
					/* @__PURE__ */ jsx(BaseText, {
						c: "dimmed",
						className: texo_field_list_module_default.description,
						size: "sm",
						children: item.description ?? meta.label
					}),
					/* @__PURE__ */ jsxs(BaseGroup, {
						className: texo_field_list_module_default.trailing,
						gap: "xs",
						wrap: "nowrap",
						children: [
							item.badges?.map((badge) => /* @__PURE__ */ jsx(BaseBadge, {
								size: "xs",
								variant: "outline",
								children: badge
							}, badge)),
							props.onEdit && /* @__PURE__ */ jsx(BaseActionIcon, {
								"aria-label": `Edit ${item.label}`,
								onClick: () => props.onEdit?.(item.id),
								size: "sm",
								variant: open ? "light" : "subtle",
								children: /* @__PURE__ */ jsx(IconPencil, { size: 14 })
							}),
							props.onRemove && /* @__PURE__ */ jsx(BaseActionIcon, {
								"aria-label": `Remove ${item.label}`,
								color: "red",
								onClick: () => props.onRemove?.(item.id),
								size: "sm",
								variant: "subtle",
								children: /* @__PURE__ */ jsx(IconTrash, { size: 14 })
							})
						]
					})
				]
			}),
			props.renderEditor && /* @__PURE__ */ jsx(BaseCollapse, {
				expanded: open,
				children: /* @__PURE__ */ jsx(BaseBox, {
					className: texo_field_list_module_default.editor,
					children: open ? props.renderEditor(item) : null
				})
			}),
			item.children && /* @__PURE__ */ jsx(BaseBox, {
				className: texo_field_list_module_default.children,
				children: /* @__PURE__ */ jsx(List, {
					depth: depth + 1,
					items: item.children,
					parentId: item.id,
					props
				})
			})
		]
	});
}
function List({ items, parentId, depth, props }) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const onDragEnd = ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const ids = items.map((item) => item.id);
		const from = ids.indexOf(String(active.id));
		const to = ids.indexOf(String(over.id));
		if (from === -1 || to === -1) return;
		props.onReorder?.(parentId, arrayMove(ids, from, to));
	};
	return /* @__PURE__ */ jsxs(BaseBox, {
		className: texo_field_list_module_default.list,
		"data-depth": depth,
		children: [/* @__PURE__ */ jsx(DndContext, {
			collisionDetection: closestCenter,
			onDragEnd,
			sensors,
			children: /* @__PURE__ */ jsx(SortableContext, {
				items: items.map((item) => item.id),
				strategy: verticalListSortingStrategy,
				children: items.map((item) => /* @__PURE__ */ jsx(Row, {
					depth,
					item,
					props
				}, item.id))
			})
		}), props.onAdd && /* @__PURE__ */ jsx(BaseButton, {
			className: texo_field_list_module_default.add,
			leftSection: /* @__PURE__ */ jsx(IconPlus, { size: 14 }),
			onClick: () => props.onAdd?.(parentId),
			size: "xs",
			variant: "subtle",
			children: props.addLabel ?? "Add new field"
		})]
	});
}
function TexoFieldList(props) {
	return /* @__PURE__ */ jsx(BaseBox, {
		className: texo_field_list_module_default.root,
		children: /* @__PURE__ */ jsx(List, {
			depth: 0,
			items: props.items,
			parentId: null,
			props
		})
	});
}
//#endregion
//#region src/texo-hotkeys.ts
var SEQUENCE_TIMEOUT_MS = 1e3;
var MODIFIER_KEYS = {
	Meta: true,
	Control: true,
	Shift: true,
	Alt: true,
	AltGraph: true,
	CapsLock: true
};
var KEY_ALIASES = {
	esc: "escape",
	return: "enter",
	space: " ",
	up: "arrowup",
	down: "arrowdown",
	left: "arrowleft",
	right: "arrowright",
	plus: "+"
};
var isMac = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
function parseChord(text) {
	const parts = text.toLowerCase().split("+").filter(Boolean);
	const key = KEY_ALIASES[parts[parts.length - 1]] ?? parts[parts.length - 1];
	const mods = parts.slice(0, -1);
	return {
		key,
		mod: mods.includes("mod") || (isMac ? mods.includes("cmd") || mods.includes("meta") : mods.includes("ctrl")),
		ctrl: isMac ? mods.includes("ctrl") : false,
		alt: mods.includes("alt") || mods.includes("option"),
		shift: mods.includes("shift") ? true : /^[a-z0-9]$/.test(key) ? false : void 0
	};
}
function parseSequence(keys) {
	return keys.trim().split(/\s+/).map(parseChord);
}
/** The chord a keydown event represents, or null for a bare modifier press. */
function chordOf(event) {
	if (MODIFIER_KEYS[event.key]) return null;
	return {
		key: event.key.toLowerCase(),
		mod: isMac ? event.metaKey : event.ctrlKey,
		ctrl: isMac ? event.ctrlKey : false,
		alt: event.altKey,
		shift: event.shiftKey
	};
}
function chordMatches(spec, actual) {
	return spec.key === actual.key && spec.mod === actual.mod && spec.ctrl === actual.ctrl && spec.alt === actual.alt && (spec.shift === void 0 || spec.shift === actual.shift);
}
function isPrefix(buffer, spec) {
	return buffer.length <= spec.length && buffer.every((chord, i) => chordMatches(spec[i], chord));
}
function isEditable(target) {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
function keysOf(command) {
	if (!command.keys) return [];
	return Array.isArray(command.keys) ? command.keys : [command.keys];
}
/**
* Bind `commands` on `target`. Returns the unbind function. `getCommands` is read on every
* keypress so callers can hand in a ref and never rebind.
*/
function bindHotkeys(getCommands, target = window) {
	let buffer = [];
	let timer;
	const reset = () => {
		buffer = [];
		clearTimeout(timer);
		timer = void 0;
	};
	const onKeyDown = (event) => {
		const keyboardEvent = event;
		if (keyboardEvent.defaultPrevented) return;
		const chord = chordOf(keyboardEvent);
		if (!chord) return;
		const editable = isEditable(keyboardEvent.target);
		const candidates = [];
		for (const command of getCommands()) {
			if (editable && !command.inInputs || !(command.when?.() ?? true)) continue;
			for (const keys of keysOf(command)) candidates.push({
				sequence: parseSequence(keys),
				command
			});
		}
		const attempt = (next) => {
			const exact = candidates.find((c) => c.sequence.length === next.length && isPrefix(next, c.sequence));
			if (exact) {
				keyboardEvent.preventDefault();
				reset();
				exact.command.run();
				return true;
			}
			if (candidates.some((c) => c.sequence.length > next.length && isPrefix(next, c.sequence))) {
				keyboardEvent.preventDefault();
				buffer = next;
				clearTimeout(timer);
				timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
				return true;
			}
			return false;
		};
		if (buffer.length > 0 && attempt([...buffer, chord])) return;
		reset();
		attempt([chord]);
	};
	target.addEventListener("keydown", onKeyDown);
	return () => {
		reset();
		target.removeEventListener("keydown", onKeyDown);
	};
}
/** Register every command's `keys` for the lifetime of the component. Never rebinds; reads the latest commands. */
function useHotkeys(commands) {
	const latest = useRef(commands);
	latest.current = commands;
	useEffect(() => bindHotkeys(() => latest.current), []);
}
var GLYPHS = isMac ? {
	mod: "⌘",
	shift: "⇧",
	alt: "⌥",
	ctrl: "⌃",
	enter: "↩",
	escape: "Esc",
	arrowup: "↑",
	arrowdown: "↓",
	arrowleft: "←",
	arrowright: "→",
	" ": "Space"
} : {
	mod: "Ctrl",
	shift: "Shift",
	alt: "Alt",
	ctrl: "Ctrl",
	enter: "Enter",
	escape: "Esc",
	arrowup: "↑",
	arrowdown: "↓",
	arrowleft: "←",
	arrowright: "→",
	" ": "Space"
};
/** Human-readable form of one binding: one list of keycap glyphs per chord in the sequence. */
function formatKeys(keys) {
	return keys.trim().split(/\s+/).map((chord) => {
		const parts = chord.toLowerCase().split("+").filter(Boolean);
		const key = KEY_ALIASES[parts[parts.length - 1]] ?? parts[parts.length - 1];
		const glyphs = [];
		for (const m of [
			"ctrl",
			"alt",
			"shift",
			"mod"
		]) if (parts.includes(m)) glyphs.push(GLYPHS[m]);
		glyphs.push(GLYPHS[key] ?? (key.length === 1 ? key.toUpperCase() : key));
		return glyphs;
	});
}
var texo_command_palette_module_default = {
	body: "_body_1cynq_1",
	search: "_search_1cynq_5",
	list: "_list_1cynq_9",
	group: "_group_1cynq_15",
	item: "_item_1cynq_22",
	keys: "_keys_1cynq_48",
	chordGap: "_chordGap_1cynq_55",
	empty: "_empty_1cynq_59"
};
//#endregion
//#region src/texo-command-palette.tsx
/**
* Subsequence fuzzy match. Scores contiguous runs and word starts higher so `sys` prefers
* "Go to system" over a label that merely contains the letters in order.
*/
function fuzzyMatch(query, label) {
	const q = query.toLowerCase();
	const l = label.toLowerCase();
	if (q.length === 0) return [];
	const hits = [];
	let from = 0;
	for (const ch of q) {
		const at = l.indexOf(ch, from);
		if (at === -1) return null;
		hits.push(at);
		from = at + 1;
	}
	return hits;
}
function scoreHits(hits, label) {
	let score = 0;
	for (let i = 0; i < hits.length; i++) {
		const at = hits[i];
		if (at === 0 || label[at - 1] === " ") score += 3;
		if (i > 0 && hits[i - 1] === at - 1) score += 2;
		score += 1;
	}
	return score - hits[hits.length - 1] * .01;
}
function rankItems(items, query) {
	const trimmed = query.trim();
	const matches = [];
	for (const item of items) {
		const hits = fuzzyMatch(trimmed, item.label);
		if (hits) matches.push({
			item,
			hits,
			score: trimmed ? scoreHits(hits, item.label) : 0
		});
	}
	if (trimmed) matches.sort((a, b) => b.score - a.score);
	return matches;
}
function highlight(label, hits) {
	if (hits.length === 0) return label;
	const out = [];
	let cursor = 0;
	for (const at of hits) {
		if (at > cursor) out.push(label.slice(cursor, at));
		out.push(/* @__PURE__ */ jsx("mark", { children: label[at] }, at));
		cursor = at + 1;
	}
	if (cursor < label.length) out.push(label.slice(cursor));
	return out;
}
function TexoKeys({ keys }) {
	const chords = formatKeys(keys);
	return /* @__PURE__ */ jsx("span", {
		className: texo_command_palette_module_default.keys,
		children: chords.map((glyphs, i) => /* @__PURE__ */ jsxs("span", {
			className: texo_command_palette_module_default.keys,
			children: [i > 0 && /* @__PURE__ */ jsx("span", { className: texo_command_palette_module_default.chordGap }), glyphs.map((g, j) => /* @__PURE__ */ jsx(BaseKbd, {
				size: "xs",
				children: g
			}, j))]
		}, i))
	});
}
function TexoCommandPalette({ items, onClose, onRun, opened, placeholder = "Type a command" }) {
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const listRef = useRef(null);
	const ranked = useMemo(() => rankItems(items, query), [items, query]);
	const groups = useMemo(() => {
		const order = [];
		const byGroup = {};
		for (const m of ranked) {
			const g = m.item.group ?? "Commands";
			if (!byGroup[g]) {
				byGroup[g] = [];
				order.push(g);
			}
			byGroup[g].push(m);
		}
		return order.map((g) => ({
			label: g,
			matches: byGroup[g]
		}));
	}, [ranked]);
	const flat = useMemo(() => groups.flatMap((g) => g.matches), [groups]);
	useEffect(() => {
		if (opened) {
			setQuery("");
			setActive(0);
		}
	}, [opened]);
	useEffect(() => setActive(0), [query]);
	useEffect(() => {
		listRef.current?.querySelector("[data-active]")?.scrollIntoView({ block: "nearest" });
	}, [active]);
	const run = (match) => {
		if (!match) return;
		onClose();
		onRun(match.item);
	};
	const onKeyDown = (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((i) => flat.length ? (i + 1) % flat.length : 0);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((i) => flat.length ? (i - 1 + flat.length) % flat.length : 0);
		} else if (event.key === "Enter") {
			event.preventDefault();
			run(flat[active]);
		} else if (event.key === "Escape") {
			event.preventDefault();
			onClose();
		}
	};
	let index = 0;
	return /* @__PURE__ */ jsxs(BaseModal, {
		classNames: { body: texo_command_palette_module_default.body },
		onClose,
		opened,
		padding: 0,
		size: "md",
		withCloseButton: false,
		yOffset: "12vh",
		children: [/* @__PURE__ */ jsx(BaseBox, {
			className: texo_command_palette_module_default.search,
			children: /* @__PURE__ */ jsx(BaseTextInput, {
				"aria-label": "Command",
				autoComplete: "off",
				"data-autofocus": true,
				leftSection: /* @__PURE__ */ jsx(IconSearch, { size: 16 }),
				onChange: (event) => setQuery(event.currentTarget.value),
				onKeyDown,
				placeholder,
				size: "md",
				styles: { input: {
					border: 0,
					background: "transparent"
				} },
				value: query,
				variant: "unstyled"
			})
		}), /* @__PURE__ */ jsxs(BaseBox, {
			className: texo_command_palette_module_default.list,
			ref: listRef,
			role: "listbox",
			children: [groups.map((group) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: texo_command_palette_module_default.group,
				children: group.label
			}), group.matches.map((match) => {
				const i = index++;
				const key = keysOf(match.item)[0];
				return /* @__PURE__ */ jsxs("button", {
					"aria-selected": i === active,
					className: texo_command_palette_module_default.item,
					"data-active": i === active || void 0,
					onClick: () => run(match),
					onMouseMove: () => setActive(i),
					role: "option",
					type: "button",
					children: [/* @__PURE__ */ jsx(BaseText, {
						component: "span",
						size: "sm",
						children: highlight(match.item.label, match.hits)
					}), key && /* @__PURE__ */ jsx(TexoKeys, { keys: key })]
				}, match.item.id);
			})] }, group.label)), flat.length === 0 && /* @__PURE__ */ jsx(BaseText, {
				c: "dimmed",
				className: texo_command_palette_module_default.empty,
				size: "sm",
				children: "No commands match"
			})]
		})]
	});
}
var texo_data_table_module_default = {
	root: "_root_yrwbt_1",
	viewport: "_viewport_yrwbt_8",
	grid: "_grid_yrwbt_14",
	header: "_header_yrwbt_22 _grid_yrwbt_14",
	body: "_body_yrwbt_38",
	row: "_row_yrwbt_43 _grid_yrwbt_14",
	cell: "_cell_yrwbt_57",
	headerCell: "_headerCell_yrwbt_58",
	sortIndex: "_sortIndex_yrwbt_99",
	empty: "_empty_yrwbt_105",
	"default": "_default_yrwbt_110"
};
//#endregion
//#region src/texo-data-table.tsx
var ROW_HEIGHT = {
	compact: 36,
	comfortable: 46
};
var SELECTION_TRACK = "42px";
var NO_SORT = [];
var NO_SELECTION = [];
function defaultCell(_column, value) {
	if (value === void 0 || value === null) return /* @__PURE__ */ jsx(BaseText, {
		c: "dimmed",
		size: "sm",
		children: "-"
	});
	if (typeof value === "object") return /* @__PURE__ */ jsx(BaseText, {
		size: "sm",
		className: texo_data_table_module_default.default,
		children: JSON.stringify(value)
	});
	return /* @__PURE__ */ jsx(BaseText, {
		size: "sm",
		className: texo_data_table_module_default.default,
		children: String(value)
	});
}
/** Next sort list after clicking `field`. `additive` (shift) keeps other keys. */
function cycleSort(current, field, additive) {
	const existing = current.find((s) => s.field === field);
	const next = existing === void 0 ? {
		field,
		direction: "asc"
	} : existing.direction === "asc" ? {
		field,
		direction: "desc"
	} : void 0;
	if (!additive) return next ? [next] : [];
	const rest = current.filter((s) => s.field !== field);
	if (!next) return rest;
	if (!existing) return [...rest, next];
	return current.map((s) => s.field === field ? next : s);
}
/** Memoized so a range change only renders the rows that entered the window. */
var TableRow = memo(function TableRow({ columns, focused, index, measure, onClick, onToggle, renderCell, row, selectable, selected }) {
	return /* @__PURE__ */ jsxs("div", {
		"aria-rowindex": index + 1,
		"aria-selected": selectable ? selected : void 0,
		className: `${texo_data_table_module_default.row} ${texo_table_skin_module_default.cell}`,
		"data-even": index % 2 === 1 ? "" : void 0,
		"data-focused": focused ? "" : void 0,
		"data-index": index,
		"data-record": row.id,
		"data-record-label": String(row[columns[0]?.key ?? "id"] ?? row.id),
		"data-record-template": "",
		"data-target": "row",
		"data-target-label": "Row",
		onClick: () => onClick(index, row),
		ref: measure,
		role: "row",
		children: [selectable && /* @__PURE__ */ jsx("div", {
			className: `${texo_data_table_module_default.cell} ${texo_table_skin_module_default.gridCell} ${texo_table_skin_module_default.tableCell} ${texo_table_skin_module_default.selectionCell}`,
			onClick: (e) => e.stopPropagation(),
			role: "gridcell",
			children: /* @__PURE__ */ jsx(BaseCheckbox, {
				"aria-label": `Select ${row.id}`,
				checked: selected,
				onChange: () => onToggle(row.id),
				size: "xs"
			})
		}), columns.map((column) => /* @__PURE__ */ jsx("div", {
			className: `${texo_data_table_module_default.cell} ${texo_table_skin_module_default.gridCell} ${texo_table_skin_module_default.tableCell}`,
			"data-align": column.align,
			role: "gridcell",
			children: renderCell(column, row[column.key], row)
		}, column.key))]
	});
});
function TexoDataTable({ columns, rows, renderCell = defaultCell, sort = NO_SORT, onSortChange, onOpen, selectable = false, selected = NO_SELECTION, onSelectedChange, onEndReached, loading = false, emptyLabel = "No rows", overscan = 12 }) {
	const { config } = useTexoTheme();
	const rowHeight = ROW_HEIGHT[config.table.density];
	const viewportRef = useRef(null);
	const [focused, setFocused] = useState(-1);
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => viewportRef.current,
		estimateSize: () => rowHeight,
		scrollMargin: rowHeight,
		scrollPaddingStart: config.table.stickyHeader ? rowHeight : 0,
		overscan,
		getItemKey: (index) => rows[index].id,
		directDomUpdates: true,
		directDomUpdatesMode: "transform"
	});
	const items = virtualizer.getVirtualItems();
	const lastRendered = items.length ? items[items.length - 1].index : -1;
	useEffect(() => {
		virtualizer.measure();
	}, [rowHeight, virtualizer]);
	useEffect(() => {
		if (onEndReached && rows.length > 0 && lastRendered >= rows.length - 1) onEndReached();
	}, [
		lastRendered,
		rows.length,
		onEndReached
	]);
	useEffect(() => {
		if (focused >= rows.length) setFocused(rows.length - 1);
	}, [focused, rows.length]);
	const moveFocus = useCallback((index) => {
		const clamped = Math.max(0, Math.min(rows.length - 1, index));
		if (rows.length === 0) return;
		setFocused(clamped);
		virtualizer.scrollToIndex(clamped, { align: "auto" });
	}, [rows.length, virtualizer]);
	const toggle = useCallback((id) => {
		if (!onSelectedChange) return;
		onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
	}, [onSelectedChange, selected]);
	const onRowClick = useCallback((index, row) => {
		setFocused(index);
		onOpen?.(row);
	}, [onOpen]);
	const onKeyDown = (event) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveFocus(focused < 0 ? 0 : focused + 1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveFocus(focused < 0 ? 0 : focused - 1);
				break;
			case "Home":
				event.preventDefault();
				moveFocus(0);
				break;
			case "End":
				event.preventDefault();
				moveFocus(rows.length - 1);
				break;
			case "PageDown":
				event.preventDefault();
				moveFocus(focused + Math.floor((viewportRef.current?.clientHeight ?? rowHeight * 10) / rowHeight));
				break;
			case "PageUp":
				event.preventDefault();
				moveFocus(focused - Math.floor((viewportRef.current?.clientHeight ?? rowHeight * 10) / rowHeight));
				break;
			case "Enter":
				if (focused >= 0 && rows[focused] && onOpen) {
					event.preventDefault();
					onOpen(rows[focused]);
				}
				break;
			case " ": if (selectable && focused >= 0 && rows[focused]) {
				event.preventDefault();
				toggle(rows[focused].id);
			}
		}
	};
	const onHeaderClick = (event, key) => {
		onSortChange?.(cycleSort(sort, key, event.shiftKey));
	};
	const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
	const style = { "--texo-data-table-columns": [...selectable ? [SELECTION_TRACK] : [], ...columns.map((c) => typeof c.width === "number" ? `${c.width}px` : c.width ?? "minmax(160px, 1fr)")].join(" ") };
	return /* @__PURE__ */ jsx(BaseBox, {
		"aria-busy": loading || void 0,
		"aria-rowcount": rows.length,
		className: `${texo_data_table_module_default.root} ${texo_table_skin_module_default.shell}`,
		"data-borders": config.table.borders,
		"data-hover": config.table.hover || void 0,
		"data-striped": config.table.striped || void 0,
		onKeyDown,
		role: "grid",
		style,
		tabIndex: 0,
		children: /* @__PURE__ */ jsxs("div", {
			className: texo_data_table_module_default.viewport,
			ref: viewportRef,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: `${texo_data_table_module_default.header} ${texo_table_skin_module_default.header}`,
					"data-sticky": config.table.stickyHeader || void 0,
					role: "row",
					children: [selectable && /* @__PURE__ */ jsx("div", {
						className: `${texo_data_table_module_default.headerCell} ${texo_table_skin_module_default.gridCell} ${texo_table_skin_module_default.tableCell} ${texo_table_skin_module_default.selectionCell}`,
						role: "columnheader",
						children: /* @__PURE__ */ jsx(BaseCheckbox, {
							"aria-label": "Select all rows",
							checked: allSelected,
							indeterminate: selected.length > 0 && !allSelected,
							onChange: () => onSelectedChange?.(allSelected ? [] : rows.map((r) => r.id)),
							size: "xs"
						})
					}), columns.map((column) => {
						const at = sort.findIndex((s) => s.field === column.key);
						const active = at >= 0 ? sort[at] : void 0;
						return /* @__PURE__ */ jsxs("div", {
							"aria-sort": active ? active.direction === "asc" ? "ascending" : "descending" : "none",
							className: `${texo_data_table_module_default.headerCell} ${texo_table_skin_module_default.gridCell} ${texo_table_skin_module_default.tableCell}`,
							"data-align": column.align,
							"data-sorted": active ? "" : void 0,
							onClick: (event) => onHeaderClick(event, column.key),
							role: "columnheader",
							children: [
								column.label,
								active && (active.direction === "asc" ? /* @__PURE__ */ jsx(IconArrowUp, { size: 12 }) : /* @__PURE__ */ jsx(IconArrowDown, { size: 12 })),
								active && sort.length > 1 && /* @__PURE__ */ jsx("span", {
									className: texo_data_table_module_default.sortIndex,
									children: at + 1
								})
							]
						}, column.key);
					})]
				}),
				rows.length === 0 && !loading && /* @__PURE__ */ jsx(BaseText, {
					c: "dimmed",
					className: texo_data_table_module_default.empty,
					size: "sm",
					children: emptyLabel
				}),
				/* @__PURE__ */ jsx("div", {
					className: texo_data_table_module_default.body,
					ref: virtualizer.containerRef,
					role: "rowgroup",
					children: items.map((item) => /* @__PURE__ */ jsx(TableRow, {
						columns,
						focused: focused === item.index,
						index: item.index,
						measure: virtualizer.measureElement,
						onClick: onRowClick,
						onToggle: toggle,
						renderCell,
						row: rows[item.index],
						selectable,
						selected: selectable && selected.includes(rows[item.index].id)
					}, item.key))
				})
			]
		})
	});
}
//#endregion
//#region src/texo-filter-bar.tsx
var OPS_BY_KIND = {
	string: [
		"contains",
		"eq",
		"isNull"
	],
	number: [
		"eq",
		"lt",
		"lte",
		"gt",
		"gte",
		"isNull"
	],
	date: [
		"eq",
		"lt",
		"lte",
		"gt",
		"gte",
		"isNull"
	],
	boolean: ["eq"],
	enum: ["in", "nin"],
	relation: ["eq", "isNull"]
};
var INNER_COMBOBOX = { withinPortal: false };
var OP_LABEL = {
	eq: "is",
	ne: "is not",
	in: "is any of",
	nin: "is none of",
	lt: "<",
	lte: "<=",
	gt: ">",
	gte: ">=",
	contains: "contains",
	isNull: "is empty"
};
/** Fold chips into the store's Where: one entry per field (a later chip on the same field wins). */
function filtersToWhere(filters) {
	const where = {};
	for (const f of filters) where[f.field] = f.op === "eq" ? f.value : {
		op: f.op,
		value: f.value
	};
	return where;
}
function describe(filter, field) {
	const label = field?.label ?? filter.field;
	if (filter.op === "isNull") return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("b", { children: label }), " is empty"] });
	const value = Array.isArray(filter.value) ? filter.value.join(", ") : String(filter.value);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: label }),
		" ",
		OP_LABEL[filter.op],
		" ",
		value
	] });
}
function FilterEditor({ fields, onAdd }) {
	const [fieldName, setFieldName] = useState(fields[0]?.name ?? null);
	const field = fields.find((f) => f.name === fieldName);
	const ops = field ? OPS_BY_KIND[field.kind] : [];
	const [op, setOp] = useState(ops[0] ?? "eq");
	const [value, setValue] = useState(field?.kind === "boolean" ? true : field?.kind === "enum" ? [] : "");
	const effectiveOp = ops.includes(op) ? op : ops[0];
	const pickField = (name) => {
		const next = fields.find((f) => f.name === name);
		setFieldName(name);
		if (!next) return;
		setOp(OPS_BY_KIND[next.kind][0]);
		setValue(next.kind === "boolean" ? true : next.kind === "enum" ? [] : "");
	};
	const ready = !!field && (effectiveOp === "isNull" || field.kind === "boolean" || (field.kind === "enum" ? Array.isArray(value) && value.length > 0 : value !== "" && value !== void 0 && value !== null));
	const submit = () => {
		if (!field || !ready) return;
		const v = effectiveOp === "isNull" ? void 0 : field.kind === "number" ? Number(value) : value;
		onAdd({
			field: field.name,
			op: effectiveOp,
			value: v
		});
	};
	return /* @__PURE__ */ jsxs(BaseStack, {
		gap: "xs",
		miw: 260,
		children: [
			/* @__PURE__ */ jsx(BaseSelect, {
				allowDeselect: false,
				comboboxProps: INNER_COMBOBOX,
				data: fields.map((f) => ({
					value: f.name,
					label: typeof f.label === "string" ? f.label : f.name
				})),
				label: "Field",
				onChange: pickField,
				size: "xs",
				value: fieldName
			}),
			field && /* @__PURE__ */ jsx(BaseSelect, {
				allowDeselect: false,
				comboboxProps: INNER_COMBOBOX,
				data: ops.map((o) => ({
					value: o,
					label: OP_LABEL[o]
				})),
				label: "Condition",
				onChange: (v) => v && setOp(v),
				size: "xs",
				value: effectiveOp
			}),
			field && effectiveOp !== "isNull" && field.kind === "enum" && /* @__PURE__ */ jsx(BaseMultiSelect, {
				comboboxProps: INNER_COMBOBOX,
				data: field.options ?? [],
				label: "Values",
				onChange: setValue,
				size: "xs",
				value: Array.isArray(value) ? value : []
			}),
			field && effectiveOp !== "isNull" && field.kind === "boolean" && /* @__PURE__ */ jsx(BaseSwitch, {
				checked: value === true,
				label: value === true ? "true" : "false",
				onChange: (e) => setValue(e.currentTarget.checked),
				size: "xs"
			}),
			field && effectiveOp !== "isNull" && field.kind === "number" && /* @__PURE__ */ jsx(BaseNumberInput, {
				label: "Value",
				onChange: setValue,
				size: "xs",
				value: typeof value === "number" ? value : value
			}),
			field && effectiveOp !== "isNull" && (field.kind === "string" || field.kind === "date" || field.kind === "relation") && /* @__PURE__ */ jsx(BaseTextInput, {
				label: field.kind === "relation" ? "Id" : field.kind === "date" ? "Date (ISO)" : "Value",
				onChange: (e) => setValue(e.currentTarget.value),
				onKeyDown: (e) => e.key === "Enter" && submit(),
				placeholder: field.kind === "date" ? "2026-01-31" : void 0,
				size: "xs",
				value: String(value ?? "")
			}),
			/* @__PURE__ */ jsx(BaseButton, {
				disabled: !ready,
				onClick: submit,
				size: "xs",
				children: "Add filter"
			})
		]
	});
}
function TexoFilterBar({ fields, filters, onFiltersChange, search, onSearchChange, total, noun = "row", searchPlaceholder = "Search", actions }) {
	const [opened, setOpened] = useState(false);
	const plural = total === 1 ? noun : `${noun}s`;
	return /* @__PURE__ */ jsxs(BaseStack, {
		gap: "xs",
		children: [/* @__PURE__ */ jsxs(BaseGroup, {
			gap: "xs",
			wrap: "nowrap",
			children: [
				/* @__PURE__ */ jsx(BaseTextInput, {
					"aria-label": "Search",
					leftSection: /* @__PURE__ */ jsx(IconSearch, { size: 14 }),
					onChange: (e) => onSearchChange(e.currentTarget.value),
					placeholder: searchPlaceholder,
					rightSection: search ? /* @__PURE__ */ jsx(BaseCloseButton, {
						"aria-label": "Clear search",
						onClick: () => onSearchChange(""),
						size: "xs"
					}) : void 0,
					size: "xs",
					style: {
						flex: 1,
						maxWidth: 360
					},
					value: search
				}),
				/* @__PURE__ */ jsxs(BasePopover, {
					onChange: setOpened,
					opened,
					position: "bottom-start",
					shadow: "sm",
					withinPortal: true,
					children: [/* @__PURE__ */ jsx(BasePopover.Target, { children: /* @__PURE__ */ jsx(BaseButton, {
						leftSection: /* @__PURE__ */ jsx(IconFilter, { size: 14 }),
						onClick: () => setOpened((o) => !o),
						size: "xs",
						variant: "default",
						children: "Filter"
					}) }), /* @__PURE__ */ jsx(BasePopover.Dropdown, { children: /* @__PURE__ */ jsx(FilterEditor, {
						fields,
						onAdd: (filter) => {
							onFiltersChange([...filters, filter]);
							setOpened(false);
						}
					}, opened ? "open" : "closed") })]
				}),
				total !== void 0 && /* @__PURE__ */ jsxs(BaseText, {
					c: "dimmed",
					"data-testid": "filter-total",
					size: "xs",
					style: { whiteSpace: "nowrap" },
					children: [
						total.toLocaleString(),
						" ",
						plural
					]
				}),
				actions && /* @__PURE__ */ jsx(BaseGroup, {
					gap: "xs",
					ml: "auto",
					wrap: "nowrap",
					children: actions
				})
			]
		}), filters.length > 0 && /* @__PURE__ */ jsxs(BaseGroup, {
			gap: 6,
			children: [filters.map((filter, i) => /* @__PURE__ */ jsx(BasePill, {
				onRemove: () => onFiltersChange(filters.filter((_, j) => j !== i)),
				size: "sm",
				withRemoveButton: true,
				children: describe(filter, fields.find((f) => f.name === filter.field))
			}, `${filter.field}-${filter.op}-${i}`)), /* @__PURE__ */ jsx(BaseButton, {
				leftSection: /* @__PURE__ */ jsx(IconX, { size: 12 }),
				onClick: () => onFiltersChange([]),
				size: "compact-xs",
				variant: "subtle",
				children: "Clear"
			})]
		})]
	});
}
//#endregion
//#region src/texo-board.tsx
function Card({ card, renderCard, onOpen }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
	return /* @__PURE__ */ jsx(BaseBox, {
		"data-card": card.id,
		onClick: () => onOpen?.(card),
		ref: setNodeRef,
		style: {
			border: "1px solid var(--mantine-color-default-border)",
			borderRadius: "var(--mantine-radius-default)",
			background: "var(--texo-color-card)",
			padding: "var(--mantine-spacing-xs)",
			cursor: "grab",
			opacity: isDragging ? .4 : 1,
			transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : void 0
		},
		...listeners,
		...attributes,
		children: renderCard(card)
	});
}
function Column({ column, renderCard, onOpen }) {
	const { setNodeRef, isOver } = useDroppable({ id: column.id });
	return /* @__PURE__ */ jsxs(BaseStack, {
		"data-column": column.id,
		gap: "xs",
		ref: setNodeRef,
		style: {
			minWidth: 240,
			flex: 1,
			padding: "var(--mantine-spacing-xs)",
			borderRadius: "var(--mantine-radius-default)",
			background: isOver ? "var(--mantine-color-default-hover)" : "var(--texo-color-surface)",
			overflowY: "auto",
			height: "100%"
		},
		children: [/* @__PURE__ */ jsxs(BaseGroup, {
			gap: "xs",
			px: "calc(var(--mantine-spacing-xs) / 2)",
			children: [/* @__PURE__ */ jsx(BaseText, {
				fw: 600,
				size: "sm",
				children: column.label
			}), /* @__PURE__ */ jsx(BaseText, {
				c: "dimmed",
				size: "xs",
				"data-count": true,
				children: column.total
			})]
		}), column.cards.map((card) => /* @__PURE__ */ jsx(Card, {
			card,
			onOpen,
			renderCard
		}, card.id))]
	});
}
function TexoBoard({ columns, renderCard, onMove, onOpen }) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
	const onDragEnd = (event) => {
		const to = event.over?.id;
		if (typeof to !== "string") return;
		if (columns.find((c) => c.cards.some((card) => card.id === event.active.id))?.id !== to) onMove(String(event.active.id), to);
	};
	return /* @__PURE__ */ jsx(DndContext, {
		onDragEnd,
		sensors,
		children: /* @__PURE__ */ jsx(BaseGroup, {
			align: "stretch",
			gap: "sm",
			style: {
				height: "100%",
				overflowX: "auto"
			},
			wrap: "nowrap",
			children: columns.map((c) => /* @__PURE__ */ jsx(Column, {
				column: c,
				onOpen,
				renderCard
			}, c.id))
		})
	});
}
var texo_chat_composer_module_default = {
	root: "_root_1bsme_1",
	context: "_context_1bsme_20",
	contextButton: "_contextButton_1bsme_29",
	metadata: "_metadata_1bsme_30",
	contextInner: "_contextInner_1bsme_41",
	label: "_label_1bsme_45",
	clear: "_clear_1bsme_54",
	field: "_field_1bsme_73",
	toolbar: "_toolbar_1bsme_89",
	input: "_input_1bsme_94"
};
//#endregion
//#region src/texo-chat-composer.tsx
/** A recessed context strip above a separately themed message field. */
function TexoChatComposer({ value, onChange, onSubmit, context, onInspectContext, onClearContext, onAttachContext, streaming = false, onStop, disabled = false, placeholder = "Ask Texo...", messageLabel = "Message", className }) {
	const composing = useRef(false);
	const input = useRef(null);
	const canSubmit = !disabled && value.trim().length > 0;
	const submit = () => {
		if (canSubmit) onSubmit();
	};
	const contextAction = context ? onInspectContext : onAttachContext;
	const contextActionLabel = context ? "Inspect current context" : "Attach current context";
	return /* @__PURE__ */ jsxs("div", {
		className: [texo_chat_composer_module_default.root, className].filter(Boolean).join(" "),
		"data-context": context ? true : void 0,
		children: [context && /* @__PURE__ */ jsxs("div", {
			className: texo_chat_composer_module_default.context,
			children: [/* @__PURE__ */ jsx(BaseTooltip, {
				disabled: !context.source && !onInspectContext,
				events: {
					hover: true,
					focus: true,
					touch: false
				},
				label: context.source ?? "Inspect current context",
				children: onInspectContext ? /* @__PURE__ */ jsx(BaseButton, {
					"aria-label": `Inspect current context: ${context.label}`,
					"aria-haspopup": "dialog",
					className: texo_chat_composer_module_default.contextButton,
					classNames: {
						label: texo_chat_composer_module_default.label,
						inner: texo_chat_composer_module_default.contextInner
					},
					color: "gray",
					h: "auto",
					leftSection: /* @__PURE__ */ jsx(IconSparkles, {
						"aria-hidden": true,
						size: "1em"
					}),
					onClick: onInspectContext,
					type: "button",
					variant: "transparent",
					children: /* @__PURE__ */ jsx(BaseText, {
						component: "span",
						c: "dimmed",
						fw: 400,
						size: "sm",
						truncate: true,
						children: context.label
					})
				}) : /* @__PURE__ */ jsxs(BaseGroup, {
					className: texo_chat_composer_module_default.metadata,
					gap: "xs",
					wrap: "nowrap",
					tabIndex: context.source ? 0 : void 0,
					children: [/* @__PURE__ */ jsx(IconSparkles, {
						"aria-hidden": true,
						size: "1em"
					}), /* @__PURE__ */ jsx(BaseText, {
						c: "dimmed",
						fw: 400,
						size: "sm",
						truncate: true,
						children: context.label
					})]
				})
			}), onClearContext && /* @__PURE__ */ jsx(BaseActionIcon, {
				"aria-label": "Clear context",
				className: texo_chat_composer_module_default.clear,
				color: "gray",
				onClick: () => {
					onClearContext();
					input.current?.focus();
				},
				size: "sm",
				type: "button",
				variant: "subtle",
				children: /* @__PURE__ */ jsx(IconX, {
					"aria-hidden": true,
					size: "1em"
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: texo_chat_composer_module_default.field,
			children: [/* @__PURE__ */ jsx(BaseTextarea, {
				"aria-label": messageLabel,
				autosize: true,
				classNames: { input: texo_chat_composer_module_default.input },
				disabled,
				maxRows: 8,
				minRows: 1,
				onChange: (event) => onChange(event.currentTarget.value),
				onCompositionStart: () => {
					composing.current = true;
				},
				onCompositionEnd: () => {
					composing.current = false;
				},
				onKeyDown: (event) => {
					if (event.key !== "Enter" || event.shiftKey || composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
					event.preventDefault();
					submit();
				},
				placeholder,
				ref: input,
				value,
				variant: "unstyled"
			}), /* @__PURE__ */ jsxs(BaseGroup, {
				className: texo_chat_composer_module_default.toolbar,
				gap: "xs",
				justify: "flex-end",
				wrap: "nowrap",
				children: [
					streaming && onStop && /* @__PURE__ */ jsx(BaseButton, {
						leftSection: /* @__PURE__ */ jsx(IconPlayerStop, {
							"aria-hidden": true,
							size: "1em"
						}),
						onClick: onStop,
						size: "compact-sm",
						type: "button",
						variant: "default",
						children: "Stop"
					}),
					contextAction && /* @__PURE__ */ jsx(BaseTooltip, {
						label: contextActionLabel,
						children: /* @__PURE__ */ jsx(BaseActionIcon, {
							"aria-label": contextActionLabel,
							color: "gray",
							onClick: contextAction,
							radius: "xl",
							size: "sm",
							type: "button",
							variant: context ? "light" : "subtle",
							children: /* @__PURE__ */ jsx(IconFocus2, {
								"aria-hidden": true,
								size: "1em"
							})
						})
					}),
					/* @__PURE__ */ jsx(BaseTooltip, {
						label: "Send message (Enter). Shift + Enter for a new line.",
						children: /* @__PURE__ */ jsx(BaseActionIcon, {
							"aria-label": "Send message",
							disabled: !canSubmit,
							onClick: submit,
							radius: "xl",
							size: "sm",
							type: "button",
							variant: "filled",
							children: /* @__PURE__ */ jsx(IconArrowUp, {
								"aria-hidden": true,
								size: "1em"
							})
						})
					})
				]
			})]
		})]
	});
}
var texo_markdown_module_default = {
	root: "_root_1iza7_1",
	tableScroll: "_tableScroll_1iza7_80"
};
//#endregion
//#region src/texo-markdown.tsx
var plugins = [remarkGfm];
var components = {
	h1: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 1,
		size: "xl",
		children
	}),
	h2: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 2,
		size: "lg",
		children
	}),
	h3: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 3,
		size: "md",
		children
	}),
	h4: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 4,
		size: "sm",
		children
	}),
	h5: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 5,
		size: "sm",
		children
	}),
	h6: ({ children }) => /* @__PURE__ */ jsx(BaseTitle, {
		order: 6,
		size: "sm",
		children
	}),
	code: ({ children, className }) => /* @__PURE__ */ jsx(BaseCode, {
		className,
		children
	}),
	a: ({ href, title, children }) => href ? /* @__PURE__ */ jsx(BaseText, {
		component: "a",
		inherit: true,
		href,
		title,
		target: "_blank",
		rel: "noopener noreferrer",
		children
	}) : /* @__PURE__ */ jsx("span", { children }),
	table: ({ children }) => /* @__PURE__ */ jsx(BaseBox, {
		className: texo_markdown_module_default.tableScroll,
		role: "region",
		"aria-label": "Markdown table",
		tabIndex: 0,
		children: /* @__PURE__ */ jsx("table", { children })
	}),
	img: ({ src, alt, title }) => src ? /* @__PURE__ */ jsx("img", {
		src,
		alt: alt ?? "",
		title,
		loading: "lazy"
	}) : /* @__PURE__ */ jsx("span", { children: alt })
};
/** Safe GFM content. Raw HTML stays disabled; ReactMarkdown filters unsafe URLs. */
var TexoMarkdown = memo(function TexoMarkdown({ children, size = "sm", c }) {
	return /* @__PURE__ */ jsx(BaseBox, {
		className: texo_markdown_module_default.root,
		fz: size,
		lh: size,
		c,
		children: /* @__PURE__ */ jsx(ReactMarkdown, {
			components,
			remarkPlugins: plugins,
			skipHtml: true,
			children
		})
	});
});
//#endregion
//#region src/texo-bridge.ts
/**
* Bridge between the Texo admin and the app it frames under /preview/.
*
* The framed app describes its designable pages (`texo:pages`) and reports the
* page it is showing (`texo:route`); the admin steers it with `texo:navigate`.
* Both documents share an origin, so the admin can also read the frame's DOM
* (`data-texo-page` on <html>, `data-target` markers) for Prototype mode.
*/
var TEXO_PREVIEW_BASE = "/preview";
var isBrowser = typeof window !== "undefined";
function post(message) {
	if (isBrowser && window.parent !== window) window.parent.postMessage(message, window.location.origin);
}
var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
/** Mount once near the app root; the framed app becomes visible to the admin. */
function useTexoBridge({ pages, page, navigate }) {
	useIsomorphicLayoutEffect(() => {
		document.documentElement.dataset.texoPage = page?.id ?? "";
		return () => {
			delete document.documentElement.dataset.texoPage;
		};
	}, [page]);
	useEffect(() => {
		post({
			type: "texo:pages",
			pages: pages.map(({ id, label, sourcePath, path }) => ({
				id,
				label,
				sourcePath,
				path
			}))
		});
	}, [pages, page]);
	useEffect(() => {
		post({
			type: "texo:route",
			pageId: page?.id ?? null,
			path: page?.path ?? null
		});
	}, [page]);
	useEffect(() => {
		const onMessage = (event) => {
			if (event.origin !== window.location.origin || event.source !== window.parent) return;
			if (event.data?.type !== "texo:navigate") return;
			const target = pages.find((item) => item.id === event.data.pageId);
			if (target) navigate(target);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [pages, navigate]);
}
//#endregion
//#region src/texo-theme-sync.tsx
/**
* The admin persists its theme under this localStorage key. Apps framed under
* the same origin read it at boot and follow edits live through `storage` events.
*/
var TEXO_THEME_KEY = "texo.theme";
/** Saved theme merged over the default preset; undefined when absent, invalid, or on the server. */
function readTexoTheme() {
	if (typeof localStorage === "undefined") return void 0;
	try {
		const raw = localStorage.getItem(TEXO_THEME_KEY);
		if (!raw) return void 0;
		const saved = JSON.parse(raw);
		if (!saved.config) return void 0;
		return {
			config: {
				...TEXO_THEME_PRESETS[0].config,
				...saved.config
			},
			preset: saved.preset ?? "custom"
		};
	} catch {
		return;
	}
}
function writeTexoTheme(config, preset) {
	localStorage.setItem(TEXO_THEME_KEY, JSON.stringify({
		config,
		preset
	}));
}
/**
* Follows the admin's saved theme. Applies it after mount (so server-rendered
* markup stays deterministic) and on every later `storage` event.
*/
function TexoThemeSync() {
	const { updateConfig } = useTexoTheme();
	const update = useRef(updateConfig);
	update.current = updateConfig;
	useEffect(() => {
		const apply = () => {
			const next = readTexoTheme();
			if (next) update.current(() => next.config);
		};
		apply();
		const onStorage = (event) => {
			if (event.key === "texo.theme") apply();
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);
	return null;
}
//#endregion
export { BaseAccordion, BaseActionIcon, BaseAlert, BaseAnchor, BaseAppShell, BaseBadge, BaseBox, BaseBurger, BaseButton, BaseCard, BaseCenter, BaseCheckbox, BaseCloseButton, BaseCode, BaseCodeHighlight, BaseCollapse, BaseColorInput, BaseCombobox, BaseComboboxPopover, BaseContainer, BaseDivider, BaseDrawer, BaseFieldset, BaseGrid, BaseGroup, BaseHoverCard, BaseImage, BaseInputBase, BaseKbd, BaseLoader, BaseMenu, BaseModal, BaseMultiSelect, BaseNativeSelect, BaseNavLink, BaseNotification, BaseNumberInput, BasePagination, BasePaper, BasePasswordInput, BasePill, BasePinInput, BasePopover, BaseProvider, BaseScrollArea, BaseScroller, BaseSelect, BaseSimpleGrid, BaseStack, BaseSwitch, BaseTable, BaseTabs, BaseText, BaseTextInput, BaseTextarea, BaseThemeIcon, BaseTimeline, BaseTitle, BaseTooltip, BaseTree, BaseUnstyledButton, TEXO_ICONS, TEXO_PREVIEW_BASE, TEXO_SIZE_KEYS, TEXO_THEME_KEY, TEXO_THEME_PRESETS, TexoAppShell, TexoBoard, TexoChatComposer, TexoColorSchemeScript, TexoCommandPalette, TexoComponent, TexoDataTable, TexoFieldList, TexoFilterBar, TexoIcon, TexoIconPicker, TexoKeys, TexoMarkdown, TexoNavItem, TexoNavSection, TexoPanel, TexoTable, TexoThemePicker, TexoThemeProvider, TexoThemeSwatchMenu, TexoThemeSync, bindHotkeys, chordOf, cycleSort, defineTexoComponent, filtersToWhere, formatKeys, fuzzyMatch, isEditable, isMac, keysOf, parseChord, parseSequence, rankItems, readTexoTheme, texoFieldKindLabel, theme, useBaseCombobox, useBaseDisclosure, useBaseDocumentTitle, useBaseLocalStorage, useBaseMediaQuery, useBaseMounted, useBaseViewportSize, useHotkeys, useTexoBridge, useTexoTheme, writeTexoTheme };

//# sourceMappingURL=index.js.map