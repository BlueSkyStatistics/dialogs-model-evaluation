/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class summarizeAModel extends baseModal {
    static dialogId = 'summarizeAModel'
    static t = baseModal.makeT(summarizeAModel.dialogId)

    constructor() {
        var config = {
            id: summarizeAModel.dialogId,
            label: summarizeAModel.t('title'),
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
                    label: summarizeAModel.t('modelselector1'),
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
                name: summarizeAModel.t('navigation'),
                icon: "icon-sigma-one",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: summarizeAModel.t('help.title'),
            r_help: summarizeAModel.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: summarizeAModel.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new summarizeAModel().render()
}
