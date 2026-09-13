import { API_BEARER } from "$env/static/private";
import { createLauncherUserHardware } from "$lib/server/api_utils";
import { json } from "@sveltejs/kit";

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
		oemId?: string;
	};
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

	if (
		requestData.info == undefined ||
		requestData.info.hwDiskId == undefined ||
		requestData.info.baseboardSerialNumber == undefined ||
		requestData.info.bitness == undefined ||
		requestData.info.totalMemory == undefined ||
		requestData.info.logicalProcessors == undefined ||
		requestData.info.physicalProcessors == undefined ||
		requestData.info.processorMaxFreq == undefined ||
		requestData.info.battery == undefined
	) {
		console.warn(
			"GetByData has unexpected data",
			JSON.stringify(requestData.info),
		);

		const error = {
			error: "Bad Request",
			code: 400,
		};

		return json(error, {
			status: error.code,
		});
	}

	let query = locals.db
		.selectFrom("Hardware")
		.selectAll()
		.where("hw_disk_id", "=", requestData.info.hwDiskId)
		.where("bitness", "=", requestData.info.bitness)
		.where("total_memory", "=", requestData.info.totalMemory)
		.where("logical_processors", "=", requestData.info.logicalProcessors)
		.where("physical_processors", "=", requestData.info.physicalProcessors)
		.where("processor_max_freq", "=", requestData.info.processorMaxFreq)
		.where("battery", "=", requestData.info.battery);

	if (requestData.info.baseboardSerialNumber != "unknown") {
		query = query.where(
			"baseboard_serial_number",
			"=",
			requestData.info.baseboardSerialNumber,
		);
	}
	if (requestData.info.displayId) {
		query = query.where(
			"display_ids",
			"=",
			requestData.info.displayId!.join(";"),
		);
	}
	if (requestData.info.oemId) {
		query = query.where("oem_id", "=", requestData.info.oemId);
	}

	const hardware = await query.executeTakeFirst();

	if (hardware == null) {
		const error = {
			error: "No Content",
			code: 404,
		};

		return json(error, { status: 404 });
	}

	return json(createLauncherUserHardware(hardware));
}
