let t = getT('menutoolbar')
const nav = () => ({
    "name": t('modelevaluation_top_level_title'),// {ns: 'menutoolbar'}),
    "tab": "model_statistics",
    "buttons": [
        "./addStatisticsToObservations",
        "./anovaLikelihoodRatio",
        {
            "name": t('modelevaluation_Compare'),// {ns: 'menutoolbar'}),
            "icon": "icon-compare",
            "children": [
                "./compareModels",
                "./compareNModels",
                "./compareQuantReg",
                "./compareNModelsSEM"
            ]
        },
        "./confidenceInterval",
        {
            "name": t('modelevaluation_Fit'),// {ns: 'menutoolbar'}),
            "icon": "icon-ruler",
            "children": [
                "./AIC",
                "./BIC",
                "./hosmerLemeshow",
                "./pseudoRSquared"
            ]
        },
        {
            "name": t('modelevaluation_IRT'),// {ns: 'menutoolbar'}),
            "icon": "icon-lamp",
            "children": [
                "./IRT/iCCPlots",
                "./IRT/itemAndTestInfo",
                "./IRT/itemFit",
                "./IRT/likelihoodRatiosPlotBetas",
                "./IRT/personFit",
                "./IRT/plotPImap"
            ]
        },

        "./bonFerroniOutlierTest",
        "./plotAModel",
        {
            "name": t('modelevaluation_Predict'),// {ns: 'menutoolbar'}),
            "icon": "icon-y-hat",
            "children": [
                "./Scoring/Scoring",
                "./Scoring/scoringSurvivalCL",
            ]
        },
        "./stepwise",
        {
            "name": t('modelevaluation_Summarize'),// {ns: 'menutoolbar'}),
            "icon": "icon-sigma",
            "children": [
                "./modelLevelStatistics",
                "./parameterLevelStats",
                "./summarizeAModel",
                "./summarizeNModels"
            ]
        },
        "./varianceInflationFactors",
		"./deleteNModels"
    ]
})

module.exports = {
    nav: nav(),
    render: () => nav()
}
