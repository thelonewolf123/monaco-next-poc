import 'monaco-editor/esm/vs/editor/editor.all.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'

import { initialize as initializeExtensions } from 'vscode/extensions'
import { createConfiguredEditor } from 'vscode/monaco'
import { initialize } from 'vscode/services'

import getModelOverride from '@codingame/monaco-vscode-model-service-override'

export async function init(el: HTMLElement) {
    initializeExtensions()
    initialize({ ...getModelOverride() })

    const editorInstance = createConfiguredEditor(el, {
        theme: 'vs-dark',
        automaticLayout: true
    })

    return editorInstance
}
