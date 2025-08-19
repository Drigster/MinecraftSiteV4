<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { page } from "$app/state";
	import { changePassword } from "../../change.remote.js";

	let { data } = $props();
</script>

<svelte:head>
	<title>Изменение пароля | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Смена пароля
	</h2>

	{#if data.message || changePassword.result?.error.token}
		<div class="text-center">
			<p class="mb-8">
				{data.message || changePassword.result?.error.token}
			</p>
			<a href="/"
				><button class="!p-2 !text-base">Вернутся на главную</button></a
			>
		</div>
	{:else}
		<form {...changePassword}>
			<input type="text" name="token" value={page.params.token} hidden />
			<div>
				<div class="inputBox">
					<input type="password" name="password" required />
					<label for="password">Новый пароль</label>
				</div>
				<div class="inputBox pt-2">
					<input type="password" name="password2" required />
					<label for="password2">Повторить пароль</label>
				</div>
				{#if changePassword.result?.error.password || changePassword.result?.error.password2}
					<span class="errorMessage"
						>{changePassword.result?.error.password}
						{changePassword.result?.error.password2}</span
					>
				{/if}
			</div>

			<button type="submit">
				{#if changePassword.pending > 0}
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
