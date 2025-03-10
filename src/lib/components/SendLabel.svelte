<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import TextLabel from "./TextLabel.svelte";

	let {
		form,
		action,
		title,
		value,
		titleClass = "",
		valueClass = "",
		hidden = false,
		buttonText = "Изменить",
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form: SuperValidated<any> | undefined;
		action: string;
		title: string;
		value: string;
		titleClass?: string;
		valueClass?: string;
		hidden?: boolean;
		buttonText?: string;
	} = $props();

	const { enhance, delayed } = superForm(form, {
		resetForm: true,
	});
</script>

<TextLabel {title} {titleClass} {valueClass}>
	<span>{value}</span>
	{#if !hidden}
		<form method="post" {action} use:enhance>
			<button class="text-xs text-secondary m-1 hover:text-white">
				{#if $delayed}
					<span class="relative">
						{buttonText}
						<img
							class="h-full mx-1 absolute left-full top-0"
							width="20"
							height="20"
							src={spiner}
							alt="Spiner icon"
						/>
					</span>
				{:else}
					{buttonText}
				{/if}
			</button>
		</form>
	{/if}
</TextLabel>
