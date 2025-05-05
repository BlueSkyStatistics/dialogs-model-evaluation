/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class compareNModelsSEM extends baseModal {
    static dialogId = 'compareNModelsSEM'
    static t = baseModal.makeT(compareNModelsSEM.dialogId)

    constructor() {
        var config = {
            id: compareNModelsSEM.dialogId,
            label: compareNModelsSEM.t('title'),
            splitProcessing:false,
            modalType: "one",
            RCode: `
library(lavaan)
if (exists('BSkyComparisonResults')) rm(BSkyComparisonResults)
BSkyComparisonResults = lavaan::lavTestLRT({{selected.modelselector1 | safe}})
BSkyFormat(BSkyComparisonResults, singleTableOutputHeader ="Chi-Squared Difference Test") 
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lavaan\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: compareNModelsSEM.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: compareNModelsSEM.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: compareNModelsSEM.t('label3'), h: 6 }) },
            
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: compareNModelsSEM.t('modelselector1'),
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content,  objects.modelselector1.el.content],
            nav: {
                name: compareNModelsSEM.t('navigation'),
                icon: "icon-compare-n",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: compareNModelsSEM.t('help.title'),
            r_help: compareNModelsSEM.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: compareNModelsSEM.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new compareNModelsSEM().render()
}
