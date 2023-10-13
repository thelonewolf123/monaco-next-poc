'use client'

import '@codingame/monaco-vscode-css-default-extension'
import '@codingame/monaco-vscode-diff-default-extension'
import '@codingame/monaco-vscode-html-default-extension'
import '@codingame/monaco-vscode-javascript-default-extension'
import '@codingame/monaco-vscode-json-default-extension'
// import '@codingame/monaco-vscode-markdown-basics-default-extension'
import '@codingame/monaco-vscode-typescript-basics-default-extension'
import '@codingame/monaco-vscode-xml-default-extension'
import '@codingame/monaco-vscode-yaml-default-extension'
import '@codingame/monaco-vscode-theme-defaults-default-extension'
import '@codingame/monaco-vscode-theme-seti-default-extension'
// import '@codingame/monaco-vscode-references-view-default-extension'
// import '@codingame/monaco-vscode-configuration-editing-default-extension'
import '@codingame/monaco-vscode-npm-default-extension'
// import '@codingame/monaco-vscode-media-preview-default-extension'
import '@codingame/monaco-vscode-json-language-features-default-extension'
import '@codingame/monaco-vscode-typescript-language-features-default-extension'
import '@codingame/monaco-vscode-html-language-features-default-extension'
import '@codingame/monaco-vscode-css-language-features-default-extension'
import './index.css'

// import '@codingame/monaco-vscode-markdown-language-features-default-extension'
import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import { initialize as initializeVscodeExtensions } from 'vscode/extensions'
import {
    getService,
    ILogService,
    initialize as initializeMonacoService,
    IStorageService,
    LogLevel,
    StandaloneServices
} from 'vscode/services'

import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override'
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override'
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import getLanguageDetectionWorkerServiceOverride from '@codingame/monaco-vscode-language-detection-worker-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override'
import getMarkersServiceOverride from '@codingame/monaco-vscode-markers-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getNotificationServiceOverride from '@codingame/monaco-vscode-notifications-service-override'
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override'
import getStorageServiceOverride, {
    BrowserStorageService
} from '@codingame/monaco-vscode-storage-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getViewsServiceOverride, {
    attachPart,
    isEditorPartVisible,
    isPartVisibile,
    onPartVisibilityChange,
    Parts
} from '@codingame/monaco-vscode-views-service-override'
import getWorkspaceTrustOverride from '@codingame/monaco-vscode-workspace-trust-service-override'

import { openNewCodeEditor } from './editor'

// Workers
export type WorkerLoader = () => Worker
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
    editorWorkerService: () => {
        console.log(`Loading editor worker`)
        return new Worker(
            new URL(
                'monaco-editor/esm/vs/editor/editor.worker.js',
                import.meta.url
            ),
            {
                type: 'module'
            }
        )
    },
    textMateWorker: () =>
        new Worker(
            new URL(
                '@codingame/monaco-vscode-textmate-service-override/worker',
                import.meta.url
            ),
            {
                type: 'module'
            }
        ),
    languageDetectionWorkerService: () =>
        new Worker(
            new URL(
                '@codingame/monaco-vscode-language-detection-worker-service-override/worker',
                import.meta.url
            ),
            {
                type: 'module'
            }
        )
}

function getWorkerConfig() {
    const fullUrl = new URL(
        'vscode/workers/extensionHost.worker',
        import.meta.url
    ).href
    const urlWithHost = new URL(fullUrl, window.location.href).href
    console.log({ fullUrl, urlWithHost })
    return undefined

    return {
        url: urlWithHost,
        options: {
            name: 'extensionHostWorker',
            type: 'module' as WorkerType
        }
    }
}

window.MonacoEnvironment = {
    getWorker: function (moduleId, label) {
        const workerFactory = workerLoaders[label]
        if (workerFactory != null) {
            return workerFactory()
        }
        throw new Error(`Unimplemented worker ${label} (${moduleId})`)
    }
}

// Override services
export const setupPromise = initializeMonacoService({
    ...getExtensionServiceOverride(getWorkerConfig()),
    ...getModelServiceOverride(),
    ...getNotificationServiceOverride(),
    ...getDialogsServiceOverride(),
    ...getConfigurationServiceOverride(monaco.Uri.file('/code')),
    ...getKeybindingsServiceOverride(),
    ...getTextmateServiceOverride(),
    ...getThemeServiceOverride(),
    ...getLanguagesServiceOverride(),
    ...getPreferencesServiceOverride(),
    ...getViewsServiceOverride(openNewCodeEditor),
    ...getSnippetServiceOverride(),
    ...getQuickAccessServiceOverride({
        isKeybindingConfigurationVisible: isEditorPartVisible,
        shouldUseGlobalPicker: (_editor, isStandalone) =>
            !isStandalone && isEditorPartVisible()
    }),
    ...getMarkersServiceOverride(),
    ...getLanguageDetectionWorkerServiceOverride(),
    ...getStorageServiceOverride(),
    ...getLifecycleServiceOverride(),
    ...getEnvironmentServiceOverride({
        enableWorkspaceTrust: true
    }),
    ...getWorkspaceTrustOverride()
}).then(() => initializeVscodeExtensions())
StandaloneServices.get(ILogService).setLevel(LogLevel.Off)

export async function clearStorage(): Promise<void> {
    await ((await getService(IStorageService)) as BrowserStorageService).clear()
}

// const setupPromise = Promise.resolve()

function Editor() {
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
        <div className="flex">
            <div ref={editorRef} className="part"></div>
            <div ref={explorerRef} className="part"></div>
        </div>
    )
}

export default Editor
