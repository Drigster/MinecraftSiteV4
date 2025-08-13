<script lang="ts">
	import TextLabel from "./TextLabel.svelte";
	import { page } from "$app/state";
	import { getFlash } from "sveltekit-flash-message";
	import type { RemoteForm } from "@sveltejs/kit";
	import { Check, X } from "@o7/icon/lucide";

	const flash = getFlash(page);

	let {
		change,
		title,
		value,
		input,
		pattern,
		titleClass = "",
		valueClass = "",
		buttonText = "Изменить",
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		change: RemoteForm<{ success: boolean }>;
		title: string;
		value: string;
		input: string;
		pattern?: string;
		titleClass?: string;
		valueClass?: string;
		buttonText?: string;
	} = $props();

	let rand = Math.round(Math.random() * 1000);

	let inputElement: HTMLInputElement | undefined = $state(undefined);
</script>

<TextLabel {title} {titleClass} {valueClass}>
	<form
		class="flex gap-1"
		{...change.enhance(async ({ form, submit }) => {
			try {
				await submit();
				if (change.result?.success) {
					form.reset();
				}
			} catch (error) {
				$flash = {
					type: "success",
					message: "Ошибка, попробуйте позже",
				};
				console.log(error);
			}
		})}
	>
		<input type="checkbox" id="{input}_{rand}" hidden checked={false} />
		<div class="not-editing h-full flex items-center">
			<span class="">
				{value}
			</span>
		</div>
		<div class="not-editing flex items-center">
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<label
				class="text-xs text-text-muted m-1 hover:text-opacity-50"
				role="button"
				tabindex="0"
				for="{input}_{rand}"
			>
				{buttonText}
			</label>
		</div>

		<div class="editing h-full flex items-center">
			<input
				class="px-0"
				type="text"
				name={input}
				{value}
				{pattern}
				bind:this={inputElement}
			/>
		</div>
		<div class="editing flex items-center">
			<button class="text-text hover:text-opacity-50" type="submit">
				<Check size="20" />
			</button>
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<label
				class="text-text hover:text-opacity-50"
				role="button"
				tabindex="0"
				for="{input}_{rand}"
				onclick={() => {
					if (inputElement) {
						inputElement.value = value;
					}
				}}
			>
				<X size="20" />
			</label>
		</div>
	</form>
</TextLabel>

<style>
	form input:not(:checked) ~ .editing {
		display: none;
	}
	form input:checked ~ .not-editing {
		display: none;
	}
</style>
