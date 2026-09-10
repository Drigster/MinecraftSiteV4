<script lang="ts">
	import { sendForgotPassword } from "$lib/change.remote";
	import Button from "$lib/components/Button.svelte";
	import InputBox from "$lib/components/InputBox.svelte";
	import { forgotPasswordSchema } from "$lib/schemas";
	import { LoaderCircle } from "@o7/icon/lucide";
</script>

<svelte:head>
	<title>Восстановление пароля | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Восстановление<br />пароля
	</h2>

	{#if sendForgotPassword.result?.message}
		<div class="text-center">
			<p class="mb-8 max-w-[32ch]">
				{sendForgotPassword.result?.message}
			</p>
			<Button href="/">Вернутся на главную</Button>
		</div>
	{:else}
		<form
			class="flex flex-col"
			{...sendForgotPassword
				.preflight(forgotPasswordSchema)
				.enhance(async (form) => {
					try {
						if (await form.submit()) {
							form.element.reset();
						}
					} catch (error) {
						console.log(error);
					}
				})}
		>
			<InputBox
				id="login"
				title="Логин"
				field={sendForgotPassword.fields.login}
				autocomplete="username"
			/>

			<button
				type="submit"
				class="mt- rounded-[0.25rem] bg-accent p-3 text-xl text-black"
				disabled={sendForgotPassword.pending > 0}
			>
				{#if sendForgotPassword.pending > 0}
					<span class="flex items-center justify-center">
						Подтвердить
						<LoaderCircle class="mx-1 animate-spin" size="20" />
					</span>
				{:else}
					Подтвердить
				{/if}
			</button>
		</form>
	{/if}
</div>
