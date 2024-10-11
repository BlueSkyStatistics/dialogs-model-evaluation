








class modelLevelStatistics extends baseModal {
    static dialogId = 'modelLevelStatistics'
    static t = baseModal.makeT(modelLevelStatistics.dialogId)

    constructor() {
        var config = {
            id: modelLevelStatistics.dialogId,
            label: modelLevelStatistics.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
require(broom)
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}$finalModel %>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
} else
{
BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}%>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
}         
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"multinom\",\"polr\",\"glmnet\",\"rlm\",\"rq\",\"lognet\",\"coxph\",\"lme\",\"survreg\",\"survfit\",\"factanal\", \"lmerModLmerTest\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: modelLevelStatistics.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: modelLevelStatistics.t('label2'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: modelLevelStatistics.t('modelselector1'),
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
                name: modelLevelStatistics.t('navigation'),
                icon: "icon-model_statistics",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: modelLevelStatistics.t('help.title'),
            r_help: "help(data,package='utils')",
            body: modelLevelStatistics.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new modelLevelStatistics().render()
}
