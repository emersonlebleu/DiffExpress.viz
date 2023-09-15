<template>
    <v-card id="header-select-card">
        <h4>Header Selection Dialog</h4>

        <div class="select-checkbox-container">
            <div class="half-width-select-container">
                <v-select
                clearable
                chips
                id="p-value"
                density="compact"
                v-model="fileFormat.pValue"
                :items="internalHeaders"
                label="p-value column"
                @update:modelValue="p_valColumnSelected"
                @click:clear="p_valCleared"></v-select>
            </div>

            <div id="log-10">
                <v-checkbox
                id="log-10-cb"
                color="blue"
                v-model="fileFormat.pValueLog10"
                label="p-value is log10"
                hide-details
                ></v-checkbox>
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
                label="fold change column"
                @update:modelValue="fcColumnSelected"
                @click:clear="fcCleared"></v-select>
            </div>

            <div id="log-2">
                <v-checkbox
                id="log-2-cb"
                color="blue"
                v-model="fileFormat.foldChangeLog2"
                label="fold change is log2"
                hide-details
                ></v-checkbox>
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
                label="label / name column"
                @update:modelValue="labelColumnSelected"
                @click:clear="labelCleared"></v-select>
        </div>

        <div class="full-width-container">
            <v-select
                clearable
                chips
                id="groups"
                density="compact"
                v-model="fileFormat.groups"
                :items="internalHeaders"
                multiple
                label="Select group column headers">
            </v-select>
        </div>

        <v-btn @click="emitClicked" :disabled="!fileFormat.pValue || !fileFormat.foldChange || !fileFormat.labelColumn || fileFormat.groups.length == 0 ? true : false">DONE</v-btn>
    </v-card>
</template>

<script>
export default {
    name: 'HeaderSelectDialog',
    props: {
        headers: Array,
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
            },
            internalHeaders: this.headers.sort(),
            selectedPValue: null,
            selectedFC: null,
            selectedLabel: null,
        }
    },
    methods: {
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
        flex-direction: column;
        justify-content: center;
        align-content: center;
    }
    .select-checkbox-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: start;
    }
    .half-width-select-container {
        width: 50%;
    }

    #log-2 {
        display: inline;
        width: 45%;
    }
    #log-10 {
        display: inline; 
        width: 45%;
    }
</style>