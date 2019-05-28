<template>
    <div v-if="scriptLoaded" @click="openChooser">
        <slot/>
        <button v-if="!this.$slots.default">Open picker</button>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import { PickerResponse, Token, Document, API } from './google'

    declare global {
        interface Window { gapi: API }
    }

    @Component({})
    export default class GoogleDrivePicker extends Vue {
        @Prop({
            required: true,
        })
        private developerKey!: string

        @Prop({
            required: true,
        })
        private clientId!: string

        @Prop({
            required: false,
            default: () => ['https://www.googleapis.com/auth/drive.readonly'],
        })
        private scope!: string[]

        @Prop({
            required: false,
            default: 'DOCS',
        })
        private viewId!: string

        @Prop({
            required: false,
            default: false,
        })
        private authImmediate!: boolean

        @Prop({
            required: false,
            default: false,
        })
        private multiselect!: boolean

        @Prop({
            required: false,
            default: false,
        })
        private navHidden!: boolean

        @Prop({
            required: false,
            default: false,
        })
        private upload!: boolean

        @Prop({
            required: false,
            default: false,
        })
        private disabled!: boolean

        @Prop({
            required: false,
            default: () => [],
        })
        private mimeTypes!: string[]

        private scriptLoaded = false
        private token: string | null = null

        private mounted(): void {
            if (window.gapi) {
                this.scriptLoaded = true
                this.onApiLoad()
            } else {
                const googleApiScript = document.createElement('script')
                googleApiScript.onload = () => {
                    this.scriptLoaded = true
                    this.onApiLoad()
                }
                googleApiScript.setAttribute('src', 'https://apis.google.com/js/api.js')
                document.head.appendChild(googleApiScript)
            }
        }

        private onApiLoad(): void {
            window.gapi!.load('auth')
            window.gapi!.load('picker')
        }

        private async auth(): Promise<string> {
            return new Promise((resolve) => {
                const token = window.gapi!.auth!.getToken()

                if (token) {
                    resolve(token.access_token)
                } else {
                    window.gapi!.auth!.authorize({
                        client_id: this.clientId,
                        scope: this.scope,
                        immediate: this.authImmediate,
                    }, (newToken: Token) => {
                        resolve(newToken.access_token)
                    })
                }
            })
        }

        private async openChooser(): Promise<void> {
            if (!window.gapi || !window.gapi.auth || !window.gapi.picker || this.disabled) {
                return
            }

            this.token = await this.auth()
            this.createPicker()
        }

        private pickerCallback(data: PickerResponse): void {
            this.$emit('change', data)
            switch (data.action) {
                case 'loaded':
                    this.$emit('loaded')
                    break
                case 'cancel':
                    this.$emit('cancel')
                    break
                case 'picked':
                    this.onPicked(data.docs!)
                    break
                default:
                    break
            }
        }

        private onPicked(documents: Document[]): void {
            this.$emit('picked', documents.map((document: Document) => {
                document.download_url =
                    `https://www.googleapis.com/drive/v3/files/${document.id}?alt=media&access_token=${this.token}`

                return document
            }))
        }

        private createPicker(): void {
            const picker = window.gapi!.picker!.api

            const googleViewId = picker.ViewId[this.viewId]
            const view = new picker.View(googleViewId)

            if (!view) {
                throw new Error('Can\'t find view by viewId')
            }

            if (this.mimeTypes) {
                view.setMimeTypes(this.mimeTypes.join(','))
            }

            const pickerBuilder = new picker.PickerBuilder()
                .addView(view)
                .setOAuthToken(this.token!)
                .setDeveloperKey(this.developerKey)
                .setCallback(this.pickerCallback)


            if (this.navHidden) {
                pickerBuilder.enableFeature(picker.Feature.NAV_HIDDEN)
            }
            if (this.multiselect) {
                pickerBuilder.enableFeature(picker.Feature.MULTISELECT_ENABLED)
            }
            if (this.upload) {
                pickerBuilder.addView(new picker.DocsUploadView())
            }

            pickerBuilder.build().setVisible(true)
        }
    }
</script>

<style></style>
