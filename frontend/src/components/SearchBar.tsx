import React from "react";
import { Fish, Rarity } from "../types/fish";
import { getRarityBadgeClass } from "../utils/rarity";

export type BaseSearchBarProps = {
	value?: string;
	placeholder?: string;
	className?: string;
	onChange?: (query: string) => void;
	suggestions?: Fish[];
	onSelect?: (fish: Fish) => void;
	showRarityFilter?: boolean;
};

type State = {
	value: string;
	rarityFilter: Rarity | "ALL";
	showDropdown: boolean;
	fetchedSuggestions: Fish[];
	loading: boolean;
	error: string | null;
};

export class BaseSearchBar extends React.Component<BaseSearchBarProps, State> {
	static defaultProps = {
		value: "",
		placeholder: "",
		showRarityFilter: true,
	};

	private dropdownRef = React.createRef<HTMLDivElement>();

	constructor(props: BaseSearchBarProps) {
		super(props);
		this.state = {
			value: props.value ?? "",
			rarityFilter: "ALL",
			showDropdown: false,
			fetchedSuggestions: [],
			loading: false,
			error: null,
		};
	}

	componentDidUpdate(prevProps: BaseSearchBarProps) {
		if (prevProps.value !== this.props.value && this.props.value !== undefined) {
			this.setState({ value: this.props.value });
		}
	}

	setRarityFilter = (r: Rarity | "ALL") => {
		this.setState({ rarityFilter: r, showDropdown: true, error: null });
		if (r === "ALL") {
			// Fetch all fish from the API when switching to ALL so the dropdown shows results
			this.fetchAll();
		} else {
			this.fetchByRarity(r);
		}
	};

	async fetchAll() {
		this.setState({ loading: true, error: null });
		try {
			const res = await fetch(`http://localhost:5555/api/fish`);
			if (!res.ok) throw new Error(`Failed to fetch all fish: ${res.status}`);
			const data = await res.json();
			this.setState({ fetchedSuggestions: data, loading: false });
		} catch (err: any) {
			this.setState({ error: err.message || String(err), loading: false });
		}
	}

	async fetchByRarity(r: Rarity) {
		this.setState({ loading: true, error: null });
		try {
			const res = await fetch(`http://localhost:5555/api/fish/rarity/${r}`);
			if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
			const data = await res.json();
			this.setState({ fetchedSuggestions: data, loading: false });
		} catch (err: any) {
			this.setState({ error: err.message || String(err), loading: false });
		}
	}

	handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		this.setState({ value, showDropdown: true });
		this.props.onChange?.(value);
	};

	handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.preventDefault();
			this.setState({ value: "", showDropdown: false });
			this.props.onChange?.("");
		}
	};

	handleSelect = (fish: Fish) => {
		this.setState({ value: fish.name, showDropdown: false });
		this.props.onChange?.(fish.name);
		this.props.onSelect?.(fish);
	};

	getFilteredFish = () => {
		// Prefer fetched suggestions when present (for both ALL and specific rarities),
		// otherwise fall back to parent-provided suggestions for ALL.
		let source: Fish[] = [];
		if (this.state.fetchedSuggestions && this.state.fetchedSuggestions.length > 0) {
			source = this.state.fetchedSuggestions;
		} else if (this.state.rarityFilter === "ALL") {
			source = this.props.suggestions ?? [];
		} else {
			source = this.state.fetchedSuggestions;
		}
		
		const query = this.state.value.toLowerCase();
		
		return source.filter((fish) => {
			if (this.state.rarityFilter !== "ALL" && fish.rarity.toUpperCase() !== this.state.rarityFilter) {
				return false;
			}
			return !query || fish.name.toLowerCase().includes(query);
		});
	};

	renderRarityFilters() {
		if (!this.props.showRarityFilter) return null;
		
		const rarities: (Rarity | "ALL")[] = ["ALL", "EPIC", "RARE", "COMMON"];
		
		return (
			<div className="w-[20vw]" style={{ display: "flex", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
				{rarities.map((r) => {
					const active = this.state.rarityFilter === r;
					const badgeClass = r === "ALL" ? "badge-all" : getRarityBadgeClass(r);
					return (
						<button
							key={r}
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => this.setRarityFilter(r)}
							className={`rarity-chip ${active ? "active" : ""} ${badgeClass}`}
							style={{
								padding: "6px 12px",
								border: active ? "2px solid #3b82f6" : "1px solid #d1d5db",
								borderRadius: 6,
								cursor: "pointer",
								fontWeight: active ? 600 : 400,
							}}
						>
							{r === "ALL" ? "All" : r}
						</button>
					);
				})}
			</div>
		);
	}

	renderDropdown() {
		if (!this.state.showDropdown) return null;

		const filtered = this.getFilteredFish();

		return (
			<div
				ref={this.dropdownRef}
				style={{
					position: "absolute",
					zIndex: 50,
					background: "white",
					width: "40vw",
					marginTop: 4,
					padding: 12,
					boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
					borderRadius: 8,
					maxHeight: 400,
					overflowY: "scroll",
                    overflowX: "hidden",
				}}
			>
				{this.renderRarityFilters()}
				
				{this.state.loading ? (
					<div style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>Loading...</div>
				) : this.state.error ? (
					<div style={{ padding: 16, color: "#ef4444" }}>{this.state.error}</div>
				) : filtered.length === 0 ? (
					<div style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No fish found</div>
				) : (
					<div style={{ display: "grid", gap: 8 }}>
						{filtered.map((fish) => (
							<div
								key={fish.id}
								onMouseDown={() => this.handleSelect(fish)}
								style={{
									display: "flex",
									gap: 12,
									alignItems: "center",
									padding: 12,
									cursor: "pointer",
									borderRadius: 6,
									border: "1px solid #e5e7eb",
									transition: "background-color 0.15s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
								onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
							>
								<img
									src={fish.image}
									alt={fish.name}
									style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
								/>
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 600, marginBottom: 4 }}>{fish.name}</div>
									<span
										className={getRarityBadgeClass(fish.rarity)}
										style={{
											padding: "2px 8px",
											borderRadius: 4,
											fontSize: 12,
											display: "inline-block",
										}}
									>
										{fish.rarity}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	render() {
		return (
			<div style={{ position: "relative" }}>
				<input
					type="text"
					className={this.props.className}
					placeholder={this.props.placeholder}
					value={this.state.value}
					onChange={this.handleChange}
					onKeyDown={this.handleKeyDown}
					onBlur={() => setTimeout(() => this.setState({ showDropdown: false }), 200)}
					onFocus={() => this.setState({ showDropdown: true })}
					aria-label={this.props.placeholder || "search"}
				/>
				{this.renderDropdown()}
			</div>
		);
	}
}