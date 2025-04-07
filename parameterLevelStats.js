/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Parameter Level Estimates",
        navigation: "Parameter Estimates",
        label1: "Models of the following classes are supported, classes are listed in parenthesis below ",
        label2: "Linear models (lm), Generalized linear models (glm), Multinomial log-linear (multinom), Quantile regression (rq), Robust linear regression (rlm), Survival curve object (survfit), Linear mixed effects model (lme), Proportional hazards regression object (coxph), Parametric survival regression model (survreg), Ordered logistic/Probit regression (polr), Factor analysis (factanal), Lasso and Elastic-net regularized generalized linear models (glmnet)",
        modelselector1: "Select a model",
        help: {
            title: "Parameter Level Estimates",
            r_help: "help(tidy, package ='broom')",
            body: `
                <b>Description</b></br>
Displays parameter estimates of the selected model
<br/>
<b>Usage</b>
<br/>
<code> 
tidy(x, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
x: model or other R object to convert to single-row data frame
</li>
</ul>
<b>Details</b></br>
Displays parameter estimates of the following models</br>
Linear models (model class lm)</br>
Generalized linear models (model class glm)</br>
Multinomial Log-Linear Models (model class multinom)</br>
Ordered logistic or Probit Regression (model class polr)</br>
Lasso and Elastic-Net Regularized Generalized Linear Models (model class glmnet)</br>
Robust linear regression (model class rlm)</br>
Quantile Regression (model class rq)</br>
linear mixed effects model (lme)</br>
Proportional hazards regression object (coxph)</br>
Parametric survival regression model (survreg)</br>
Factor analysis (factanal)</br>
<b>Value</b></br>
A tibble::tibble() with information about model components.</br>
term: The name of the regression term.</br>
estimate: The estimated value of the regression term.</br>
std.error: The standard error of the regression term.</br>
statistic: The value of a statistic, almost always a T-statistic, to use in a hypothesis that the regression term is non-zero.</br>
p.value: The two-sided p-value associated with the observed statistic.</br>
conf.low: The low end of a confidence interval for the regression term. Included only if conf.int = TRUE.</br>
conf.high: The high end of a confidence interval for the regression term. Included only if conf.int = TRUE.</br>
If the linear model is an mlm object (multiple linear model), there is an additional column:</br>
response: Which response column the coefficients correspond to (typically Y1, Y2, etc)</br>
<b>Package</b></br>
broom</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(tidy, package ='broom')
`}
    }
}







class parameterLevelStats extends baseModal {
    constructor() {
        var config = {
            id: "parameterLevelStats",
            label: localization.en.title,
            modalType: "one",
            splitProcessing:false,
            RCode: `
library(broom)
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}$finalModel %>% tidy() ),singleTableOutputHeader = "Parameter Level Statistics for model {{selected.modelselector1 | safe}}" )
} else
{
BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}%>% tidy() ),singleTableOutputHeader = "Parameter Level Statistics for model {{selected.modelselector1 | safe}}" )
}         
`,
            pre_start_r: JSON.stringify({
                modelselector1:
                    "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"multinom\",\"polr\",\"glmnet\",\"rlm\",\"rq\",\"lognet\",\"coxph\",\"lme\",\"survreg\",\"survfit\",\"factanal\"))",
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
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-parameter_statistics",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new parameterLevelStats().render()