/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Variance Inflation Factors",
        navigation: "VIF",
        modelselector1: "Select a model of one of the following classes (class in parenthesis) Linear model (lm), Generalized linear models (glm), Ordered Logistic Or Probit Regression (polr), Multinomial Log-Linear Models (multinom), Survival (coxph)",
        help: {
            title: "Variance Inflation Factors",
            r_help: "help(vif, package='car')",
            body: `
                <b>Description</b></br>
Calculates variance-inflation and generalized variance-inflation factors for linear, generalized linear, and other models.
<br/>
<b>Usage</b>
<br/>
<code> 
vif(mod, ...)
## Default S3 method:
vif(mod, ...)
## S3 method for class 'merMod'
vif(mod, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
mod: for the default method, an object that responds to coef, vcov, and model.matrix, such as an lm or glm object.
</li>
<li>
... not used.
</li>
</ul>
<b>Details</b></br>
If all terms in an unweighted linear model have 1 df, then the usual variance-inflation factors are calculated.</br>
If any terms in an unweighted linear model have more than 1 df, then generalized variance-inflation factors (Fox and Monette, 1992) are calculated. These are interpretable as the inflation in size of the confidence ellipse or ellipsoid for the coefficients of the term in comparison with what would be obtained for orthogonal data.</br>
The generalized vifs are invariant with respect to the coding of the terms in the model (as long as the subspace of the columns of the model matrix pertaining to each term is invariant). To adjust for the dimension of the confidence ellipsoid, the function also prints GVIF^[1/(2*df)] where df is the degrees of freedom associated with the term.</br>
Through a further generalization, the implementation here is applicable as well to other sorts of models, in particular weighted linear models, generalized linear models, and mixed-effects models.</br>
<b>Value</b><br/>
A vector of vifs, or a matrix containing one row for each term in the model, and columns for the GVIF, df, and GVIF^[1/(2*df)].<br/>
<b>Examples</b><br/>
<code> 
## A ridiculous example...
vif(lm(prestige ~ income + education, data=Duncan))
vif(lm(prestige ~ income + education + type, data=Duncan))
</code> <br/>
<b>Package</b></br>
car</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(vif, package="car")
                `}
    }
}







class varianceInflationFactors extends baseModal {
    constructor() {
        var config = {
            id: "varianceInflationFactors",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "one",
            RCode: `
require(car)
local(
{
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
obj <- car::vif({{selected.modelselector1 | safe}}$finalModel)
BSkyFormat(obj, singleTableOutputHeader="Variance-inflation factors")
}
else
{
obj <- car::vif({{selected.modelselector1 | safe}})
BSkyFormat(obj, singleTableOutputHeader="Variance-inflation factors")
}
}
)           
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"polr\",\"multinom\", \"coxph\"))",
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
                icon: "icon-variance_inflation",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new varianceInflationFactors().render()