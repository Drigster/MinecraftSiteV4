<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import {
		removeCape,
		removeSkin,
		uploadCape,
		uploadSkin,
	} from "$lib/skin.remote";
	import { Download, Trash, X } from "@o7/icon/lucide";
</script>

<div
	class="bg-blur relative w-full min-w-96 rounded-lg border border-text bg-background/60 p-6"
	role="dialog"
	aria-modal="true"
	aria-label="Смена скина"
>
	<div class="flex items-start justify-between gap-3">
		<div>
			<div class="mb-4">
				<h3 class="text-xl font-bold tracking-tight">Скин</h3>
				<p class="mb-4 max-w-[36ch] text-sm text-text-muted">
					Поддерживаются скины в размере 64x64 пикселя и форматы PNG и
					JPEG
				</p>
				<div class="flex gap-1">
					<form
						{...uploadSkin.enhance(async (form) => {
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
						<label
							class="peer inline-block cursor-pointer rounded-md bg-accent px-[1em] pb-[0.5em] pt-[0.5em] align-middle leading-4 text-black transition-colors hover:bg-accent/60 disabled:cursor-default disabled:bg-accent/60"
						>
							Загрузить
							<input
								class="hidden"
								{...uploadSkin.fields.skin.as("file")}
								accept="image/png,image/jpeg"
								onchange={(e) =>
									e.currentTarget.form?.requestSubmit()}
								required
							/>
						</label>
						<noscript>
							<Button class="hidden" type="submit"
								>Сохранить</Button
							>
						</noscript>
					</form>
					<Button class="!p-1.5" type="submit">
						<Download size="20" />
					</Button>
					<form
						{...removeSkin.enhance(async (form) => {
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
						<Button class="!p-1.5" type="submit">
							<Trash size="20" />
						</Button>
					</form>
				</div>
			</div>
			<div>
				<h3 class="text-xl font-bold tracking-tight">Плащ</h3>
				<p class="mb-4 max-w-[36ch] text-sm text-text-muted">
					Поддерживаются плащи в размере 64x32 пикселя и форматы PNG и
					JPEG
				</p>
				<div class="flex gap-1">
					<form
						{...uploadCape.enhance(async (form) => {
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
						<label
							class="peer inline-block cursor-pointer rounded-md bg-accent px-[1em] pb-[0.5em] pt-[0.5em] align-middle leading-4 text-black transition-colors hover:bg-accent/60 disabled:cursor-default disabled:bg-accent/60"
						>
							Загрузить
							<input
								class="hidden"
								{...uploadCape.fields.cape.as("file")}
								accept="image/png,image/jpeg"
								onchange={(e) =>
									e.currentTarget.form?.requestSubmit()}
								required
							/>
						</label>
						<noscript>
							<Button class="hidden" type="submit"
								>Сохранить</Button
							>
						</noscript>
					</form>
					<Button class="!p-1.5">
						<Download size="20" />
					</Button>
					<form
						{...removeCape.enhance(async (form) => {
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
						<Button class="!p-1.5" type="submit">
							<Trash size="20" />
						</Button>
					</form>
				</div>
			</div>
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

<style>
	.itest:valid {
		background: red;
	}

	:global(.no-js) .peer:has(input:valid) {
		display: none;
	}

	:global(.no-js .peer:has(input:valid) ~ noscript button) {
		display: block;
	}
</style>
