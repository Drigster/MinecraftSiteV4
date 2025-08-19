<script lang="ts">
	import { Spring } from "svelte/motion";

	let {
		class: classList,
		value = $bindable(0),
	}: { class?: string; value: number } = $props();

	// let offset = $state(0);

	// const displayed_count = new Spring(0);
	// $effect(() => {
	// 	displayed_count.set(value);
	// });
	// $effect(() => {
	// 	offset = modulo($displayed_count, 1);
	// });

	// function modulo(n: number, m: number) {
	// 	// handle negative numbers
	// 	return ((n % m) + m) % m;
	// }
</script>

<div class="counter {classList}">{value}</div>

<!-- <div class="counter {classList}">
	<div class="counter-viewport">
		<div
			class="counter-digits"
			style="transform: translate(0, {100 * offset}%)"
		>
			<strong class="hidden" aria-hidden="true"
				>{Math.floor($displayed_count + 1)}</strong
			>
			<strong>{Math.floor($displayed_count)}</strong>
		</div>
	</div>
</div> -->

<style>
	.counter {
		display: flex;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		/* margin: 1rem 0; */
	}

	.counter-viewport {
		width: 100%;
		height: 60px;
		overflow: hidden;
		text-align: center;
		position: relative;
	}

	.counter-viewport strong {
		position: absolute;
		display: flex;
		width: 100%;
		height: 100%;
		font-weight: 400;
		color: var(--color-theme-1);
		font-size: 4rem;
		align-items: center;
		justify-content: center;
	}

	.counter-digits {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.hidden {
		top: -100%;
		user-select: none;
	}
</style>
