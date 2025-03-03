/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class personFit extends baseModal {
    static dialogId = 'personFit'
    static t = baseModal.makeT(personFit.dialogId)

    constructor() {
        var config = {
            id: personFit.dialogId,
            label: personFit.t('title'),
            modalType: "one",
            RCode: `
require(eRm);

local({
    #Estimation of person parameters
    personParametersResults <- person.parameter({{selected.modelselector1 | safe}})
    
    #personfit statistics
    print(personfit(personParametersResults))
    
    if ({{selected.chkbox | safe}})
    {
    #Martin-Löf's Likelihood-Ratio-Test based on item sub-group splitting
    mlrtResults <- MLoef(personParametersResults, splitcr = "{{selected.splitcriteria | safe}}")
    summary(mlrtResults)
    }
    })
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"eRm\",\"dRm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: personFit.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: personFit.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: personFit.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            chkbox: {
                el: new checkbox(config, {
                    label: personFit.t('chkbox'),
                    no: "chkbox",
                    style: "mt-3",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    state: "checked",
                    newline: true,
                })
            },

            lbl2: { el: new labelVar(config, { label: personFit.t('lbl2'), h: 6, style: "mt-3" }) },
            rd1: {
                el: new radioButton(config, {
                    label: personFit.t('rd1'),
                    no: "splitcriteria",
                    increment: "rd1",
                    value: "median",
                    extraction: "ValueAsIs",
                    state: "checked"
                })
            }, 
            rd2: {
                el: new radioButton(config, {
                    label: personFit.t('rd2'),
                    no: "splitcriteria",
                    increment: "rd2",
                    value: "mean",
                    extraction: "ValueAsIs"
                    
                })
            }                         

        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content,
                objects.chkbox.el.content, objects.lbl2.el.content,
                objects.rd1.el.content, objects.rd2.el.content
            ],
            nav: {
                name: personFit.t('navigation'),
                icon: "icon-person",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: personFit.t('help.title'),
            r_help: personFit.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: personFit.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new personFit().render()
}
