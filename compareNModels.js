








class compareNModels extends baseModal {
    static dialogId = 'compareNModels'
    static t = baseModal.makeT(compareNModels.dialogId)

    constructor() {
        var config = {
            id: compareNModels.dialogId,
            label: compareNModels.t('title'),
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
            label1: { el: new labelVar(config, { label: compareNModels.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: compareNModels.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: compareNModels.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: compareNModels.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: compareNModels.t('modelselector1'),
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
                name: compareNModels.t('navigation'),
                icon: "icon-compare-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: compareNModels.t('help.title'),
            r_help: "help(data,package='utils')",
            body: compareNModels.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new compareNModels().render()
}
