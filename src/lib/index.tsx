'use client'

import { useEffect, useRef, useState } from 'react'

import {
    attachPart,
    isPartVisibile,
    onPartVisibilityChange,
    Parts
} from '@codingame/monaco-vscode-views-service-override'

import { setupPromise } from './setup'

function App() {
    const editorRef = useRef<HTMLDivElement>(null)
    const explorerRef = useRef<HTMLDivElement>(null)

    const [ideReady, setIdeReady] = useState(false)

    useEffect(() => {
        setupPromise.then(() => setIdeReady(true))
    }, [])
    useEffect(() => {
        if (!editorRef.current || !explorerRef.current || !ideReady) return

        const panels = [
            {
                part: 'workbench.parts.editor' as Parts,
                element: editorRef.current
            },
            {
                part: 'workbench.parts.sidebar' as Parts,
                element: explorerRef.current
            }
        ]

        panels.map((panel) => {
            attachPart(panel.part, panel.element)

            if (!isPartVisibile(panel.part)) {
                panel.element.style.display = 'none'
            }

            onPartVisibilityChange(panel.part, (visible) => {
                if (!panel.element) return
                panel.element.style.display = visible ? 'block' : 'none'
            })
        })
    }, [ideReady])
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row'
            }}
        >
            <div
                ref={editorRef}
                style={{
                    height: '90vh',
                    width: '50%'
                }}
            ></div>

            <div
                ref={explorerRef}
                style={{
                    height: '90vh',
                    width: '50%'
                }}
            ></div>
        </div>
    )
}

export default App
