const nav = {
    "id": "menu-modelevaluation",
    "buttons": [
        "./addStatisticsToObservations",
        "./anovaLikelihoodRatio",
        {
            "id": "menu-modelevaluation-compare",
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
            "id": "menu-modelevaluation-fit",
            "icon": "icon-ruler",
            "children": [
                "./AIC",
                "./BIC",
                "./hosmerLemeshow",
                "./pseudoRSquared"
            ]
        },
        {
            "id": "menu-modelevaluation-irt",
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
            "id": "menu-modelevaluation-predict",
            "icon": "icon-y-hat",
            "children": [
                "./Scoring/Scoring",
                "./Scoring/scoringSurvivalCL",
            ]
        },
        {
            "id": "menu-modelevaluation-response-optimizer",
            "icon": "icon-y-hat",
            "children": [

            ]
        },
        "./stepwise",
        {
            "id": "menu-modelevaluation-summarize",
            "icon": "icon-sigma",
            "children": [
                "./modelLevelStatistics",
                "./parameterLevelStats",
                "./summarizeAModel",
                "./summarizeNModels"
            ]
        },
        "./varianceInflationFactors",
		"./deleteNModels",
		"./convertNModelsRSMtoLM"
    ]
}

module.exports.nav = nav
