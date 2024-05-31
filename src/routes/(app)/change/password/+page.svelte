<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { form, enhance, errors, message, delayed } = superForm(data.form);
</script>

<div class="center authForm contentBlock full-top min-w-96">
	<h2 class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold">
		Восстановление пароля
	</h2>

	{#if $message}
		<div class="text-center">
			<p class="mb-8">{$message}</p>
			<a href="/"><button class="!p-2 !text-base">Вернутся на главную</button></a>
		</div>
	{:else}
		<form method="POST" use:enhance>
			<div>
				<div class="inputBox">
					<input type="text" name="login" bind:value={$form.login} required />
					<label for="login">Логин</label>
				</div>
				{#if $errors.login}
					<span class="errorMessage">{$errors.login} {$errors.login}</span>
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
