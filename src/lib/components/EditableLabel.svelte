<script lang="ts">
	import { Check, XMark } from "@o7/icon/heroicons";
	import spiner from "$lib/assets/spiner.svg";
	import {
		superForm,
		type Infer,
		type SuperValidated,
	} from "sveltekit-superforms";
	import TextLabel from "./TextLabel.svelte";
	import { page } from "$app/stores";
	import { getFlash } from "sveltekit-flash-message";
	import { ToastLevel } from "./toast";

	const flash = getFlash(page);

	let {
		formData,
		action,
		title,
		value,
		input,
		titleClass = "",
		valueClass = "",
		hidden = false,
		buttonText = "Изменить",
	}: {
		formData: SuperValidated<Infer<any>>;
		action: string;
		title: string;
		value: string;
		input: string;
		titleClass?: string;
		valueClass?: string;
		hidden?: boolean;
		buttonText?: string;
	} = $props();
	let isEditing = $state(false);

	const { form, errors, enhance, delayed, message } = superForm(formData, {
		resetForm: true,
		onUpdated({ form }) {
			isEditing = false;
			if (form.message) {
				$flash = {
					type: form.message.type,
					message: form.message.text,
					title: form.message.title,
				};
			}
			if (form.errors[input]) {
				$flash = {
					type: ToastLevel.Error,
					message: form.errors[input],
				};
			}
		},
		onError({ result }) {
			$flash = { type: ToastLevel.Error, message: result.error.message };
		},
	});

	let inputElement: HTMLInputElement | null = $state(null);

	$effect(() => {
		if (inputElement != null) {
			inputElement.focus();
			const length = inputElement.value.length;
			inputElement.setSelectionRange(length, length);
		}
	});

	function onInput(event: Event) {
		const target = event.target as HTMLInputElement;
		let context = document.createElement("canvas").getContext("2d")!;
		context.font = window.getComputedStyle(target).font;
		let width = Math.ceil(context.measureText(target.value).width);
		target.style.width = `max(12ch, calc(${width}px + ${window.getComputedStyle(target).paddingLeft} + ${window.getComputedStyle(target).paddingRight})`;
	}
</script>

<TextLabel {title} {titleClass} {valueClass}>
	{#if isEditing}
		<form class="flex gap-1" {action} method="post" use:enhance>
			<button
				type="submit"
				disabled
				style="display: none"
				aria-hidden="true"
			></button>
			<div class="h-full flex items-center">
				<input
					class="px-1"
					type="text"
					name={input}
					{value}
					oninput={onInput}
					onfocus={onInput}
					bind:this={inputElement}
				/>
			</div>
			<div class="flex items-center">
				{#if $delayed}
					<button class="change-icon-button" type="submit" disabled>
						<img
							class="h-full w-full"
							width="20"
							height="20"
							src={spiner}
							alt="Spiner icon"
						/>
					</button>
				{:else}
					<button class="change-icon-button" type="submit">
						<Check class="h-full w-full" size="20" />
					</button>
				{/if}
				<button
					class="change-icon-button"
					type="button"
					onclick={() => {
						isEditing = false;
					}}
				>
					<XMark class="h-full w-full" size="20" />
				</button>
			</div>
		</form>
	{:else}
		<div class="h-full flex items-center">
			<span>
				{value}
			</span>
		</div>
		{#if !hidden}
			<button
				type="button"
				class="text-xs text-secondary m-1 hover:text-white"
				onclick={() => {
					isEditing = true;
				}}
			>
				{buttonText}
			</button>
		{/if}
	{/if}
</TextLabel>
