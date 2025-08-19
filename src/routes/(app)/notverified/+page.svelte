<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { verifyEmail } from "../(authorized)/profile/[[id]]/profile.remote";
</script>

<svelte:head>
	<title>Подтверждение регистрации | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top max-w-xl">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Аккаунт не поддтверждён
	</h2>

	<div class="text-center">
		<p class="mb-1">
			При регистрации на вашу почту было выслано сообщение с
			подтверждением регистрации
		</p>
		<p class="text-secondary mb-8">Сообщение могло попасть в спам</p>
		<div class="flex flex-wrap justify-center gap-2">
			<a href="/"
				><button class="!p-2 !text-base">Вернутся на главную</button></a
			>
			<form class="inline-block" {...verifyEmail}>
				<input type="hidden" name="verify" value="verify" />
				<button class="!p-2 !text-base">
					{#if verifyEmail.pending > 0}
						<span class="relative">
							Повторить сообщение
							<img
								class="absolute left-full top-0 mx-1 h-full"
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
