'use client'

import { useEffect, useRef } from 'react'

import { init } from './editor'

export default function Editor() {
    const editorRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!editorRef.current) return

        init(editorRef.current)
            .catch(console.error)
            .then(() => {
                console.log('Editor initialized')
            })
    }, [])

    return (
        <main
            ref={editorRef}
            style={{
                height: '100vh'
            }}
        ></main>
    )
}
