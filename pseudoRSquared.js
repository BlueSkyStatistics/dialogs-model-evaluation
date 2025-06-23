/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Pseudo R Squared",
        navigation: "Pseudo R Squared",
        modelselector1: "Select a model",
        label1: "Select a model of one of the following classes (class in parenthesis)",
        label2: "Generalized linear models (glm), Multinomial Log-Linear Models (multinom), Ordered Logistic Or Probit Regression (polr) ",
        label3: "NOTE: MODELS BUILT USING MODEL TUNING (TRAIN) ARE NOT SUPPORTED",
        help: {
            title: "Pseudo R Squared",
            r_help: "help(pR2, package='pscl')",
            body: `
                <b>Description</b></br>
compute various pseudo-R2 measures for various GLMs
<br/>
<b>Usage</b>
<br/>
<code> 
pR2(object, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: a fitted model object, for now of class glm, polr, or mulitnom
</li>
<li>
... additional arguments to be passed to or from functions
</li>
</ul>
<b>Details</b></br>
Numerous pseudo r-squared measures have been proposed for generalized linear models, involving a comparison of the log-likelihood for the fitted model against the log-likelihood of a null/restricted model with no predictors, normalized to run from zero to one as the fitted model provides a better fit to the data (providing a rough analogue to the computation of r-squared in a linear regression).</br>
<b>Value</b><br/>
A vector of length 6 containing<br/>
llh: The log-likelihood from the fitted model<br/>
llhNull: The log-likelihood from the intercept-only restricted model<br/>
G2: Minus two times the difference in the log-likelihoods<br/>
McFadden: McFadden's pseudo r-squared<br/>
r2ML: Maximum likelihood pseudo r-squared<br/>
r2CU: Cragg and Uhler's pseudo r-squared<br/>
<b>Examples</b><br/>
<code> 
data(admit)<br/>
## ordered probit model<br/>
op1 <- MASS::polr(score ~ gre.quant + gre.verbal + ap + pt + female,
            Hess=TRUE,
            data=admit,
            method="probit")<br/>
pR2(op1)<br/>
</code> <br/>
<b>Package</b></br>
pscl</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(pR2, package="pscl")
                `}
    }
}








class pseudoRSquared extends baseModal {
    constructor() {
        var config = {
            id: "pseudoRSquared",
            splitProcessing:false,
            label: localization.en.title,
            modalType: "one",
            RCode: `
BSkyFormat(pscl::pR2({{selected.modelselector1 | safe}}), singleTableOutputHeader ="pseudo-R2 measures")           
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"glm\",\"polr\",\"multinom\"), returnClassTrain = FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
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
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content,objects.label3.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-r_squared",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new pseudoRSquared().render()
