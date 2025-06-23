/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "ANOVA & Likelihood Ratio Test",
        navigation: "ANOVA & Likelihood Ratio",
        label1: "ANOVA is performed for models with the following classes (R classes in parenthesis) Linear models (lm), Generalized linear models (glm), Negative-binomial log linear model (negbin), Linear model using generalized least squares (gls), Survival regression model (survreg), Proportional hazard model (coxph), Loess regression (loess)",
        label2: "**NOTE: Likelihood test is not supported for models created via Model Tuning (class train),",
        modelselector1: "Select a model",
        help: {
            title: "ANOVA & Likelihood Ratio Test",
            r_help: "help(anova,package='stats')",
            body: `
                <b>Description</b></br>
ANOVA Tables: Computes analysis of variance tables and performs likelihood ratio tests for a fitted model object.  For Mixed effects models, the ANOVA-like table for random effects is displayed. 
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
<b>Description</b></br>
ANOVA-Like Table for Random-Effects: Compute an ANOVA-like table with tests of random-effect terms in the model. Each random-effect term is reduced or removed and likelihood ratio tests of model reductions are presented in a form similar to that of drop1. rand is an alias for ranova.
<br/>
<b>Usage</b>
<br/>
<code> 
ranova(model, reduce.terms = TRUE, ...)<br/>
rand(model, reduce.terms = TRUE, ...)<br/>
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
model: a linear mixed effect model fitted with lmer() (inheriting from class lmerMod).
</li>
<li>
reduce.terms: if TRUE (default) random-effect terms are reduced (if possible). If FALSE random-effect terms are simply removed.
</li>
</ul>
<b>Details</b></br>
If the model is fitted with REML the tests are REML-likelihood ratio tests.<br/>
A random-effect term of the form (f1 + f2 | gr) is reduced to terms of the form (f2 | gr) and (f1 | gr) and these reduced models are compared to the original model. If reduce.terms is FALSE (f1 + f2 | gr) is removed instead.<br/>
A random-effect term of the form (f1 | gr) is reduced to (1 | gr) (unless reduce.terms is FALSE).<br/>
A random-effect term of the form (1 | gr) is not reduced but simply removed.<br/>
A random-effect term of the form (0 + f1 | gr) or (-1 + f1 | gr) is reduced (if reduce.terms = TRUE) to (1 | gr).<br/>
A random-effect term of the form (1 | gr1/gr2) is automatically expanded to two terms: (1 | gr2:gr1) and (1 | gr1) using findbars.<br/>
In this exposition it is immaterial whether f1 and f2 are factors or continuous variables.<br/>
<b>Value</b><br/>
An ANOVA-like table with single term deletions of random-effects inheriting from class anova and data.frame with the columns:</br>
npar: number of model parameters.</br>
logLik: the log-likelihood for the model. Note that this is the REML-logLik if the model is fitted with REML.</br>
AIC: the AIC for the model evaluated as -2*(logLik - npar). Smaller is better.</br>
LRT: the likelihood ratio test statistic; twice the difference in log-likelihood, which is asymptotically chi-square distributed.</br>
Df: degrees of freedom for the likelihood ratio test: the difference in number of model parameters.</br>
Pr(>Chisq) :the p-value.</br>
<b>Warning</b></br>
In certain cases tests of non-nested models may be generated. An example is when (0 + poly(x, 2) | gr) is reduced (the default) to (1 | gr). To our best knowledge non-nested model comparisons are only generated in cases which are statistical nonsense anyway (such as in this example where the random intercept is suppressed).</br>
Note: Note that anova can be used to compare two models and will often be able to produce the same tests as ranova. This is, however, not always the case as illustrated in the examples.</br>
<b>Examples</b><br/>
<code> 
# Test reduction of (Days | Subject) to (1 | Subject):<br/>
fm1 <- lmer(Reaction ~ Days + (Days|Subject), sleepstudy)<br/>
ranova(fm1) # 2 df test<br/>
# This test can also be achieved with anova():<br/>
fm2 <- lmer(Reaction ~ Days + (1|Subject), sleepstudy)<br/>
anova(fm1, fm2, refit=FALSE)<br/>
# Illustrate reduce.test argument:<br/>
# Test removal of (Days | Subject):<br/>
ranova(fm1, reduce.terms = FALSE) # 3 df test<br/>
# The likelihood ratio test statistic is in this case:<br/>
fm3 <- lm(Reaction ~ Days, sleepstudy)<br/>
2*c(logLik(fm1, REML=TRUE) - logLik(fm3, REML=TRUE)) # LRT<br/>
# anova() is not always able to perform the same tests as ranova(),<br/>
# for example:<br/>
anova(fm1, fm3, refit=FALSE) # compares REML with ML and should not be used<br/>
anova(fm1, fm3, refit=TRUE) # is a test of ML fits and not what we seek<br/>
# Also note that the lmer-fit needs to come first - not an lm-fit:<br/>
# anova(fm3, fm1) # does not work and gives an error<br/>
# ranova() may not generate all relevant test:<br/>
# For the following model ranova() indicates that we should not reduce<br/>
# (TVset | Assessor):
fm <- lmer(Coloursaturation ~ TVset * Picture + (TVset | Assessor), data=TVbo)<br/>
ranova(fm)<br/>
# However, a more appropriate model is:<br/>
fm2 <- lmer(Coloursaturation ~ TVset * Picture + (1 | TVset:Assessor), data=TVbo)<br/>
anova(fm, fm2, refit=FALSE)<br/>
# fm and fm2 has essentially the same fit to data but fm uses 5 parameters more than fm.<br/>
</code> <br/>
<b>Package</b></br>
lmerTest</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(ranova, package ='lmerTest')
                `}
    }
}







class anovaLikelihoodRatio extends baseModal {
    constructor() {
        var config = {
            id: "anovaLikelihoodRatio",
            label: localization.en.title,
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
                icon: "icon-anova_lrt",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new anovaLikelihoodRatio().render()