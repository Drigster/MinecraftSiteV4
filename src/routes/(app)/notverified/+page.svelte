<script lang="ts">
	import { resendEmailVerify } from "$lib/change.remote";
	import Button from "$lib/components/Button.svelte";
	import SubmitButton from "$lib/components/SubmitButton.svelte";

	let locked = $state(true);
	let countdown = $state(30);
	let interval: ReturnType<typeof setTimeout> | undefined = $state();

	$effect(() => {
		interval = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				locked = false;
				clearInterval(interval);
			}
		}, 1000);

		return () => {
			console.log("clear");
			clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<title>Подтверждение регистрации | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Аккаунт не<br />подтверждён
	</h2>

	<div class="text-center">
		<p class="mx-auto mb-1 max-w-[32ch]">
			При регистрации на вашу почту было выслано сообщение с
			подтверждением регистрации
		</p>
		<p class="mb-8 text-text-muted">Сообщение могло попасть в спам</p>
		<div class="flex flex-col items-center justify-center gap-2">
			{#if resendEmailVerify.result?.message}
				<p class="mb-1 max-w-[32ch]">
					{resendEmailVerify.result?.message}
				</p>
			{:else}
				<form
					{...resendEmailVerify.enhance(async (form) => {
						try {
							if (await form.submit()) {
								countdown = 30;
								locked = true;
								form.element.reset();
							}
						} catch (error) {
							console.log(error);
						}
					})}
				>
					<SubmitButton
						disabled={locked}
						loading={resendEmailVerify.pending > 0}
						class="mx-auto"
						>Повторить сообщение {countdown > 0
							? countdown
							: ""}</SubmitButton
					>
				</form>
			{/if}
			<Button href="/">Вернутся на главную</Button>
		</div>
	</div>
</div>
