'use client';
import React, { useState, useEffect } from 'react'
import { ConsoleInstrumentation, getWebInstrumentations, initializeFaro, InternalLoggerLevel } from '@grafana/faro-web-sdk';
    import { TracingInstrumentation } from '@grafana/faro-web-tracing';
// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
    const [data, setData] = useState(null)
 
  useEffect(() => {

    const faro = initializeFaro({
      url: 'http://localhost:8888/collect',
      apiKey: 'secret',
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
    
    faro?.api?.pushLog(['hello world']);

    const fetchData = async () => {
      const response = await fetch('https://api.sampleapis.com/futurama/info')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      faro?.api?.pushLog(result);

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