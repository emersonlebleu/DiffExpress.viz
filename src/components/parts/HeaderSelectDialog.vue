<template>
    <v-card id="header-select-card">
        <button 
            @pointerenter="toggleShowCloseTip"
            @pointerleave="toggleShowCloseTip"
            @click="$emit('closeNoData')"
            id="close-no-data" 
            v-if="openedFromHomeObj">CLOSE
            <div v-if="showCloseTip" id="close-tip">Close to use only demo data</div>       
        </button>



        <h4 v-if="!openedFromHomeObj">Header Selection Dialog</h4>
        <h4 v-if="openedFromHomeObj">Select Headers from Mosaic File</h4>
        <p v-if="openedFromHomeObj"><i>Mosaic file name: <b>{{ openedFromHomeObj.fileName }}</b></i></p>

        <div class="select-checkbox-container">
            <div class="half-width-select-container">
                <v-select
                clearable
                chips
                id="p-value"
                density="compact"
                v-model="fileFormat.pValue"
                :items="internalHeaders"
                label="Select p-value column"
                @update:modelValue="p_valColumnSelected"
                @click:clear="p_valCleared"></v-select>
            </div>

            <div id="log-10">
                <v-checkbox
                id="log-10-cb"
                color="blue"
                v-model="fileFormat.pValueLog10"
                hide-details
                >
                <template v-slot:label>
                    <div>p-value is -log<sub>10</sub></div>
                </template>
                </v-checkbox>
            </div>
        </div>

        <div class="select-checkbox-container">
            <div class="half-width-select-container">
                <v-select
                clearable
                chips
                id="fc"
                density="compact"
                v-model="fileFormat.foldChange"
                :items="internalHeaders"
                label="Select fold change column"
                @update:modelValue="fcColumnSelected"
                @click:clear="fcCleared"></v-select>
            </div>

            <div id="log-2">
                <v-checkbox
                id="log-2-cb"
                color="blue"
                v-model="fileFormat.foldChangeLog2"
                hide-details
                >
                <template v-slot:label>
                    <div>fold change is log<sub>2</sub></div>
                </template>
                </v-checkbox>
            </div>
        </div>

        <div class="half-width-container">
            <v-select
                clearable
                chips
                id="labelColumn"
                density="compact"
                v-model="fileFormat.labelColumn"
                :items="internalHeaders"
                label="Select label / name column"
                @update:modelValue="labelColumnSelected"
                @click:clear="labelCleared"></v-select>
        </div>

        <div class="full-width-container">
            <div class="select-container">
                <v-select
                    persistent-hint
                    clearable
                    chips
                    id="groups"
                    density="compact"
                    v-model="fileFormat.groups"
                    :items="internalHeaders"
                    multiple
                    hint="If none are selected heatmap will not be shown."
                    label="Select group columns headers">
                </v-select>
            </div>

            <div class="tip-container">
                <div id="group-tips">
                    ?
                    <v-tooltip
                        max-width="250"
                        id="group-column-instructions"
                        activator="parent"
                        location="bottom">
                        <br>
                        <ul>
                            <li>If your data has time point or group labels, select those column names here.</li>
                            <li>These labels will be used to identify the groups for the heatmap y-axis.</li>
                        </ul>
                    </v-tooltip>
                </div>  
            </div>
        </div>
        <v-btn id="done-btn" @click="emitClicked" :disabled="!fileFormat.pValue || !fileFormat.foldChange || !fileFormat.labelColumn ? true : false">DONE</v-btn>
    </v-card>
</template>

