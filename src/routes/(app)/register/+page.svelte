<script lang="ts">
	import SuperDebug, { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, enhance, errors, message } = superForm(data.form);
</script>

<div class="center authForm contentBlock full-top min-w-96">
	<h2 class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold">Регистрация</h2>

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
				<input type="email" name="email" bind:value={$form.email} required/>
				<label for="email">Почта</label>
			</div>
			{#if $errors.email}
				<span class="errorMessage">{$errors.email}</span>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input type="password" name="password" bind:value={$form.password} required/>
				<label for="password">Пароль</label>
			</div>
			<div class="inputBox pt-2">
				<input type="password" name="password2" bind:value={$form.password2} required/>
				<label for="password2">Повторить пароль</label>
			</div>
			{#if $errors.password || $errors.password2}
				<span class="errorMessage">{$errors.password} {$errors.password2}</span>
			{/if}
		</div>

		<div class="flex justify-between"><a href="/recovery">Забыл пароль</a><a class="text-accent" href="/register">Регистрация</a></div>

		<button type="submit">Войти</button>
	</form>
</div>

<!-- <div class="center authForm full-top min-w-96">
	{#if data.hasToken}
		<span>Вы уже залогинены</span>
		<span>Профиль</span>
		<span>Выйти</span>
	{:else}
		<form class="flex flex-col m-auto" method="POST" use:enhance>
			<label for="username">Username</label>
			<input type="text" name="username" bind:value={$form.username} required />
			{#if $errors.username}
				<span class="errorMessage">{$errors.username}</span>
			{/if}

			<label for="password">Password</label>
			<input type="text" name="password" bind:value={$form.password} required />
			{#if $errors.password}
				<span class="errorMessage">{$errors.password}</span>
			{/if}

			<button
				class="button"
				type="submit">Submit</button
			>
		</form>
	{/if}
</div> -->

<style>
</style>
