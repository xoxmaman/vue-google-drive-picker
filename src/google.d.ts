export interface API {
    auth?: Auth
    picker?: { api: Picker }

    load(name: string): void
}

export interface Auth {
    getToken(): Token

    authorize(data: {}, callback: (token: Token) => void): void
}

export interface Token {
    access_token: string
}

export interface Picker {
    ViewId: ViewId
    View: View
    PickerBuilder: PickerBuilder
    DocsUploadView: DocsUploadView
    Feature: {
        NAV_HIDDEN: string
        MULTISELECT_ENABLED: string
    }
}

type DocsUploadView = new() => DocsUploadView

interface View {
    new(viewId?: string): View

    setMimeTypes(types: string): void
}

interface PickerBuilder {
    new(): PickerBuilder

    addView(viewOrId: any): PickerBuilder

    addViewGroup(viewGroup: any): PickerBuilder

    disableFeature(feature: string): PickerBuilder

    enableFeature(feature: string): PickerBuilder

    getRelayUrl(): string

    getTitle(): string

    hideTitleBar(): PickerBuilder

    isFeatureEnabled(feature: string): boolean

    setAppId(appId: string): PickerBuilder

    setCallback(method: Function): PickerBuilder

    setDeveloperKey(key: string): PickerBuilder

    setDocument(document: string): PickerBuilder

    setLocale(locale: string): PickerBuilder

    setMaxItems(max: number): PickerBuilder

    setOAuthToken(token: string): PickerBuilder

    setOrigin(origin: string): PickerBuilder

    setRelayUrl(url: string): PickerBuilder

    setSelectableMimeTypes(type: string): PickerBuilder

    setSize(width: number, height: number): PickerBuilder

    setTitle(title: string): PickerBuilder

    setUploadToAlbumId(albumId: string): PickerBuilder

    toUri(): string

    build(): Picker
}

interface Picker {
    isVisible(): boolean

    setCallback(callback: (response: PickerResponse) => void): Picker

    setRelayUrl(url: string): Picker

    setVisible(visible: boolean): Picker
}

interface ViewId {
    [key: string]: string
}

export interface Document {
    description: string
    duration: number
    embedUrl: string
    iconUrl: string
    id: string
    lastEditedUtc: number
    mimeType: string
    name: string
    parentId: string
    serviceId: string
    sizeBytes: number
    type: string
    url: string
    download_url?: string
}

export interface PickerResponse {
    action: string
    docs?: Document[]
}
