/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Compare Quantile Regression Model Slopes",
        navigation: "Quant Reg Models",
        label1: "Compares N Quantile Regression models.",
        label4: "**NOTE: Models created from Model Tuning  (class train) are not supported",
        modelselector1: "Select 2 or more Quantile Regression models to compare slopes for:",
        help: {
            title: "Compare Quantile Regression Model Slopes",
            r_help: "help(anova.rq,package='quantreg')",
            body: `
<b>Description</b></br>
Compute test statistics for two or more quantile regression fits. 
<br/>
<b>Usage</b>
<br/>
<code> 
anova(object, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: objects of class rq, originating from a call to rq.
</li>
</ul>
<b>Details</b><br/>
T   he hypothesis of interest is that the slope coefficients of the models are identical. The test statistic is a variant of the Wald test described in Koenker and Bassett (1982).<br/>
<b>Value</b><br/>
An object of class "anova" inheriting from class "data.frame".<br/>
<b>Package</b></br>
quantreg</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(anova.rq,package='quantreg')</br></br>
`}
    }
}
class compareQuantReg extends baseModal {
    constructor() {
        var config = {
            id: "compareQuantReg",
            label: localization.en.title,
            splitProcessing: false,
            modalType: "one",
            RCode: `
library(quantreg)
BSkyCompRes = stats::anova({{selected.modelselector1 | safe}})
BSkyFormat(BSkyCompRes)    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"rq\"), returnClassTrain=FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
/*            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },   */
            label4: { el: new labelVar(config, { label: localization.en.label4, h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: localization.en.modelselector1,
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label4.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-compare-n",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new compareQuantReg().render()