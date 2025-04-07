/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Bonferroni Outlier Test",
        navigation: "Outlier Test",
        label1: "Select a model of one of the following classes (class in parenthesis)- Linear model (lm), Generalized linear model (glm)",
        modelselector1: "Select a model",
        help: {
            title: "Bonferroni Outlier Test",
            r_help: "help(outlierTest, package='car')",
            body: `
                <b>Description</b></br>
Reports the Bonferroni p-values for testing each observation in turn to be a mean-shift outlier, based Studentized residuals in linear (t-tests), generalized linear models (normal tests), and linear mixed models.
<br/>
<b>Usage</b>
<br/>
<code> 
outlierTest(model, ...)<br/>
## S3 method for class 'lm'<br/>
outlierTest(model, cutoff=0.05, n.max=10, order=TRUE, 
labels=names(rstudent), ...)<br/>
## S3 method for class 'lmerMod'<br/>
outlierTest(model, ...)<br/>
## S3 method for class 'outlierTest'<br/>
print(x, digits=5, ...)<br/>
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
model: an lm, glm, or lmerMod model object; the "lmerMod" method calls the "lm" method and can take the same arguments.
</li>
<li>
cutoff: observations with Bonferroni p-values exceeding cutoff are not reported, unless no observations are nominated, in which case the one with the largest Studentized residual is reported.
</li>
<li>
n.max: maximum number of observations to report (default, 10).
</li>
<li>
order: report Studenized residuals in descending order of magnitude? (default, TRUE).
</li>
<li>
labels: an optional vector of observation names.
</li>
<li>
...: arguments passed down to methods functions.
</li>
<li>
x: outlierTest object.
</li>
<li>
digits: number of digits for reported p-values.
</li>
</ul>
<b>Details</b></br>
For a linear model, p-values reported use the t distribution with degrees of freedom one less than the residual df for the model. For a generalized linear model, p-values are based on the standard-normal distribution. The Bonferroni adjustment multiplies the usual two-sided p-value by the number of observations. The lm method works for glm objects. To show all of the observations set cutoff=Inf and n.max=Inf.<br/>
<b>Value</b><br/>
an object of class outlierTest, which is normally just printed.<br/>
<b>Examples</b><br/>
<code> 
outlierTest(lm(prestige ~ income + education, data=Duncan))
</code> <br/>
<b>Package</b></br>
car</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(outlierTest, package="car")
                `}
    }
}







class bonFerroniOutlierTest extends baseModal {
    constructor() {
        var config = {
            id: "bonFerroniOutlierTest",
            label: localization.en.title,
            modalType: "one",
            RCode: `
local(
{
 if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
print( car::outlierTest({{selected.modelselector1 | safe}}$finalModel))
} else
{
print( car::outlierTest({{selected.modelselector1 | safe}}))
}
}
)
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
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
            items: [objects.label1.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-outlier",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new bonFerroniOutlierTest().render()