<script>
export default {
    name: 'HeaderSelectDialog',
    props: {
        headers: Array,
        fileExt: String,
        openedFromHomeObj: Object,
    },
    data() {
        return {
            fileFormat: {
                pValue: null,
                pValueLog10: false,
                foldChange: null,
                foldChangeLog2: true,
                labelColumn: null,
                groups: [],
                fileExtension: this.fileExt,
            },
            internalHeaders: this.headers.sort(),
            selectedPValue: null,
            selectedFC: null,
            selectedLabel: null,
            showCloseTip: false,
        }
    },
    methods: {
        toggleShowCloseTip() {
            this.showCloseTip = !this.showCloseTip
        },
        emitClicked() {
            this.$emit('closeBtnClicked', this.fileFormat)
        },
        p_valColumnSelected() {
            //if nothing is selected do nothing
            if (!this.fileFormat.pValue) {
                return
            }

            //If there was something selected before, add it back to the headers
            if (this.selectedPValue) {
                this.internalHeaders.push(this.selectedPValue)
                this.internalHeaders.sort()
            }
            //Change selectedPValue to the new value
            this.selectedPValue = this.fileFormat.pValue
            //Remove the new value from the headers
            this.internalHeaders.splice(this.internalHeaders.indexOf(this.fileFormat.pValue), 1)
        },
        fcColumnSelected() {
            //if nothing is selected do nothing
            if (!this.fileFormat.foldChange) {
                return
            }

            //If there was something selected before, add it back to the headers
            if (this.selectedFC) {
                this.internalHeaders.push(this.selectedFC)
                this.internalHeaders.sort()
            }
            //Change selectedFC to the new value
            this.selectedFC = this.fileFormat.foldChange
            //Remove the new value from the headers
            this.internalHeaders.splice(this.internalHeaders.indexOf(this.fileFormat.foldChange), 1)
        },
        labelColumnSelected() {
            //if nothing is selected do nothing
            if (!this.fileFormat.labelColumn) {
                return
            }

            //If there was something selected before, add it back to the headers
            if (this.selectedLabel) {
                this.internalHeaders.push(this.selectedLabel)
                this.internalHeaders.sort()
            }
            //Change selectedFC to the new value
            this.selectedLabel = this.fileFormat.labelColumn
            //Remove the new value from the headers
            this.internalHeaders.splice(this.internalHeaders.indexOf(this.fileFormat.labelColumn), 1)
        },
        p_valCleared() {
            //Add p-value back to headers
            this.internalHeaders.push(this.selectedPValue)
            this.internalHeaders.sort()
            //Back to null
            this.fileFormat.pValue = null
            this.selectedPValue = null
        },
        fcCleared() {
            //Add fc back to headers
            this.internalHeaders.push(this.selectedFC)
            this.internalHeaders.sort()
            //Back to null
            this.fileFormat.foldChange = null
            this.selectedFC = null
        },
        labelCleared() {
            //Add fc back to headers
            this.internalHeaders.push(this.selectedLabel)
            this.internalHeaders.sort()
            //Back to null
            this.fileFormat.labelColumn = null
            this.selectedLabel = null
        }
    }
}
</script>

<style scoped>
    #close-no-data{
        position: absolute;
        top: 0;
        right: 0;
        margin: 10px;
        padding: 3px 8px;
        border-radius: 4px;
        background-color: #ff0000;
        color: #f5f5f5;
        font-weight: bold;
        cursor: pointer;
    }
    #close-no-data:hover {
        background-color: #fd5e5e;
    }

    #close-tip{
        position: absolute;
        top: 32px;
        right: 0;
        text-align: center;
        padding: 5px 10px;
        border-radius: 4px;
        border: #9d9b9b 1px solid;
        background-color: rgba(44, 44, 44, 0.923);
        color: white;
        font-weight: bold;
        width: 250px;
    }

    #header-select-card {
        min-width: 40vw;
        min-height: 30vh;
        max-width: 600px;
        max-height: 600px;
        background-color: #fff;
        overflow-y: auto;
        padding: 20px 20px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;
    }

    #header-select-card .header-chip {
        border-radius: 4px;
        padding: 10px;
    }
    .full-width-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-content: center;
    }
    .select-checkbox-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: start;
    }
    .half-width-select-container {
        width: 60%;
    }

    .select-container {
        width: 95%;
    }

    .tip-container {
        width: 5%;
    }

    #group-tips {
        width: 1.5em;
        height: 1.5em;
        margin-left: 5px;
        text-align: center;
        background-color: #f5f5f5;
        border-radius: 50%;
        border: 1px solid #d2cdcd;
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
    }

    #log-2 {
        display: inline;
        width: 40%;
    }
    #log-10 {
        display: inline; 
        width: 40%;
    }
    #done-btn {
        margin-top: 20px;
    }
</style>