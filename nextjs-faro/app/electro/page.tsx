'use client';
import React, { useState, useEffect } from 'react'
import { trace, context } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { initializeFaro } from '@grafana/faro-web-sdk';
import { FaroSessionSpanProcessor, FaroTraceExporter } from '@grafana/faro-web-tracing';
// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
    const [data, setData] = useState(null)
 
  useEffect(() => {
    
    const VERSION = '1.0.0';
    const NAME = 'frontend';
    const COLLECTOR_URL = 'http://localhost:8888/collect';
    
    // initialize faro
    const faro = initializeFaro({
      url: COLLECTOR_URL,
      apiKey: 'secret',
      app: {
        name: NAME,
        version: VERSION,
      },
    });
    
    // set up otel
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: NAME,
        [SemanticResourceAttributes.SERVICE_VERSION]: VERSION,
      })
    );
    
    const provider = new WebTracerProvider({ resource });
    
    // provider.addSpanProcessor(new FaroSessionSpanProcessor(new BatchSpanProcessor(new FaroTraceExporter({ ...faro }))));
    
    provider.register({
      propagator: new W3CTraceContextPropagator(),
      contextManager: new ZoneContextManager(),
    });
    
    const ignoreUrls = [COLLECTOR_URL];
    
    // Please be aware that this instrumentation originates from OpenTelemetry
    // and cannot be used directly in the initializeFaro instrumentations options.
    // If you wish to configure these instrumentations using the initializeFaro function,
    // please utilize the instrumentations options within the TracingInstrumentation class.
    registerInstrumentations({
      instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation({ ignoreUrls }),
        new XMLHttpRequestInstrumentation({ ignoreUrls }),
      ],
    });
    
    // register OTel with Faro
    faro.api.initOTEL(trace, context);

    const fetchData = async () => {
      const response = await fetch('https://api.sampleapis.com/futurama/info')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      faro?.api?.pushError(result);

        // send a log message
      setData(result[0].synopsis)
    }
 
    fetchData().catch((e) => {
      // handle the error as needed
      console.error('An error occurred while fetching the data: ', e)
    })
  }, [])
 
  return <p>{data ? `Your data: ${data}` : 'Loading...'}</p>
  }