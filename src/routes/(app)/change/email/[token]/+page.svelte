<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { form, enhance, errors, delayed } = superForm(data.form);
</script>

<svelte:head>
	<title>Изменение почты | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold"
	>
		Смена почты
	</h2>

	<form method="post" use:enhance>
		<div>
			<div class="inputBox">
				<input
					type="email"
					name="email"
					bind:value={$form.email}
					required
				/>
				<label for="email">Новая почта</label>
			</div>
			{#if $errors.email}
				<span class="errorMessage">{$errors.email}</span>
			{/if}
		</div>

		<button type="submit">
			{#if $delayed}
				<span class="relative">
					Подтвердить
					<img
						class="h-full mx-2 absolute left-full top-0"
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
</div>

<style>
</style>
