<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { forgotPassword } from "../change.remote";
	import { page } from "$app/state";
	import { getFlash } from "sveltekit-flash-message";

	const flash = getFlash(page);
</script>

<svelte:head>
	<title>Восстановление пароля | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Восстановление пароля
	</h2>

	{#if forgotPassword.result?.success}
		<div class="text-center">
			<p class="mb-8">{forgotPassword.result?.message}</p>
			<a href="/"
				><button class="!p-2 !text-base">Вернутся на главную</button></a
			>
		</div>
	{:else}
		<form
			{...forgotPassword.enhance(async ({ form, submit }) => {
				try {
					await submit();
					if (forgotPassword.result?.success == false) {
						return;
					}

					form.reset();
				} catch (error) {
					$flash = {
						type: "success",
						message: "Ошибка, попробуйте позже",
					};
					console.log(error);
				}
			})}
		>
			<div>
				<div class="inputBox">
					<input type="text" name="login" required />
					<label for="login">Логин</label>
				</div>
				{#if forgotPassword.result?.error.login}
					<span class="errorMessage"
						>{forgotPassword.result?.error.login[0]}</span
					>
				{/if}
			</div>

			<button type="submit">
				{#if forgotPassword.pending > 0}
					<span class="relative">
						Подтвердить
						<img
							class="absolute left-full top-0 mx-2 h-full"
							width="20"
							height="20"
							src={spiner}
							alt="Spiner icon"
						/>
					</span>
				{:else}
					Подтвердить
				{/if}
			</button>
		</form>
	{/if}
</div>
