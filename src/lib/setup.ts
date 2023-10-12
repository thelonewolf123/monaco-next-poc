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
import getOutputServiceOverride from '@codingame/monaco-vscode-output-service-override'
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override'
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override'
import getStorageServiceOverride, {
    BrowserStorageService
} from '@codingame/monaco-vscode-storage-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override'
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override'
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override'
import getViewsServiceOverride, {
    isEditorPartVisible
} from '@codingame/monaco-vscode-views-service-override'
import getWorkspaceTrustOverride from '@codingame/monaco-vscode-workspace-trust-service-override'

import { openNewCodeEditor } from './editor'

// Workers
export type WorkerLoader = () => Worker
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
    editorWorkerService: () =>
        new Worker(
            new URL(
                'monaco-editor/esm/vs/editor/editor.worker.js',
                import.meta.url
            ),
            {
                type: 'module'
            }
        ),
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

const params = new URL(document.location.href).searchParams
const remoteAuthority = params.get('remoteAuthority') ?? undefined

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
    ...getAudioCueServiceOverride(),
    ...getDebugServiceOverride(),
    ...getPreferencesServiceOverride(),
    ...getViewsServiceOverride(openNewCodeEditor),
    ...getBannerServiceOverride(),
    ...getStatusBarServiceOverride(),
    ...getTitleBarServiceOverride(),
    ...getSnippetServiceOverride(),
    ...getQuickAccessServiceOverride({
        isKeybindingConfigurationVisible: isEditorPartVisible,
        shouldUseGlobalPicker: (_editor, isStandalone) =>
            !isStandalone && isEditorPartVisible()
    }),
    ...getOutputServiceOverride(),
    ...getSearchServiceOverride(),
    ...getMarkersServiceOverride(),
    ...getAccessibilityServiceOverride(),
    ...getLanguageDetectionWorkerServiceOverride(),
    ...getStorageServiceOverride(),
    ...getLifecycleServiceOverride(),
    ...getEnvironmentServiceOverride({
        remoteAuthority,
        enableWorkspaceTrust: true
    }),
    ...getWorkspaceTrustOverride()
}).then(() => initializeVscodeExtensions())
StandaloneServices.get(ILogService).setLevel(LogLevel.Off)

export async function clearStorage(): Promise<void> {
    await ((await getService(IStorageService)) as BrowserStorageService).clear()
}
