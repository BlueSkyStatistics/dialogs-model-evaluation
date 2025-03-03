/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Compare N Models",
        navigation: "Compare N Models",
        label1: "Compares N models.",
        label2: "Select models of the following classes (R class is in parenthesis below)",
        label3: "Linear models (lm), Generalized linear model (glm), Linear mixed effects model (lme), Ordered Logistic or Probit Regression (polr), Proportional hazard model (coxph), Linear model using generalized least squares (gls), Survival regression model (survreg), Local Polynomial Regression Fitting (loess), Non-linear least square model (nls), Multinomial Log-Linear Models (multinom)",
        label4: "**NOTE: Models created from Model Tuning  (class train) are not supported",
        modelselector1: "Select one or more models to compare:",
        help: {
            title: "Compare N Models",
            r_help: "help(anova,package='stats')",
            body: `
                <b>
Compares 2 nested modes using a F or a Chi-sq test depending on estimation. F tests are used for least squares estimation, chi-sq test are used for maximum likelihood estimation. Both models should be created on the same dataset as differences in missing values can cause problems</b></br>
<b>Description</b></br>
Anova Tables: Computes analysis of variance tables and performs likelihood ratio tests for a fitted model object.  
<br/>
<b>Usage</b>
<br/>
<code> 
anova(object, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object:  an object containing the results returned by a model fitting function (e.g., lm or glm).
</li>
</ul>
<b>Value</b><br/>
This (generic) function returns an object of class anova. These objects represent analysis-of-variance and analysis-of-deviance tables. When given a single argument it produces a table which tests whether the model terms are significant. When given a sequence of objects, anova tests the models against one another in the order specified.<br/>
The print method for anova objects prints tables in a ‘pretty’ form.<br/>
<b>Warning</b><br/>
The comparison between two or more models will only be valid if they are fitted to the same dataset. This may be a problem if there are missing values and R's default of na.action = na.omit is used.<br/>
<b>Package</b></br>
stats</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(anova,package='stats')</br></br>
<b>Description</b></br>
Likelihood Ratio Test of Nested Models: lrtest is a generic function for carrying out likelihood ratio tests. The default method can be employed for comparing nested (generalized) linear models (see details below).
<br/>
<b>Usage</b>
<br/>
<code> 
lrtest(object, ...)<br/>
## Default S3 method:<br/>
lrtest(object, ..., name = NULL) <br/>
## S3 method for class 'formula'<br/>
lrtest(object, ..., data = list())<br/>
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: an object. See below for details.
</li>
<li>
...: further object specifications passed to methods. See below for details.
</li>
<li>
name: a function for extracting a suitable name/description from a fitted model object. By default the name is queried by calling formula.
</li>
<li>
data: a data frame containing the variables in the model.
</li>
</ul>
<b>Details</b></br>
lrtest is intended to be a generic function for comparisons of models via asymptotic likelihood ratio tests. The default method consecutively compares the fitted model object object with the models passed in .... Instead of passing the fitted model objects in ..., several other specifications are possible. The updating mechanism is the same as for waldtest: the models in ... can be specified as integers, characters (both for terms that should be eliminated from the previous model), update formulas or fitted model objects. Except for the last case, the existence of an update method is assumed. See waldtest for details.<br/>
Subsequently, an asymptotic likelihood ratio test for each two consecutive models is carried out: Twice the difference in log-likelihoods (as derived by the logLik methods) is compared with a Chi-squared distribution.<br/>
The "formula" method fits a lm first and then calls the default method.<br/>
<b>Value</b><br/>
An object of class "anova" which contains the log-likelihood, degrees of freedom, the difference in degrees of freedom, likelihood ratio Chi-squared statistic and corresponding p value.
<b>Examples</b><br/>
<code> 
## with data from Greene (1993):<br/>
## load data and compute lags<br/>
data("USDistLag")<br/>
usdl <- na.contiguous(cbind(USDistLag, lag(USDistLag, k = -1)))<br/>
colnames(usdl) <- c("con", "gnp", "con1", "gnp1")<br/>
fm1 <- lm(con ~ gnp + gnp1, data = usdl)<br/>
fm2 <- lm(con ~ gnp + con1 + gnp1, data = usdl)<br/>
## various equivalent specifications of the LR test<br/>
lrtest(fm2, fm1)<br/>
lrtest(fm2, 2)<br/>
lrtest(fm2, "con1")<br/>
lrtest(fm2, . ~ . - con1)<br/>
</code> <br/>
                `}
    }
}







class compareNModels extends baseModal {
    constructor() {
        var config = {
            id: "compareNModels",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "one",
            RCode: `
library(texreg)
hout = texreg::htmlreg(list({{selected.modelselector1 | safe}}), digits = BSkyGetDecimalDigitSetting(), \n\tcenter = FALSE, caption = "Statistical Model Comparison", caption.above = TRUE)
BSkyFormat(hout)    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
                
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
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-compare-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new compareNModels().render()