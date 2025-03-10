<script lang="ts">
	import { twMerge } from "tailwind-merge";
	import { ToastLevel, dismissToast, toasts } from "./store";
	import {
		CheckCircle,
		ExclamationCircle,
		XCircle,
	} from "@o7/icon/heroicons";
	import * as Alert from "$lib/components/ui/alert";

	export let divClass = "w-full max-w-xs p-4 ";

	export let placement:
		| "top-left"
		| "top-center"
		| "top-right"
		| "center"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right" = "center";
	const placements = {
		"top-left": "absolute top-0 left-0",
		"top-center": "absolute top-0 left-1/2 -translate-x-1/2",
		"top-right": "absolute top-0 right-0",
		center: "absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2",
		"bottom-left": "absolute bottom-0 left-0",
		"bottom-center": "absolute bottom-0 left-1/2 -translate-x-1/2",
		"bottom-right": "absolute bottom-0 right-0",
	};

	let toastsClass: string;
	$: toastsClass = twMerge(divClass, placements[placement], $$props.class);
</script>

{#if $toasts}
	<section class={toastsClass}>
		{#each $toasts as toast (toast.id)}
			<Alert.Root
				variant={toast.type == ToastLevel.Error
					? "destructive"
					: "default"}
				on:close={() => dismissToast(toast.id)}
			>
				{#if toast.type == ToastLevel.Error}
					<XCircle size="24" />
				{:else if toast.type == ToastLevel.Success}
					<CheckCircle size="24" />
				{:else}
					<ExclamationCircle size="24" />
				{/if}
				{#if toast.title}
					<Alert.Title>{toast.title}</Alert.Title>
				{/if}
				<Alert.Description>
					{toast.message}
				</Alert.Description>
			</Alert.Root>
		{/each}
	</section>
{/if}
