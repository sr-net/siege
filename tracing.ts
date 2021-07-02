import { lightstep } from "lightstep-opentelemetry-launcher-node"

const sdk = lightstep.configureOpenTelemetry({
  serviceName: "siege",
})

if (process.env.OTEL_EXPORTER_OTLP_SPAN_ENDPOINT != null) {
  sdk.start()
}
