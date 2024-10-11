
class compareQuantReg extends baseModal {
    static dialogId = 'compareQuantReg'
    static t = baseModal.makeT(compareQuantReg.dialogId)

    constructor() {
        var config = {
            id: compareQuantReg.dialogId,
            label: compareQuantReg.t('title'),
            splitProcessing: false,
            modalType: "one",
            RCode: `
library(quantreg)
BSkyCompRes = stats::anova({{selected.modelselector1 | safe}})
BSkyFormat(BSkyCompRes)    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"rq\"), returnClassTrain=FALSE)",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: compareQuantReg.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: compareQuantReg.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: compareQuantReg.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: compareQuantReg.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: compareQuantReg.t('modelselector1'),
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label4.el.content, objects.modelselector1.el.content],
            nav: {
                name: compareQuantReg.t('navigation'),
                icon: "icon-compare-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: compareQuantReg.t('help.title'),
            r_help: "help(data,package='utils')",
            body: compareQuantReg.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new compareQuantReg().render()
}
