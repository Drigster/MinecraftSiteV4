<script lang="ts">
	import type { SuperValidated, Infer, InferIn } from "sveltekit-superforms";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import type { SkinSchema } from "../schemas";
	import { Check, XMark } from "@o7/icon/heroicons";
	import { Loader } from "@o7/icon/lucide";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/stores";
	import { string } from "zod";

	const flash = getFlash(page);

	let {
		data,
		idEditing = $bindable(false),
	}: {
		data: SuperValidated<Infer<SkinSchema>>;
		idEditing: boolean;
	} = $props();

	const { form, errors, enhance, delayed, message } = superForm(data, {
		resetForm: true,
		onUpdated({ form }) {
			idEditing = false;
			if (form.message) {
				$flash = {
					type: form.message.type,
					message: form.message.text,
					title: form.message.title,
				};
			}
			if (form.errors) {
				$flash = { type: "error", message: form.errors.skin };
			}
		},
		onError({ result }) {
			$flash = { type: "error", message: result.error.message };
		},
	});

	const files = fileProxy(form, "skin");
</script>

<form
	class="mb-1 flex"
	action="?/changeSkin"
	method="post"
	enctype="multipart/form-data"
	use:enhance
>
	<input
		class="w-full button"
		type="file"
		name="skin"
		accept="image/png"
		bind:files={$files}
	/>
	<div class="flex gap-1 mx-1">
		{#if $delayed}
			<button type="submit" disabled>
				<Loader class="h-full w-full animate-spin" size="20" />
			</button>
		{:else}
			<button type="submit">
				<Check class="h-full w-full" size="20" />
			</button>
		{/if}
		<button
			type="button"
			onclick={() => {
				idEditing = false;
			}}
		>
			<XMark class="h-full w-full" size="20" /></button
		>
	</div>
</form>
