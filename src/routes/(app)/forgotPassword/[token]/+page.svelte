<script lang="ts">
	import { changePassword, recoverPassword } from "$lib/change.remote.js";
	import { recoverPasswordSchema } from "$lib/schemas.js";
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import Button from "$lib/components/Button.svelte";
	import InputBox from "$lib/components/InputBox.svelte";

	let { data, params } = $props();
</script>

<svelte:head>
	<title>Изменение пароля | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Смена пароля
	</h2>

	{#if data.message || (recoverPassword.fields.token.issues()?.length || 0) > 0 || recoverPassword.result?.message}
		<div class="text-center">
			<p class="mb-8">
				{data.message ||
					recoverPassword.fields.token.issues()?.join("; ") ||
					recoverPassword.result?.message}
			</p>
			<Button href="/">Вернутся на главную</Button>
		</div>
	{:else}
		<form
			class="flex flex-col"
			{...recoverPassword
				.preflight(recoverPasswordSchema)
				.enhance(async (form) => {
					try {
						if (await form.submit()) {
							form.element.reset();
						}
					} catch (error) {
						console.log(error);
					}
				})}
		>
			<input
				class="hidden"
				name="token"
				type="text"
				value={params.token}
			/>
			<InputBox
				id="password"
				title="Пароль"
				field={changePassword.fields._password}
				autocomplete="email"
				isPassword={true}
				noIssues={true}
			/>
			<InputBox
				id="password2"
				class="mt-2"
				title="Повторить пароль"
				field={changePassword.fields._password2}
				autocomplete="email"
				isPassword={true}
				noIssues={true}
			/>
			<div class="min-h-4">
				{#each changePassword.fields._password.issues() as issue (issue.message + issue.path)}
					<span class="absolute ml-2 text-sm text-red-500"
						>{issue.message}</span
					>
				{/each}
				{#each changePassword.fields._password2.issues() as issue (issue.message + issue.path)}
					<span class="absolute ml-2 text-sm text-red-500"
						>{issue.message}</span
					>
				{/each}
			</div>

			<SubmitButton
				class="mt-3"
				disabled={changePassword.pending > 0}
				loading={changePassword.pending > 0}>Подтвердить</SubmitButton
			>
		</form>
	{/if}
</div>
