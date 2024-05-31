<script lang="ts">
	import SuperDebug, { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, enhance, errors, message } = superForm(data.form);
</script>

<div class="center authForm full-top min-w-96">
	<h2 class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold">Вход</h2>

	<form method="POST" use:enhance>
		<div>
			<div class="inputBox">
				<input type="text" name="username" bind:value={$form.username} required/>
				<label for="username">Логин</label>
			</div>
			{#if $errors.username}
				<span class="errorMessage">{$errors.username}</span>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input type="password" name="password" bind:value={$form.password} required/>
				<label for="password">Пароль</label>
			</div>
			{#if $errors.password}
				<span class="errorMessage">{$errors.password}</span>
			{/if}
		</div>

		<div class="flex justify-between"><a href="/recovery">Забыл пароль</a><a class="text-accent" href="/register">Регистрация</a></div>

		<button type="submit">Войти</button>
	</form>
</div>

<style>
</style>
