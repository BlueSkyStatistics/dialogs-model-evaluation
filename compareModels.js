/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class compareModels extends baseModal {
    static dialogId = 'compareModels'
    static t = baseModal.makeT(compareModels.dialogId)

    constructor() {
        var config = {
            id: compareModels.dialogId,
            label: compareModels.t('title'),
            splitProcessing:false,
            modalType: "one",
            RCode: `
require(lmtest)
local ({
title=" "
reducedmodel=" "
reducedmodel="{{selected.modelselector2 | safe}}"
modclass = class({{selected.modelselector1 | safe}})
if(reducedmodel==" ")
{
title = "Results of running ANOVA"
} else
{
title = "Results of running ANOVA (full against reduced model)"
}
if ("glm" %in% modclass )
{
if(reducedmodel==" ")
{
title = "Results of running ANOVA with Chisq Test"
} else
{
title = "Results of running ANOVA (full against reduced model) with Chisq Test"
}
anovaResults  <-anova({{selected.modelselector2 | safe}}, {{selected.modelselector1 | safe}}, test ="Chisq")
} else
{
anovaResults <-anova({{selected.modelselector2 | safe}}, {{selected.modelselector1 | safe}})
}
if(reducedmodel != " ")
{
cat(attr(anovaResults ,"heading")[2])
cat("\n")
}
BSkyFormat(as.data.frame(anovaResults), singleTableOutputHeader = title)
if ( !("loess" %in% modclass || "gls" %in% modclass) )
{
lrtestResults <- lmtest::lrtest( {{selected.modelselector2 | safe}}, {{selected.modelselector1 | safe}})
if(reducedmodel != " ")
{
cat(attr(lrtestResults,"heading")[2])
cat("\n")
}
BSkyFormat(as.data.frame(lrtestResults), singleTableOutputHeader = "Likelihood Ratio Test")
}
}
)         
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
                modelselector2: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: compareModels.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: compareModels.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: compareModels.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: compareModels.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: compareModels.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            modelselector2: {
                el: new comboBox(config, {
                    no: 'modelselector2',
                    label: compareModels.t('modelselector2'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content, objects.modelselector2.el.content],
            nav: {
                name: compareModels.t('navigation'),
                icon: "icon-compare",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: compareModels.t('help.title'),
            r_help: compareModels.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: compareModels.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new compareModels().render()
}
