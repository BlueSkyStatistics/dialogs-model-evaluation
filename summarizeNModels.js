/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class summarizeNModels extends baseModal {
    static dialogId = 'summarizeNModels'
    static t = baseModal.makeT(summarizeNModels.dialogId)

    constructor() {
        var config = {
            id: summarizeNModels.dialogId,
            label: summarizeNModels.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
library(texreg)
hout = texreg::htmlreg(list({{selected.modelselector1 | safe}}), digits = BSkyGetDecimalDigitSetting(), \n\tcenter = FALSE, caption = "Statistical Model Comparison", caption.above = TRUE)
BSkyFormat(hout)    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: summarizeNModels.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: summarizeNModels.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: summarizeNModels.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: summarizeNModels.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: summarizeNModels.t('modelselector1'),
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content],
            nav: {
                name: summarizeNModels.t('navigation'),
                icon: "icon-sigma-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: summarizeNModels.t('help.title'),
            r_help: summarizeNModels.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: summarizeNModels.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new summarizeNModels().render()
}
