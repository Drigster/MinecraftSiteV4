<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { form, enhance, errors, message, delayed } = superForm(data.form);
</script>

<div class="center authForm contentBlock full-top min-w-96">
	<h2 class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold">Смена пароля</h2>

	{#if $message}
		<div class="text-center">
			<p class="mb-8">{$message}</p>
			<a href="/"><button class="!p-2 !text-base">Вернутся на главную</button></a>
		</div>
	{:else}
		<form method="POST" use:enhance>
			<div>
				<div class="inputBox">
					<input type="password" name="password" bind:value={$form.password} required />
					<label for="password">Новый пароль</label>
				</div>
				<div class="inputBox pt-2">
					<input type="password" name="password2" bind:value={$form.password2} required />
					<label for="password2">Повторить пароль</label>
				</div>
				{#if $errors.password || $errors.password2}
					<span class="errorMessage">{$errors.password} {$errors.password2}</span>
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
	{/if}
</div>
