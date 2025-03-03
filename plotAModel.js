/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class plotAModel extends baseModal {
    static dialogId = 'plotAModel'
    static t = baseModal.makeT(plotAModel.dialogId)

    constructor() {
        var config = {
            id: plotAModel.dialogId,
            label: plotAModel.t('title'),
            splitProcessing:false,
            modalType: "one",
            RCode: `
            if ( "train" %in% class({{selected.modelselector1 | safe}}) )
            {
            plot({{selected.modelselector1 | safe}}$finalModel)
            } else
            {
            plot({{selected.modelselector1 | safe}})
            }
           `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: plotAModel.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.modelselector1.el.content],
            nav: {
                name: plotAModel.t('navigation'),
                icon: "icon-gaussian-function",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: plotAModel.t('help.title'),
            r_help: plotAModel.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: plotAModel.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new plotAModel().render()
}
