


class deleteNModels extends baseModal {
    static dialogId = 'deleteNModels'
    static t = baseModal.makeT(deleteNModels.dialogId)

    constructor() {
        var config = {
            id: deleteNModels.dialogId,
            label: deleteNModels.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `

cat("\nThe following models have been deleted\n")
cat(strsplit('{{selected.modelselector1 | safe}}',',')[[1]])
rm({{selected.modelselector1 | safe}})
    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\", \"survfit\", \"flexsurvreg\", \"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: deleteNModels.t('label1'), h: 4 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: deleteNModels.t('modelselector1'),
                    multiple: true,
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
                name: deleteNModels.t('navigation'),
                icon: "icon-sigma-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: deleteNModels.t('help.title'),
            r_help: deleteNModels.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: deleteNModels.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new deleteNModels().render()
}
