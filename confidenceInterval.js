/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */











class confidenceInterval extends baseModal {
    static dialogId = 'confidenceInterval'
    static t = baseModal.makeT(confidenceInterval.dialogId)

    constructor() {
        var config = {
            id: confidenceInterval.dialogId,
            label: confidenceInterval.t('title'),
            splitProcessing:false,
            modalType: "one",
            RCode: `
require(MASS)
require(RcmdrMisc)
require(knitr)
local(
{
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
tmpbsky <- {{selected.grp1 | safe}}({{selected.modelselector1 | safe}}$finalModel, level={{selected.conlevel | safe}})
if ("lm" %in% class({{selected.modelselector1 | safe}}$finalModel) || "glm" %in% class({{selected.modelselector1 | safe}}$finalModel)  ||  "polr" %in% class({{selected.modelselector1 | safe}}$finalModel) || "nls" %in% class({{selected.modelselector1 | safe}}$finalModel) ||"coxph" %in% class({{selected.modelselector1 | safe}}$finalModel) ) 
{
BSkyFormat(tmpbsky, singleTableOutputHeader =paste ("Confidence Interval (level = ",{{selected.conlevel | safe}}, ")", sep="", collapse="")  )
} else
{
print(knitr::kable(tmpbsky))
}
} else
{
tmpbsky <- {{selected.grp1 | safe}}({{selected.modelselector1 | safe}}, level={{selected.conlevel | safe}})
if ("lm" %in% class({{selected.modelselector1 | safe}}) || "glm" %in% class({{selected.modelselector1 | safe}}) ||  "polr" %in% class({{selected.modelselector1 | safe}})  || "nls" %in% class({{selected.modelselector1 | safe}}) ||"coxph" %in% class({{selected.modelselector1 | safe}} ) )
{ 
BSkyFormat(tmpbsky, singleTableOutputHeader =paste ("Confidence Interval (level = ",{{selected.conlevel | safe}}, ")", sep="", collapse="")  )
} else
{
print(knitr::kable(tmpbsky))
}
}
}
)
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"multinom\",\"nls\",\"polr\", \"coxph\" ))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: confidenceInterval.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: confidenceInterval.t('label2'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: confidenceInterval.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            conlevel: {
                el: new advancedSlider(config, {
                    no: "conlevel",
                    label: confidenceInterval.t('conlevel'),
                    min: 0,
                    style: "ml-2",
                    max: 1,
                    step: 0.05,
                    value: 0.95,
                    extraction: "NoPrefix|UseComma"
                })
            },
            label3: { el: new labelVar(config, { label: confidenceInterval.t('label3'), h: 6 }) },
            lr: {
               // el: new radioButton(config, { label: confidenceInterval.t('lr'), no: "grp1", increment: "lr", value: "LR", state: "checked", extraction: "ValueAsIs" })
               el: new radioButton(config, { label: confidenceInterval.t('lr'), no: "grp1", increment: "lr", value: "stats::confint", state: "checked", extraction: "ValueAsIs" })
            },
            wald: {
                el: new radioButton(config, { label: confidenceInterval.t('wald'), no: "grp1", increment: "wald", value: "stats::confint.default", state: "", extraction: "ValueAsIs" })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content, objects.conlevel.el.content, objects.lr.el.content, objects.wald.el.content,],
            nav: {
                name: confidenceInterval.t('navigation'),
                icon: "icon-confidence_interval",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: confidenceInterval.t('help.title'),
            r_help: confidenceInterval.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: confidenceInterval.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new confidenceInterval().render()
}
