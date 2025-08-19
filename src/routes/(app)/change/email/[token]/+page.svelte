<script lang="ts">
	import { page } from "$app/state";
	import spiner from "$lib/assets/spiner.svg";
	import { changeEmail } from "../../change.remote";

	let { data } = $props();
</script>

<svelte:head>
	<title>Изменение почты | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Смена почты
	</h2>

	{#if data.message || changeEmail.result?.error.token}
		<div class="text-center">
			<p class="mb-8">
				{data.message || changeEmail.result?.error.token}
			</p>
			<a href="/"
				><button class="!p-2 !text-base">Вернутся на главную</button></a
			>
		</div>
	{:else}
		<form {...changeEmail}>
			<input type="text" name="token" value={page.params.token} hidden />
			<div>
				<div class="inputBox">
					<input type="email" name="email" required />
					<label for="email">Новая почта</label>
				</div>
				{#if changeEmail.result?.error.email}
					<span class="errorMessage"
						>{changeEmail.result?.error.email}</span
					>
				{/if}
			</div>

			<button type="submit">
				{#if changeEmail.pending > 0}
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

<style>
</style>
