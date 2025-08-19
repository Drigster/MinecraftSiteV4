<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { login } from "../auth.remote";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/state";

	const flash = getFlash(page);
</script>

<svelte:head>
	<title>Вход | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Вход
	</h2>
	<form
		{...login.enhance(async ({ form, submit }) => {
			try {
				await submit();
				if (login.result?.success == false) {
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
			{#if login.result?.error.login}
				<span class="errorMessage">{login.result?.error.login[0]}</span>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input type="password" name="password" required />
				<label for="password">Пароль</label>
			</div>
			{#if login.result?.error.password}
				<span class="errorMessage"
					>{login.result?.error.password[0]}</span
				>
			{/if}
		</div>

		<div class="flex justify-between">
			<a href="/change/password">Забыл пароль</a><a
				class="text-accent"
				href="/register">Регистрация</a
			>
		</div>

		<button type="submit">
			{#if login.pending > 0}
				<span class="relative">
					Войти
					<img
						class="absolute left-full top-0 mx-2 h-full"
						width="20"
						height="20"
						src={spiner}
						alt="Spiner icon"
					/>
				</span>
			{:else}
				Войти
			{/if}
		</button>
	</form>
</div>
