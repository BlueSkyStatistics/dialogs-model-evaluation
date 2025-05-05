/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class bonFerroniOutlierTest extends baseModal {
    static dialogId = 'bonFerroniOutlierTest'
    static t = baseModal.makeT(bonFerroniOutlierTest.dialogId)

    constructor() {
        var config = {
            id: bonFerroniOutlierTest.dialogId,
            label: bonFerroniOutlierTest.t('title'),
            modalType: "one",
            RCode: `
local(
{
 if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
print( car::outlierTest({{selected.modelselector1 | safe}}$finalModel))
} else
{
print( car::outlierTest({{selected.modelselector1 | safe}}))
}
}
)
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: bonFerroniOutlierTest.t('label1'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: bonFerroniOutlierTest.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.modelselector1.el.content],
            nav: {
                name: bonFerroniOutlierTest.t('navigation'),
                icon: "icon-outlier",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: bonFerroniOutlierTest.t('help.title'),
            r_help: bonFerroniOutlierTest.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: bonFerroniOutlierTest.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new bonFerroniOutlierTest().render()
}
