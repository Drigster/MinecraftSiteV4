<script lang="ts">
	import { changePassword } from "$lib/change.remote";
	import Button from "$lib/components/Button.svelte";
	import InputBox from "$lib/components/InputBox.svelte";
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import { X } from "@o7/icon/lucide";
</script>

<div
	class="bg-blur relative min-w-96 rounded-lg bg-background/60 p-10"
	role="dialog"
	aria-modal="true"
	aria-label="Смена пароля"
>
	<div class="flex items-start justify-between gap-3">
		<div class="w-full">
			<h3 class="text-3xl font-bold tracking-tight text-accent">
				Смена пароля
			</h3>
			<p class="mb-4 max-w-[36ch] text-sm text-text-muted">
				Введите старый пароль и новый пароль дважды для подтверждения
			</p>
			<form
				{...changePassword.enhance(async (form) => {
					try {
						if (await form.submit()) {
							form.element.reset();
						}
					} catch (error) {
						console.log(error);
					}
				})}
				enctype="multipart/form-data"
			>
				<InputBox
					id="current-password"
					title="Старый пароль"
					field={changePassword.fields._current_password}
					autocomplete="current-password"
					isPassword={true}
				/>
				<InputBox
					id="password"
					title="Новый пароль"
					field={changePassword.fields._password}
					autocomplete="new-password"
					isPassword={true}
					noIssues={true}
				/>
				<InputBox
					id="password2"
					class="mt-2"
					title="Повторите новый пароль"
					field={changePassword.fields._password2}
					autocomplete="new-password"
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
					class="mt-2 w-full !bg-accent !text-black hover:!bg-accent/60"
				>
					Сохранить
				</SubmitButton>
			</form>
		</div>
		<div class="absolute right-4 top-4">
			<Button
				class="border-none bg-transparent !p-1 text-text"
				href="/profile"
			>
				<X />
			</Button>
		</div>
	</div>
</div>
