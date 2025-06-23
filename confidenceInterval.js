/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Confidence Interval",
        navigation: "Confidence Interval",
        label1: "Select a model of one of the following classes. (R class is listed in parenthesis below)",
        label2: "Linear model (lm), Generalized linear model (glm), Nonlinear Least Squares (nls), Ordered Logistic/Probit regression (polr), Multinomial Log-Linear models (multinom), Cox regession models (coxph)",
        label3: "Based on",
        modelselector1: "Select a model",
        conlevel: "Confidence interval",
        lr: "Likelihood-ratio statistic",
        wald: "Wald statistic",
        help: {
            title: "Confidence Interval",
            r_help: "help(confint,package='stats')",
            body: `
                <b>Description</b></br>
Computes confidence intervals for one or more parameters in a fitted model. There is a default and a method for objects inheriting from class "lm". lm and coxph models only use the Wald method.
<br/>
<b>Usage</b>
<br/>
<code> 
confint(object, parm, level = 0.95, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: a fitted model object.
</li>
<li>
parm: a specification of which parameters are to be given confidence intervals, either a vector of numbers or a vector of names. If missing, all parameters are considered.
</li>
<li>
level: the confidence level required.
</li>
<li>
...: arguments to be passed down to methods.
</li>
</ul>
<b>Details</b></br>
confint is a generic function. The default method assumes normality, and needs suitable coef and vcov methods to be available. The default method can be called directly for comparison with other methods.</br>
For objects of class "lm" the direct formulae based on t values are used.</br>
There are stub methods in package stats for classes "glm" and "nls" which call those in package MASS (if installed): if the MASS namespace has been loaded, its methods will be used directly. (Those methods are based on profile likelihood.)</br>
<b>Value</b></br>
A matrix (or vector) with columns giving lower and upper confidence limits for each parameter. These will be labelled as (1-level)/2 and 1 - (1-level)/2 in % (by default 2.5% and 97.5%).</br>
<b>Examples</b><br/>
<code> 
fit <- lm(100/mpg ~ disp + hp + wt + am, data = mtcars)<br/>
confint(fit)<br/>
confint(fit, "wt")<br/>
## from example(glm)
counts <- c(18,17,15,20,10,20,25,13,12)
outcome <- gl(3, 1, 9); treatment <- gl(3, 3)
glm.D93 <- glm(counts ~ outcome + treatment, family = poisson())
confint(glm.D93) # needs MASS to be installed
confint.default(glm.D93)  # based on asymptotic normality
</code> <br/>
<b>Package</b></br>
stats;MASS;knitr</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(confint , package='stats')
                `}
    }
}








class confidenceInterval extends baseModal {
    constructor() {
        var config = {
            id: "confidenceInterval",
            label: localization.en.title,
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
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
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
            conlevel: {
                el: new advancedSlider(config, {
                    no: "conlevel",
                    label: localization.en.conlevel,
                    min: 0,
                    style: "ml-2",
                    max: 1,
                    step: 0.05,
                    value: 0.95,
                    extraction: "NoPrefix|UseComma"
                })
            },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
            lr: {
               // el: new radioButton(config, { label: localization.en.lr, no: "grp1", increment: "lr", value: "LR", state: "checked", extraction: "ValueAsIs" })
               el: new radioButton(config, { label: localization.en.lr, no: "grp1", increment: "lr", value: "stats::confint", state: "checked", extraction: "ValueAsIs" })
            },
            wald: {
                el: new radioButton(config, { label: localization.en.wald, no: "grp1", increment: "wald", value: "stats::confint.default", state: "", extraction: "ValueAsIs" })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content, objects.conlevel.el.content, objects.lr.el.content, objects.wald.el.content,],
            nav: {
                name: localization.en.navigation,
                icon: "icon-confidence_interval",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new confidenceInterval().render()