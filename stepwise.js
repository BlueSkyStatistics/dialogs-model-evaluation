









class stepwise extends baseModal {
    static dialogId = 'stepwise'
    static t = baseModal.makeT(stepwise.dialogId)

    constructor() {
        var config = {
            id: stepwise.dialogId,
            splitProcessing:false,
            label: stepwise.t('title'),
            modalType: "one",
            RCode: `
require(MASS)
require(RcmdrMisc)
if ("coxph" %in% class({{selected.modelselector1 | safe}}))
{
        RcmdrMisc::stepwise({{selected.modelselector1 | safe}}, direction="forward/backward", criterion="{{selected.rgrp | safe}}")
} else
{
    results <-ModelMatchesDataset('{{selected.modelselector1 | safe}}', '{{dataset.name}}', NAinVarsCheck=TRUE ) 
    if ( results$success ==TRUE)
    {
        if ( "train" %in% class({{selected.modelselector1 | safe}}) )
        {
            result <- BSkyStepAIC({{selected.modelselector1 | safe}}$finalModel,  direction='{{selected.dirgrp | safe}}', criterion='{{selected.rgrp | safe}}')
            BSkyFormat(result)
        }
        else {
            result <- BSkyStepAIC({{selected.modelselector1 | safe}},  direction='{{selected.dirgrp | safe}}', criterion='{{selected.rgrp | safe}}')
            BSkyFormat(result)
        }
    }
}
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"multinom\",\"nnet\",\"polr\"), returnClassTrain = FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: stepwise.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: stepwise.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: stepwise.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: stepwise.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: stepwise.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            label5: { el: new labelVar(config, { label: stepwise.t('label5'), h: 6 }) },
            backforward: {
                el: new radioButton(config, { label: stepwise.t('backforward'), no: "dirgrp", increment: "backforward", value: "backward/forward", state: "checked", extraction: "ValueAsIs" })
            },
            forwardback: {
                el: new radioButton(config, { label: stepwise.t('forwardback'), no: "dirgrp", increment: "forwardback", value: "forward/backward", state: "", extraction: "ValueAsIs" })
            },
            backward: {
                el: new radioButton(config, { label: stepwise.t('backward'), no: "dirgrp", increment: "backward", value: "backward", state: "", extraction: "ValueAsIs" })
            },
            forward: {
                el: new radioButton(config, { label: stepwise.t('forward'), no: "dirgrp", increment: "forward", value: "forward", state: "", extraction: "ValueAsIs" })
            },
            label6: { el: new labelVar(config, { label: stepwise.t('label6'), h: 6 }) },
            aic: {
                el: new radioButton(config, { label: stepwise.t('aic'), no: "rgrp", increment: "aic", value: "AIC", state: "checked", extraction: "ValueAsIs" })
            },
            bic: {
                el: new radioButton(config, { label: stepwise.t('bic'), no: "rgrp", increment: "bic", value: "BIC", state: "", extraction: "ValueAsIs" })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content, objects.label5.el.content, objects.backforward.el.content, objects.forwardback.el.content, objects.backward.el.content, objects.forward.el.content, objects.label6.el.content, objects.aic.el.content, objects.bic.el.content,],
            nav: {
                name: stepwise.t('navigation'),
                icon: "icon-regression_stepaic",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: stepwise.t('help.title'),
            r_help: stepwise.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: stepwise.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new stepwise().render()
}
