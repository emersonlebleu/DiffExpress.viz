class DiffGene {
    /**
     * @param {number} pValue
     * @param {number} log2FoldChange
     * @param {string} geneName
     * @param {Object} [groupDataObj={}]
     * @param {Object} [otherDataObj={}]
     */
    constructor(pValue, log2FoldChange, geneName, color, groupDataObj={}, otherDataObj={}, pValueOriginal=null) {
        this.pValue = pValue;
        this.log2FoldChange = log2FoldChange;
        this.geneName = geneName;
        this.groupDataObj = groupDataObj;
        this.otherDataObj = otherDataObj;
        this.color = color;
        this.pValueOriginal = pValueOriginal;
    }
    //getters
    /**
     * @returns {number} pValue
     */
    getPValue() {
        return this.pValue;
    }
    /**
     * @returns {number} pValueOriginal
     */
    getPValueOriginal() {
        return this.pValueOriginal;
    }
    /**
     * @returns {number} log2FoldChange
     */
    getLog2FoldChange() {
        return this.log2FoldChange;
    }
    /**
     * @returns {string} geneName
     */
    getGeneName() {
        return this.geneName;
    }
    /**
     * @returns {Object} groupDataObj
     */
    getGroupDataObj() {
        return this.groupDataObj;
    }
    /**
     * @returns {Object} otherDataObj
     */
    getOtherDataObj() {
        return this.otherDataObj;
    }
    /**
     * @returns {string} color
     */
    getColor() {
        return this.color;
    }

    //setters
    setPValue(pValue) {
        this.pValue = pValue;
    }
    setPValueOriginal(pValueOriginal) {
        this.pValueOriginal = pValueOriginal;
    }
    setLog2FoldChange(log2FoldChange) {
        this.log2FoldChange = log2FoldChange;
    }
    setGeneName(geneName) {
        this.geneName = geneName;
    }
    setGroupDataObj(groupDataObj) {
        this.groupDataObj = groupDataObj;
    }
    setOtherDataObj(otherDataObj) {
        this.otherDataObj = otherDataObj;
    }
    setColor(color) {
        this.color = color;
    }
}

export default DiffGene;