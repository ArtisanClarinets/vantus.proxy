import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'control-plane',
  }),
  traceExporter: new OTLPTraceExporter({
      url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318') + '/v1/traces',
  }),
});

export function init() {
    sdk.start();
}
