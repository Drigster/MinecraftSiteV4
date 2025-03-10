<script lang="ts">
	import { Check, XMark } from "@o7/icon/heroicons";
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
		form: SuperValidated<any> | undefined;
		action: string;
		title: string;
		value: string;
		titleClass?: string;
		valueClass?: string;
		hidden?: boolean;
		buttonText?: string;
	} = $props();
	let isEditing = $state(false);

	const { enhance, delayed, errors, message } = superForm(form, {
		resetForm: true,
		onUpdated: () => {
			isEditing = false;
		},
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
