import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'control-plane',
  }),
  traceExporter: new OTLPTraceExporter({
      url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318') + '/v1/traces',
  }),
});

sdk.start();
