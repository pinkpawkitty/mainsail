<style scoped>

</style>

<template>
    <div>
        <v-card class="mb-3">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading align-baseline"><v-icon left>mdi-information</v-icon>{{ $t("Timelapse.Status")}}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text v-if="frameUrl" class="pb-0">
                <v-row>
                    <v-col>
                        <vue-load-image>
                            <img slot="image" :src="frameUrl" :alt="$t('Timelapse.Preview')" class="w-100" />
                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                            <v-icon slot="error">mdi-file</v-icon>
                        </vue-load-image>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text :class="framesCount ? 'pt-0' : ''">
                <v-row v-if="framesCount > 0">
                    <v-col>
                        <template v-if="framesCount > 0">
                            <settings-row :title="$t('Timelapse.Frames')">
                                {{ framesCount }}
                            </settings-row>
                            <v-divider class="my-2"></v-divider>
                            <settings-row :title="$t('Timelapse.EstimatedLength')" :dynamicSlotWidth="true">
                                {{ estimatedVideoLength }}
                            </settings-row>
                        </template>
                        <template v-if="['printing', 'paused'].includes(printer_state)">
                            <v-divider class="my-2"></v-divider>
                            <settings-row :title="$t('Timelapse.Enabled')" :dynamicSlotWidth="true">
                                <v-switch v-model="enabled" hide-details class="mt-0"></v-switch>
                            </settings-row>
                            <template v-if="enabled">
                                <v-divider class="my-2" v-if="framesCount > 0"></v-divider>
                                <settings-row :title="$t('Timelapse.Autorender')" :dynamicSlotWidth="true">
                                    <v-switch v-model="autorender" hide-details class="mt-0"></v-switch>
                                </settings-row>
                            </template>
                        </template>
                        <template v-if="framesCount > 0 && ['complete', 'canceled'].includes(printer_state)">
                            <v-divider class="mt-2 mb-4"></v-divider>
                            <v-row>
                                <v-col class="text-center">
                                    <v-btn class="primary" :disabled="disableRenderButton" @click="boolDialogRendersettings = true">{{ $t('Timelapse.Render') }}</v-btn>
                                </v-col>
                            </v-row>
                        </template>
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-col>
                        <p class="text-center my-0 font-italic">{{ $t('Timelapse.NoActiveTimelapse') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="boolDialogRendersettings" :max-width="700" :max-height="500" >
            <panel :title="$t('Timelapse.RenderSettings')" icon="mdi-text-box-search-outline" card-class="timelapse-rendersettings-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon @click="boolDialogRendersettings = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="">
                    <v-row>
                        <v-col class="col-4">
                            <v-select
                                :label="$t('Timelapse.Type')"
                                :items="framerateTypeOptions"
                                v-model="variable_fps"
                                outlined
                                dense
                                hide-details
                            ></v-select>
                        </v-col>
                        <v-col class="col-4">
                            <template v-if="variable_fps">
                                <v-text-field
                                    :label="$t('Timelapse.MinFramerate')"
                                    v-model="variable_fps_min"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                ></v-text-field>
                                <v-text-field
                                    :label="$t('Timelapse.MaxFramerate')"
                                    v-model="variable_fps_max"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    class="mt-3"
                                ></v-text-field>
                                <v-text-field
                                    :label="$t('Timelapse.Targetlength')"
                                    v-model="targetlength"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    class="mt-3"
                                ></v-text-field>
                            </template>
                            <template v-else>
                                <v-text-field
                                    :label="$t('Timelapse.Framerate')"
                                    v-model="output_framerate"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                ></v-text-field>
                            </template>
                            <v-text-field
                                :label="$t('Timelapse.DuplicateLastframe')"
                                v-model="duplicatelastframe"
                                type="number"
                                outlined
                                dense
                                hide-details
                                class="mt-3"
                            ></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <template v-if="variable_fps">
                                <v-text-field
                                    :label="$t('Timelapse.TargetFps')"
                                    v-model="variableTargetFps"
                                    type="number"
                                    outlined
                                    dense
                                    hide-details
                                    readonly
                                    class="mb-3"
                                ></v-text-field>
                            </template>
                            <v-text-field
                                :label="$t('Timelapse.EstimatedLength')"
                                v-model="estimatedVideoLength"
                                outlined
                                dense
                                hide-details
                                readonly
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="boolDialogRendersettings = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn text color="primary" @click="startRender">{{ $t('Timelapse.StartRender') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import Vue from 'vue'
@Component({
    components: {Panel, SettingsRow}
})
export default class TimelapseStatusPanel extends Mixins(BaseMixin) {
    private boolDialogRendersettings = false

    get frameUrl() {
        const frame = this.$store.state.server.timelapse?.lastFrame?.file ?? null

        if (frame) {
            return this.apiUrl + '/server/files/timelapse_frames/' + frame
        }

        return null
    }

    get framesCount() {
        return this.$store.state.server.timelapse?.lastFrame?.count ?? 0
    }

    get enabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set enabled(newVal) {
        this.$socket.emit('machine.timelapse.post_settings', { enabled: newVal }, { action: 'server/timelapse/initSettings' })
    }

    get autorender() {
        return this.$store.state.server.timelapse?.settings?.autorender ?? false
    }

    set autorender(newVal) {
        this.$socket.emit('machine.timelapse.post_settings', { autorender: newVal }, { action: 'server/timelapse/initSettings' })
    }

    get variable_fps() {
        return this.$store.state.server.timelapse?.settings?.variable_fps ?? false
    }

    set variable_fps(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
    }

    get framerateTypeOptions() {
        return [
            {
                value: false,
                text: this.$t('Timelapse.Fixed')
            },
            {
                value: true,
                text: this.$t('Timelapse.Variable')
            },
        ]
    }

    get variable_fps_min() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_min ?? 5
    }

    set variable_fps_min(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
    }

    get variable_fps_max() {
        return this.$store.state.server.timelapse?.settings?.variable_fps_max ?? 60
    }

    set variable_fps_max(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
    }

    get targetlength() {
        return this.$store.state.server.timelapse?.settings?.targetlength ?? 10
    }

    set targetlength(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
    }

    get output_framerate() {
        return this.$store.state.server.timelapse?.settings?.output_framerate ?? 30
    }

    set output_framerate(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
    }

    get duplicatelastframe() {
        return this.$store.state.server.timelapse?.settings?.duplicatelastframe ?? 0
    }

    set duplicatelastframe(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
    }

    get estimatedVideoLength() {
        let seconds = 0

        if (this.variable_fps) {
            seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.variableTargetFps)
            if (seconds < this.targetlength) seconds = this.targetlength

        } else seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.output_framerate)

        return seconds > 60 ? Math.floor(seconds/60)+'m '+(seconds -  Math.floor(seconds/60) * 60)+'s' : seconds+'s'
    }

    get variableTargetFps() {
        let targetFps = Math.floor(this.framesCount / this.targetlength)
        targetFps = Math.max(targetFps, this.variable_fps_min)
        targetFps = Math.min(targetFps, this.variable_fps_max)

        return targetFps
    }

    get disableRenderButton() {
        return ((this.$store.state.server.timelapse?.rendering.status ?? '') === 'running')
    }

    startRender() {
        this.boolDialogRendersettings = false

        Vue.$socket.emit('machine.timelapse.render', {})
    }
}
</script>