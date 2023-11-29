

  'use client';
import React, { useState, useEffect } from 'react'
import {
    ConsoleInstrumentation,
    ConsoleTransport,
    ErrorsInstrumentation,
    FetchTransport,
    initializeFaro,
    LogLevel,
    SessionInstrumentation,
    WebVitalsInstrumentation,
  } from '@grafana/faro-web-sdk';
// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
    const [data, setData] = useState(null)
 
  useEffect(() => {
      
      const faro = initializeFaro({
        instrumentations: [
          new ErrorsInstrumentation(),
          new WebVitalsInstrumentation(),
          new ConsoleInstrumentation({
            disabledLevels: [LogLevel.TRACE, LogLevel.ERROR], // console.log will be captured
          }),
          new SessionInstrumentation(),
        ],
        transports: [
          new FetchTransport({
            url: 'http://localhost:8888/collect',
            apiKey: 'secret',
          }),
          new ConsoleTransport(),
        ],
        app: {
          name: 'frontend',
          version: '1.0.0',
        },
      });

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