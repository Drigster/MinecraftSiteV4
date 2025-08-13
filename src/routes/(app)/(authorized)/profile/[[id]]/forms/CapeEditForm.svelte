<script lang="ts">
	import { Check, XMark } from "@o7/icon/heroicons";
	import { Loader } from "@o7/icon/lucide";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/state";
	import { uploadCape } from "../functions.remote";

	const flash = getFlash(page);

	let {
		idEditing = $bindable(false),
	}: {
		idEditing: boolean;
	} = $props();
</script>

<form
	class="mb-1 flex"
	enctype="multipart/form-data"
	{...uploadCape.enhance(async ({ form, submit }) => {
		try {
			await submit();
			if (uploadCape.result?.success) {
				form.reset();
				idEditing = false;
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
	<input class="w-full button" type="file" name="cape" accept="image/png" />
	<div class="flex gap-1 mx-1">
		{#if uploadCape.pending > 0}
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
