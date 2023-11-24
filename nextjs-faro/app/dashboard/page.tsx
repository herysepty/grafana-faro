'use client';
import React, { useState, useEffect } from 'react'
import { ConsoleInstrumentation, getWebInstrumentations, initializeFaro, InternalLoggerLevel } from '@grafana/faro-web-sdk';
    import { TracingInstrumentation } from '@grafana/faro-web-tracing';
// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
    const [data, setData] = useState(null)
 
  useEffect(() => {

    const faro = initializeFaro({
      url: 'http://host.docker.internal:12345/collect',
      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],
      app: {
        name: 'frontend',
        version: '1.0.0',
      },
      internalLoggerLevel: InternalLoggerLevel.VERBOSE,
    });
    
    // const faro = initializeFaro({
    //   url: 'http://localhost:12345/collect',
    //   apiKey: 'secret',
    //   instrumentations: [...getWebInstrumentations({ captureConsole: true }), new TracingInstrumentation()],
    //   app: {
    //     name: 'frontend',
    //     version: '1.0.0',
    //   },
    //   internalLoggerLevel: InternalLoggerLevel.VERBOSE,
    // });
    
    // // start a span
    // faro.api
    //   .getOTEL()
    //   ?.trace.getTracer('frontend')
    //   .startActiveSpan('hello world', (span) => {
    //     // send a log message
    //     faro.api.pushLog(['hello world']);
    //     span.end();
    //   });
    
    // will be captured
    // throw new Error('oh no');
        // const faro = initializeFaro({
        //     url: 'http://localhost:12345/collect',
        //     apiKey: 'secret',
        //     app: {
        //       name: 'frontend',
        //       version: '1.0.0',
        //     },
        //     internalLoggerLevel: InternalLoggerLevel.VERBOSE,
        //     // internalLoggerLevel: InternalLoggerLevel.VERBOSE,

        // });

        faro?.api?.pushLog(['hello world']);
        // faro?.api?.pushError(new Error('oh no'));

          
        //   // will be captured
        //   throw new Error('oh no');
          
        //   // push error manually

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