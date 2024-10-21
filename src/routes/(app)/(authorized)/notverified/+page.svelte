<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { enhance, message, delayed } = superForm(data.form);
</script>

<svelte:head>
	<title>Подтверждение регистрации | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top max-w-xl">
	<h2
		class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold"
	>
		Аккаунт не поддтверждён
	</h2>

	<div class="text-center">
		<p class="mb-8">
			Для продолжения подтвердите регистрацию. Для продтверждения на почту
			было оправлено сообщение. (Сообщение с подтверждением может попадать
			в спам).
		</p>
		{#if $message}
			<p class="mb-8">{$message}</p>
		{/if}
		<div class="flex flex-wrap justify-center gap-2">
			<a href="/"
				><button class="!p-2 !text-base">Вернутся на главную</button></a
			>
			<form class="inline-block" method="post" use:enhance>
				<input type="hidden" name="verify" value="verify" />
				<button class="!p-2 !text-base">
					{#if $delayed}
						<span class="relative">
							Повторить сообщение
							<img
								class="h-full mx-1 absolute left-full top-0"
								width="20"
								height="20"
								src={spiner}
								alt="Spiner icon"
							/>
						</span>
					{:else}
						Повторить сообщение
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
