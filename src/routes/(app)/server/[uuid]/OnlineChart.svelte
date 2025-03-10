<script lang="ts">
	import { Axis, Chart, Spline, Svg, Tooltip, Highlight } from "layerchart";
	import { scaleTime } from "d3-scale";
	import { DateTime } from "luxon";

	const dateSeriesData: { date: Date; value: number }[] = [];
	let startTime = new Date("2025-01-27T22:00:00.000Z");

	let startValue = Math.floor(Math.random() * 5);

	for (let i = 0; i < 288; i++) {
		let value;
		if (Math.floor(Math.random() * 10) == 1) {
			const rand = Math.floor(Math.random() * 3) - 1;
			const randValue =
				rand < 0 && startValue <= 0 ? startValue : startValue + rand;
			startValue = randValue;
			value = randValue;
		} else {
			value = startValue;
		}

		dateSeriesData.push({
			date: new Date(startTime),
			value: value,
		});
		startTime.setMinutes(startTime.getMinutes() + 5);
	}
</script>

<div class="h-full p-4 border rounded">
	<Chart
		data={dateSeriesData}
		x="date"
		xScale={scaleTime()}
		y="value"
		yDomain={[0, null]}
		padding={{ left: 16, right: 16, top: 16, bottom: 16 }}
		tooltip={{ mode: "bisect-x" }}
	>
		<Svg>
			<Axis
				classes={{
					tick: "stroke-primary",
					rule: "stroke-primary",
					tickLabel: "fill-primary",
				}}
				placement="left"
				rule
				grid={{ class: "stroke-gray-900" }}
			/>
			<Axis
				classes={{
					tick: "stroke-primary",
					rule: "stroke-primary",
					tickLabel: "fill-primary",
				}}
				placement="bottom"
				format={(d) =>
					DateTime.fromJSDate(d as Date).toLocaleString(
						DateTime.TIME_24_SIMPLE,
					)}
				rule
			/>
			<Spline class="stroke-[2] stroke-accent" />
			<Highlight points lines={{ class: "stroke-secondary" }} />
		</Svg>

		<Tooltip.Root
			classes={{
				root: "bg-background",
			}}
			let:data
		>
			<Tooltip.Header
				>{DateTime.fromJSDate(data.date as Date).toLocaleString(
					DateTime.TIME_24_SIMPLE,
				)}</Tooltip.Header
			>
			<Tooltip.List>
				<Tooltip.Item label="Онлайн" value={data.value} />
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>
