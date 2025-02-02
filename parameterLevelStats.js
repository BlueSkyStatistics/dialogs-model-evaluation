








class parameterLevelStats extends baseModal {
    static dialogId = 'parameterLevelStats'
    static t = baseModal.makeT(parameterLevelStats.dialogId)

    constructor() {
        var config = {
            id: parameterLevelStats.dialogId,
            label: parameterLevelStats.t('title'),
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
            label1: { el: new labelVar(config, { label: parameterLevelStats.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: parameterLevelStats.t('label2'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: parameterLevelStats.t('modelselector1'),
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
                name: parameterLevelStats.t('navigation'),
                icon: "icon-parameter_statistics",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: parameterLevelStats.t('help.title'),
            r_help: parameterLevelStats.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: parameterLevelStats.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new parameterLevelStats().render()
}
