'use client';
import React, { useState, useEffect } from 'react'
import {
    getWebInstrumentations,
    initializeFaro,
    // LogLevel,
  } from '@grafana/faro-web-sdk';
  import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Page() {
    const [data, setData] = useState(null)
 
  useEffect(() => {
    
    const faro = initializeFaro({
        url: 'http://localhost:8888/collect',
        instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
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