/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class varianceInflationFactors extends baseModal {
    static dialogId = 'varianceInflationFactors'
    static t = baseModal.makeT(varianceInflationFactors.dialogId)

    constructor() {
        var config = {
            id: varianceInflationFactors.dialogId,
            label: varianceInflationFactors.t('title'),
            splitProcessing:false,
            modalType: "one",
            RCode: `
require(car)
local(
{
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
obj <- car::vif({{selected.modelselector1 | safe}}$finalModel)
BSkyFormat(obj, singleTableOutputHeader="Variance-inflation factors")
}
else
{
obj <- car::vif({{selected.modelselector1 | safe}})
BSkyFormat(obj, singleTableOutputHeader="Variance-inflation factors")
}
}
)           
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"polr\",\"multinom\", \"coxph\"))",
            })
        }
        var objects = {
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: varianceInflationFactors.t('modelselector1'),
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
                name: varianceInflationFactors.t('navigation'),
                icon: "icon-variance_inflation",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: varianceInflationFactors.t('help.title'),
            r_help: varianceInflationFactors.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: varianceInflationFactors.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new varianceInflationFactors().render()
}
