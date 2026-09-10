<script lang="ts">
	import { confirmEmailChange } from "$lib/change.remote";
	import Button from "$lib/components/Button.svelte";
	import InputBox from "$lib/components/InputBox.svelte";
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import { X } from "@o7/icon/lucide";
	import { onMount } from "svelte";

	onMount(() => {
		confirmEmailChange.element?.reset();
	});
</script>

<div
	class="bg-blur relative min-w-96 rounded-lg bg-background/60 p-10"
	role="dialog"
	aria-modal="true"
	aria-label="Смена почты"
>
	<div class="flex items-start justify-between gap-3">
		<div class="w-full">
			<h3 class="text-3xl font-bold tracking-tight text-accent">
				Смена почты
			</h3>
			{#if confirmEmailChange.result?.message}
				<p class="mb-4 max-w-[36ch] text-sm text-text-muted">
					{confirmEmailChange.result?.message}
				</p>
				<Button href="/profile">Вернутся к профилю</Button>
			{:else}
				<p class="mb-4 max-w-[36ch] text-sm text-text-muted">
					Введите получный код чтобы подтвердить изменение почты
				</p>
				<form
					{...confirmEmailChange.enhance(async (form) => {
						try {
							if (await form.submit()) {
								form.element.reset();
							}
						} catch (error) {
							console.log(error);
						}
					})}
					enctype="multipart/form-data"
				>
					<InputBox
						id="code"
						title="Код"
						field={confirmEmailChange.fields.code}
						pattern="^[0-9]{'{0,6}'}$"
					/>

					<SubmitButton
						class="mt-2 w-full !bg-accent !text-black hover:!bg-accent/60"
					>
						Сохранить
					</SubmitButton>
				</form>
			{/if}
		</div>
		<div class="absolute right-4 top-4">
			<Button
				class="border-none bg-transparent !p-1 text-text"
				href="/profile"
			>
				<X />
			</Button>
		</div>
	</div>
</div>
