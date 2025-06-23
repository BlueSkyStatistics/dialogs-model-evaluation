/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Summarize A Model",
        navigation: "Summarize a model",
        modelselector1: "Select a model",
        help: {
            title: "Summarize A Model",
            r_help: "help(summary)",
            body: `
                <b>Description</b></br>
summary is a generic function used to produce result summaries of the results of various model fitting functions. The function invokes particular methods which depend on the class of the first argument e.g. summary.lm (linear model), summary.glm (generalized linear model)
<br/>
<b>Usage</b>
<br/>
<code> 
summary(object)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: an object for which a summary is desired.
</li>
</ul>
<b>Value</b><br/>
The form of the value returned by summary depends on the class of its argument. See the documentation of the particular methods i.e. help(summary.lm), help(summary.glm)for details of what is produced by that method.</br>
<b>Package</b></br>
base</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(summary)
                `}
    }
}







class summarizeAModel extends baseModal {
    constructor() {
        var config = {
            id: "summarizeAModel",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "one",
            RCode: `
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
print(summary({{selected.modelselector1 | safe}}$finalModel))
} else
{
print(summary({{selected.modelselector1 | safe}}))
}
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\",\"coxphlist\", \"gls\", \"lme\",\"lmlist\",\"loess\",\"loglm\", \"mlm\",\"multinom\",\"negbin\", \"nls\",\"polr\",\"quantmod\",\"survreg\",\"survreglist\",\"rpart\",\"xgb.Booster\",\"lmerModLmerTest\",\"nnet\",\"NaiveBayes\",\"nn\",\"MLP\",\"randomForest\",\"adaboost\",\"fast_adaboost\",\"real_adaboost\",\"blasso\",\"gbm\",\"c5.0\",\"BinaryTree\",\"knn3\",\"glmnet\",\"lognet\",\"train\" ))",
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
                icon: "icon-sigma-one",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new summarizeAModel().render()