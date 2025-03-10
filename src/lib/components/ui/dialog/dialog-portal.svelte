<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	type $$Props = DialogPrimitive.PortalProps;
</script>

<DialogPrimitive.Portal {...$$restProps}>
	<slot />
</DialogPrimitive.Portal>

<style>
	:global([data-portal], [data-melt-dialog-portalled], [data-dialog-portal]) {
		position: absolute !important;
	}
</style>
