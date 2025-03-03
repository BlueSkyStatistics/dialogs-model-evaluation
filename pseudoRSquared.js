/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */











class pseudoRSquared extends baseModal {
    static dialogId = 'pseudoRSquared'
    static t = baseModal.makeT(pseudoRSquared.dialogId)

    constructor() {
        var config = {
            id: pseudoRSquared.dialogId,
            splitProcessing:false,
            label: pseudoRSquared.t('title'),
            modalType: "one",
            RCode: `
BSkyFormat(pscl::pR2({{selected.modelselector1 | safe}}), singleTableOutputHeader ="pseudo-R2 measures")           
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"glm\",\"polr\",\"multinom\"), returnClassTrain = FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: pseudoRSquared.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: pseudoRSquared.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: pseudoRSquared.t('label3'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: pseudoRSquared.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content,objects.label3.el.content, objects.modelselector1.el.content],
            nav: {
                name: pseudoRSquared.t('navigation'),
                icon: "icon-r_squared",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: pseudoRSquared.t('help.title'),
            r_help: pseudoRSquared.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: pseudoRSquared.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new pseudoRSquared().render()
}

