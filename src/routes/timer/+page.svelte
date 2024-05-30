<script>
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
	import { DateTime } from 'luxon';
	import { Interval } from 'luxon';
	import { onMount } from 'svelte';

	let days;
	let hours;
	let minutes;
	let seconds;

	let target = DateTime.now().setLocale("ru").setZone("Europe/Tallinn").set({ year: 2024, month: 6, day: 1, hour: 12, minute: 0, second: 0 });
	//let target = DateTime.now().plus({ seconds: 5 })

	let interval = target.diff(DateTime.now(), ['days', 'hours', 'minutes', 'seconds']).toObject();

	days = Math.floor(interval.days)
	hours = Math.floor(interval.hours)
	minutes = Math.floor(interval.minutes)
	seconds = Math.floor(interval.seconds)

	onMount(() => {
		// Update the count down every 1 second
		var x = setInterval(function() {
			let interval = target.diff(DateTime.now(), ['days', 'hours', 'minutes', 'seconds']).toObject();

			days = Math.floor(interval.days)
			hours = Math.floor(interval.hours)
			minutes = Math.floor(interval.minutes)
			seconds = Math.floor(interval.seconds)

			if(target <= DateTime.now()){
				goto("/")
			}
		}, 1000);
	})
</script>

<div class="timer">
	<span class="countdown font-mono text-7xl">
		<span id="days" style="--value:1;">{days}</span>:
		<span id="hours" style="--value:2;">{hours}</span>:
		<span id="min" style="--value:33;">{minutes}</span>:
		<span id="sec" style="--value:33;">{seconds}</span>
	</span>
	<div class="hidden text-xl" id="text">  
		Something happened...
	</div>
</div>

<style>
	.timer {
		display: grid;
		place-items: center;
		height: 100vh;
		height: 100svh;
		text-align: center;
		font-size: 10rem;
	}
</style>
