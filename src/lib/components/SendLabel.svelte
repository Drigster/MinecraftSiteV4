<script lang="ts">
	import { getFlash } from "sveltekit-flash-message";
	import TextLabel from "./TextLabel.svelte";
	import type { RemoteForm } from "@sveltejs/kit";
	import { page } from "$app/state";

	const flash = getFlash(page);

	let {
		change,
		title,
		value,
		titleClass = "",
		valueClass = "",
		hidden = false,
		buttonText = "Изменить",
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		change: RemoteForm<void>;
		title: string;
		value: string;
		titleClass?: string;
		valueClass?: string;
		hidden?: boolean;
		buttonText?: string;
	} = $props();
</script>

<TextLabel {title} {titleClass} {valueClass}>
	<span>{value}</span>
	{#if !hidden}
		<form
			{...change.enhance(async ({ form, submit }) => {
				try {
					await submit();
					form.reset();
				} catch (error) {
					$flash = {
						type: "success",
						message: "Ошибка, попробуйте позже",
					};
					console.log(error);
				}
			})}
		>
			<button
				class="m-1 text-xs text-text-muted hover:text-opacity-50 disabled:cursor-wait disabled:text-opacity-50 disabled:line-through"
				disabled={change.pending > 0}
			>
				{buttonText}
			</button>
		</form>
	{/if}
</TextLabel>
