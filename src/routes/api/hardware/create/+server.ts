import { API_BEARER } from "$env/static/private";
import { createLauncherUserHardware } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";
import { nanoid } from "nanoid";

type Request = {
	info: {
		hwDiskId: string;
		baseboardSerialNumber: string;
		displayId?: string[];
		bitness: number;
		totalMemory: number;
		logicalProcessors: number;
		physicalProcessors: number;
		processorMaxFreq: number;
		battery: boolean;
		oemId: string;
	};
	publicKey: string;
};

export async function POST({ request, locals }) {
	if (request.headers.get("Authorization") !== `Bearer ${API_BEARER}`) {
		const error = {
			error: "Unauthorized",
			code: 401,
		};

		return json(error, {
			status: error.code,
		});
	}

	const requestData: Request = await request.json();
	if (requestData.publicKey == undefined || requestData.info == undefined) {
		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	const hardware = await locals.db
		.insertInto("Hardware")
		.values({
			id: `h_${nanoid()}`,
			public_key: requestData.publicKey,
			hw_disk_id: requestData.info.hwDiskId,
			baseboard_serial_number:
				requestData.info.baseboardSerialNumber != "unknown"
					? requestData.info.baseboardSerialNumber
					: null,
			display_ids: requestData.info.displayId
				? requestData.info.displayId.join(";")
				: null,
			bitness: requestData.info.bitness,
			total_memory: requestData.info.totalMemory,
			logical_processors: requestData.info.logicalProcessors,
			physical_processors: requestData.info.physicalProcessors,
			processor_max_freq: requestData.info.processorMaxFreq,
			battery: requestData.info.battery,
			oem_id: requestData.info.oemId,
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	return json(createLauncherUserHardware(hardware));
}
