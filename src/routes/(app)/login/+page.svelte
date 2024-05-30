<script lang="ts">
	import SuperDebug, { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, enhance, errors, message } = superForm(data.form);
</script>

<div class="center authForm full-top min-w-96">
	{#if data.hasToken}
		<span>Вы уже залогинены</span>
		<span>Профиль</span>
		<span>Выйти</span>
	{:else}
		<div class="pb-2">
			<SuperDebug data={form} />
		</div>
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
				class="mt-4 p-1 mx-auto w-1/2 rounded-md border border-gray-700 bg-gray-500"
				type="submit">Submit</button
			>
		</form>
	{/if}
</div>

<style>
	.authForm {
		background-color: #444;
		border-radius: 0.5rem;
		padding: 0.5rem;
		border: #222 solid 2px;
	}
</style>
