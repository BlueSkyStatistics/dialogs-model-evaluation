/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

const nav = {
    "name": "Model Evaluation",
    "tab": "model_statistics",
    "buttons": [
        "./addStatisticsToObservations",
        "./anovaLikelihoodRatio",
        {
            "name": "Compare",
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
            "name": "Fit",
            "icon": "icon-ruler",
            "children": [
                "./AIC",
                "./BIC",
                "./hosmerLemeshow",
                "./pseudoRSquared"
            ]
        },
        {
            "name": "IRT",
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
            "name": "Predict",
            "icon": "icon-y-hat",
            "children": [
                "./Scoring/Scoring",
                "./Scoring/scoringSurvivalCL",
            ]
        },
        "./stepwise",
        {
            "name": "Summarize",
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
}

module.exports.nav = nav
