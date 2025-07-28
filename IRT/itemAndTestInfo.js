/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class itemAndTestInfo extends baseModal {
    static dialogId = 'itemAndTestInfo'
    static t = baseModal.makeT(itemAndTestInfo.dialogId)

    constructor() {
        var config = {
            id: itemAndTestInfo.dialogId,
            label: itemAndTestInfo.t('title'),
            modalType: "one",
            RCode: `
require(eRm);

plotINFO({{selected.modelselector1 | safe}}, theta = seq(-4, 4,length.out = 1001L))
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"eRm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: itemAndTestInfo.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: itemAndTestInfo.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: itemAndTestInfo.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content ],
            nav: {
                name: itemAndTestInfo.t('navigation'),
                icon: "icon-temperatire",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: itemAndTestInfo.t('help.title'),
            r_help: itemAndTestInfo.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: itemAndTestInfo.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new itemAndTestInfo().render()
}
