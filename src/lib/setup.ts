import '@codingame/monaco-vscode-css-default-extension'
import '@codingame/monaco-vscode-diff-default-extension'
import '@codingame/monaco-vscode-html-default-extension'
import '@codingame/monaco-vscode-javascript-default-extension'
import '@codingame/monaco-vscode-json-default-extension'
import '@codingame/monaco-vscode-markdown-basics-default-extension'
import '@codingame/monaco-vscode-typescript-basics-default-extension'
import '@codingame/monaco-vscode-xml-default-extension'
import '@codingame/monaco-vscode-yaml-default-extension'
import '@codingame/monaco-vscode-theme-defaults-default-extension'
import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-references-view-default-extension'
import '@codingame/monaco-vscode-search-result-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'
import '@codingame/monaco-vscode-npm-default-extension'
import '@codingame/monaco-vscode-media-preview-default-extension'
import '@codingame/monaco-vscode-json-language-features-default-extension'
import '@codingame/monaco-vscode-typescript-language-features-default-extension'
import '@codingame/monaco-vscode-html-language-features-default-extension'
import '@codingame/monaco-vscode-css-language-features-default-extension'
import '@codingame/monaco-vscode-markdown-language-features-default-extension'

import * as monaco from 'monaco-editor'
import { initialize as initializeVscodeExtensions } from 'vscode/extensions'
import {
    getService,
    ILogService,
    initialize as initializeMonacoService,
    IStorageService,
    LogLevel,
    StandaloneServices
} from 'vscode/services'

import getAccessibilityServiceOverride from '@codingame/monaco-vscode-accessibility-service-override'
import getAudioCueServiceOverride from '@codingame/monaco-vscode-audio-cue-service-override'
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override'
import getDebugServiceOverride from '@codingame/monaco-vscode-debug-service-override'
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
    isEditorPartVisible
} from '@codingame/monaco-vscode-views-service-override'
import getWorkspaceTrustOverride from '@codingame/monaco-vscode-workspace-trust-service-override'

import { openNewCodeEditor } from './editor'
import { toCrossOriginWorker, toWorkerConfig } from './tools/workers'

// Workers
type WorkerLoader = () => Worker

export async function registerVsCodeMonacoOverrides() {
    window.MonacoEnvironment = {
        getWorker: async function (moduleId, label) {
            switch (label) {
                case 'editorWorkerService':
                    return new Worker(
                        new URL(
                            'monaco-editor/esm/vs/editor/editor.worker',
                            import.meta.url
                        )
                    )
                case 'css':
                case 'less':
                case 'scss':
                    return new Worker(
                        new URL(
                            'monaco-editor/esm/vs/language/css/css.worker',
                            import.meta.url
                        )
                    )
                case 'handlebars':
                case 'html':
                case 'razor':
                    return new Worker(
                        new URL(
                            'monaco-editor/esm/vs/language/html/html.worker',
                            import.meta.url
                        )
                    )
                case 'json':
                    return new Worker(
                        new URL(
                            'monaco-editor/esm/vs/language/json/json.worker',
                            import.meta.url
                        )
                    )
                case 'javascript':
                case 'typescript':
                    return new Worker(
                        new URL(
                            'monaco-editor/esm/vs/language/typescript/ts.worker',
                            import.meta.url
                        )
                    )
                default:
                    throw new Error(
                        `Unimplemented worker ${label} (${moduleId})`
                    )
            }
        }
    }

    // Override services
    await initializeMonacoService({
        ...getExtensionServiceOverride(),
        ...getModelServiceOverride(),
        ...getNotificationServiceOverride(),
        ...getDialogsServiceOverride(),
        ...getConfigurationServiceOverride(monaco.Uri.file('/code')),
        ...getKeybindingsServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getThemeServiceOverride(),
        ...getLanguagesServiceOverride(),
        ...getAudioCueServiceOverride(),
        ...getDebugServiceOverride(),
        ...getPreferencesServiceOverride(),
        ...getViewsServiceOverride(openNewCodeEditor),
        ...getSnippetServiceOverride(),
        ...getQuickAccessServiceOverride({
            isKeybindingConfigurationVisible: isEditorPartVisible,
            shouldUseGlobalPicker: (_editor, isStandalone) =>
                !isStandalone && isEditorPartVisible()
        }),
        ...getMarkersServiceOverride(),
        ...getAccessibilityServiceOverride(),
        ...getLanguageDetectionWorkerServiceOverride(),
        ...getStorageServiceOverride(),
        ...getLifecycleServiceOverride(),
        ...getEnvironmentServiceOverride({
            enableWorkspaceTrust: true
        }),
        ...getWorkspaceTrustOverride()
    })
    StandaloneServices.get(ILogService).setLevel(LogLevel.Off)

    await initializeVscodeExtensions()
}

export async function clearStorage(): Promise<void> {
    await ((await getService(IStorageService)) as BrowserStorageService).clear()
}
