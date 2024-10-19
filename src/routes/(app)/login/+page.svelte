<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { form, enhance, errors, delayed } = superForm(data.form);
</script>

<svelte:head>
	<title>Вход | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	{#if data.user?.username != undefined}
		<h2
			class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold"
		>
			Вы уже залогинены
		</h2>
		<div class="flex justify-between px-4">
			<a href="/profile">В профиль</a> <a href="/logout">Выйти</a>
		</div>
	{:else}
		<h2
			class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold"
		>
			Вход
		</h2>

		<form method="post" use:enhance>
			<div>
				<div class="inputBox">
					<input
						type="text"
						name="login"
						bind:value={$form.login}
						required
					/>
					<label for="login">Логин</label>
				</div>
				{#if $errors.login}
					<span class="errorMessage">{$errors.login}</span>
				{/if}
			</div>

			<div>
				<div class="inputBox">
					<input
						type="password"
						name="password"
						bind:value={$form.password}
						required
					/>
					<label for="password">Пароль</label>
				</div>
				{#if $errors.password}
					<span class="errorMessage">{$errors.password}</span>
				{/if}
			</div>

			<div class="flex justify-between">
				<a href="/recovery">Забыл пароль</a><a
					class="text-accent"
					href="/register">Регистрация</a
				>
			</div>

			<button type="submit">
				{#if $delayed}
					<span class="relative">
						Войти
						<img
							class="h-full mx-2 absolute left-full top-0"
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
	{/if}
</div>
