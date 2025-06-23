/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Stepwise",
        navigation: "Stepwise",
        label1: "Select a model of one of the following classes. (R class is listed in parenthesis below)",
        label2: "Linear model (lm), Generalized linear model (glm), Ordered Logistic/Probit regression (polr), Feed-Forward Neural Networks and Multinomial Log-Linear Models (nnet)",
        label3: "**NOTE: Stepwise does not work for models built by Model > Tuning (train)",
        label4: "**NOTE: Stepwise does not work for  Multinomial Log-Linear Models (multinom) due to an incompatibility that we have raised with the R package authors",
        modelselector1: "Select a model",
        label5: "Direction",
        backforward: "backward/forward",
        forwardback: "forward/backward",
        backward: "backward",
        forward: "forward",
        aic: "AIC (degress of freedom used for penalty k = 2)",
        bic: "BIC (degrees of freedom used for penalty k = log(no of rows in model matrix)) NOTE: Output displays AIC even even when BIC is selected)",
        label6: "Criterion",
        help: {
            title: "Stepwise",
            r_help: "help(stepwise, package='RcmdrMisc')",
            body: `
            <b>Description</b></br>
This function is a front end to the ‘stepwise’ function in the RcmdrMisc package. Which in turn is a front end to the stepAIC function in the MASS package.
<br/>
<b>Usage</b>
<br/>
<code> 
BSkyStepAIC(mod, direction = c("backward/forward", "forward/backward", "backward", "forward"), criterion = c("BIC", "AIC"), ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
mod : a model object of a class that can be handled by stepAIC.
</li>
<li>
direction : if "backward/forward" (the default), selection starts with the full model and eliminates predictors one at a time, at each step considering whether the criterion will be improved by adding back in a variable removed at a previous step; if "forward/backwards", selection starts with a model including only a constant, and adds predictors one at a time, at each step considering whether the criterion will be improved by removing a previously added variable; "backwards" and "forward" are similar without the reconsideration at each step.
</li>
<li>
criterion : for selection. Either "BIC" (the default) or "AIC". Note that stepAIC labels the criterion in the output as "AIC" regardless of which criterion is employed.
</li>
<li>
... : arguments to be passed to stepAIC.
</li>
</ul>
<b>Value</b><br/>
The model selected by stepAIC.<br/>
<b>Package</b></br>
BlueSky;MASS;RcmdrMisc</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(stepwise, package="RcmdrMisc")
`}
    }
}








class stepwise extends baseModal {
    constructor() {
        var config = {
            id: "stepwise",
            splitProcessing:false,
            label: localization.en.title,
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
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
            label4: { el: new labelVar(config, { label: localization.en.label4, h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: localization.en.modelselector1,
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            label5: { el: new labelVar(config, { label: localization.en.label5, h: 6 }) },
            backforward: {
                el: new radioButton(config, { label: localization.en.backforward, no: "dirgrp", increment: "backforward", value: "backward/forward", state: "checked", extraction: "ValueAsIs" })
            },
            forwardback: {
                el: new radioButton(config, { label: localization.en.forwardback, no: "dirgrp", increment: "forwardback", value: "forward/backward", state: "", extraction: "ValueAsIs" })
            },
            backward: {
                el: new radioButton(config, { label: localization.en.backward, no: "dirgrp", increment: "backward", value: "backward", state: "", extraction: "ValueAsIs" })
            },
            forward: {
                el: new radioButton(config, { label: localization.en.forward, no: "dirgrp", increment: "forward", value: "forward", state: "", extraction: "ValueAsIs" })
            },
            label6: { el: new labelVar(config, { label: localization.en.label6, h: 6 }) },
            aic: {
                el: new radioButton(config, { label: localization.en.aic, no: "rgrp", increment: "aic", value: "AIC", state: "checked", extraction: "ValueAsIs" })
            },
            bic: {
                el: new radioButton(config, { label: localization.en.bic, no: "rgrp", increment: "bic", value: "BIC", state: "", extraction: "ValueAsIs" })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content, objects.label5.el.content, objects.backforward.el.content, objects.forwardback.el.content, objects.backward.el.content, objects.forward.el.content, objects.label6.el.content, objects.aic.el.content, objects.bic.el.content,],
            nav: {
                name: localization.en.navigation,
                icon: "icon-regression_stepaic",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new stepwise().render()