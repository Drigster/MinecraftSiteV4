<script lang="ts">
	import type { PageData } from "./$types";
	import { DateTime } from "luxon";

	let { data }: { data: PageData } = $props();
</script>

<div class="contentBlock p-4">
	<h2 class="text-2xl">Игроки</h2>
	<ul class="tableList">
		<li class="header">
			<span>Никнейм</span>
			<span>Верефикация</span>
			<span>Дата регистрации</span>
			<span>Последний вход</span>
		</li>
		{#each data.users as user (user.uuid)}
			<li>
				<span>{user.username}</span>
				<span>
					{#if user.verified}
						Верефицирован
					{:else}
						Не верефицирован
					{/if}
				</span>
				<span>
					{DateTime.fromSQL(user.regDate)
						.setLocale("ru")
						.toLocaleString(DateTime.DATETIME_SHORT)}
				</span>
				<span>
					{#if user.lastPlayed}
						{DateTime.fromSQL(user.lastPlayed)
							.setLocale("ru")
							.toLocaleString(DateTime.DATETIME_SHORT)}
					{:else}
						Отсутствует
					{/if}
				</span>
				<span></span>
				<span class="ml-auto">
					<a href="/profile/{user.id}">Профиль</a>
				</span>
			</li>
		{/each}
	</ul>
</div>
