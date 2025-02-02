








class anovaLikelihoodRatio extends baseModal {
    static dialogId = 'anovaLikelihoodRatio'
    static t = baseModal.makeT(anovaLikelihoodRatio.dialogId)

    constructor() {
        var config = {
            id: anovaLikelihoodRatio.dialogId,
            label: anovaLikelihoodRatio.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
require(lmtest)
local ({
modclass=""
originalmodelclass=class({{selected.modelselector1 | safe}})
title = "Results of running ANOVA"
if ( "train" %in% class({{selected.modelselector1 | safe}}))
{
{{selected.modelselector1 | safe}} <-{{selected.modelselector1 | safe}}$finalModel
modclass = class({{selected.modelselector1 | safe}}$finalModel)
}
else
{
modclass = class({{selected.modelselector1 | safe}})
}
if ( "glm" %in% modclass  )
{
title = "Results of running ANOVA with Chisq Test"
anovaResults <-anova({{selected.modelselector1 | safe}},  test ="Chisq")
BSkyFormat(as.data.frame(anovaResults), singleTableOutputHeader = title)
}
else if ("lmerModLmerTest" %in% modclass  )
{
title1 = "Omnibus Tests for Fixed Effects"
title2 = "Omnibus Tests for Random Effects"
anovaResults <-anova({{selected.modelselector1 | safe}})
randomEffectResults <-ranova({{selected.modelselector1 | safe}})
BSkyFormat(as.data.frame(anovaResults),singleTableOutputHeader = title1)
BSkyFormat(as.data.frame(randomEffectResults),singleTableOutputHeader = title2)
}
else
{
anovaResults <-anova({{selected.modelselector1 | safe}})
BSkyFormat(as.data.frame(anovaResults), singleTableOutputHeader = title)
}
#Likelihood ratio test is not run for models of class train created via Model Tuning, loess and linear models with generalized least squares
if ( !("train"  %in% originalmodelclass ) && !("loess" %in% modclass || "gls" %in% modclass || "lmerModLmerTest" %in% modclass) )
{
lrtestResults <- lmtest::lrtest({{selected.modelselector1 | safe}})
BSkyFormat(as.data.frame(lrtestResults), singleTableOutputHeader = "Likelihood Ratio Test")
}
}
)
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"survreg\",\"lmerModLmerTest\"), returnClassTrain=TRUE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: anovaLikelihoodRatio.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: anovaLikelihoodRatio.t('label2'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: anovaLikelihoodRatio.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content],
            nav: {
                name: anovaLikelihoodRatio.t('navigation'),
                icon: "icon-anova_lrt",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: anovaLikelihoodRatio.t('help.title'),
            r_help: anovaLikelihoodRatio.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: anovaLikelihoodRatio.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new anovaLikelihoodRatio().render()
}
