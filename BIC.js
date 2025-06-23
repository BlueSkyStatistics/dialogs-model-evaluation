/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "BIC",
        navigation: "BIC",
        modelselector1: "Select a model of one of the following classes (class in parenthesis) Linear model (lm) Generalized linear models (glm) Ordered Logistic Or Probit Regression (polr) Multinomial Log-Linear Models (multinom)",
        help: {
            title: "BIC",
            r_help: "help(BIC,package='stats')",
            body: `
                <b>Description</b></br>
Generic function calculating Akaike's ‘An Information Criterion’ for one or several fitted model objects for which a log-likelihood value can be obtained, according to the formula -2*log-likelihood + k*npar, where npar represents the number of parameters in the fitted model, and k = 2 for the usual AIC, or k = log(n) (n being the number of observations) for the so-called BIC or SBC (Schwarz's Bayesian criterion).
<br/>
<b>Usage</b>
<br/>
<code> 
AIC(object, ..., k = 2)
BIC(object, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: a fitted model object for which there exists a logLik method to extract the corresponding log-likelihood, or an object inheriting from class logLik.
</li>
<li>
... optionally more fitted model objects.
</li>
<li>
k: numeric, the penalty per parameter to be used; the default k = 2 is the classical AIC.
</li>
</ul>
<b>Details</b></br>
When comparing models fitted by maximum likelihood to the same data, the smaller the AIC or BIC, the better the fit.
The theory of AIC requires that the log-likelihood has been maximized: whereas AIC can be computed for models not fitted by maximum likelihood, their AIC values should not be compared.</br>
Examples of models not ‘fitted to the same data’ are where the response is transformed (accelerated-life models are fitted to log-times) and where contingency tables have been used to summarize data.</br>
These are generic functions (with S4 generics defined in package stats4): however methods should be defined for the log-likelihood function logLik rather than these functions: the action of their default methods is to call logLik on all the supplied objects and assemble the results. Note that in several common cases logLik does not return the value at the MLE: see its help page.</br>
The log-likelihood and hence the AIC/BIC is only defined up to an additive constant. Different constants have conventionally been used for different purposes and so extractAIC and AIC may give different values (and do for models of class "lm": see the help for extractAIC). Particular care is needed when comparing fits of different classes (with, for example, a comparison of a Poisson and gamma GLM being meaningless since one has a discrete response, the other continuous).</br>
BIC is defined as AIC(object, ..., k = log(nobs(object))). This needs the number of observations to be known: the default method looks first for a "nobs" attribute on the return value from the logLik method, then tries the nobs generic, and if neither succeed returns BIC as NA.</br>
<b>Value</b><br/>
If just one object is provided, a numeric value with the corresponding AIC (or BIC, or ..., depending on k).
If multiple objects are provided, a data.frame with rows corresponding to the objects and columns representing the number of parameters in the model (df) and the AIC or BIC.<br/>
<b>Examples</b><br/>
<code> 
lm1 <- lm(Fertility ~ . , data = swiss)</br>
AIC(lm1)</br>
stopifnot(all.equal(AIC(lm1),<br/>
                    AIC(logLik(lm1))))<br/>
BIC(lm1)</br>
lm2 <- update(lm1, . ~ . -Examination)</br>
AIC(lm1, lm2)</br>
BIC(lm1, lm2)</br>
</code> <br/>
<b>Package</b></br>
stats</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(BIC,package='stats')
                `}
    }
}







class BIC extends baseModal {
    constructor() {
        var config = {
            id: "BIC",
            label: localization.en.title,
            modalType: "one",
            RCode: `
            if ( "train" %in% class({{selected.modelselector1 | safe}}) )
            {
            cat(stats::BIC({{selected.modelselector1 | safe}}$finalModel))
            } else
            {
            cat(stats::BIC({{selected.modelselector1 | safe}}))
            }
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"polr\",\"multinom\"))",
            })
        }
        var objects = {
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
            items: [objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-ruler",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new BIC().render()