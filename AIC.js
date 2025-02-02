








class AIC extends baseModal {
    static dialogId = 'AIC'
    static t = baseModal.makeT(AIC.dialogId)

    constructor() {
        var config = {
            id: AIC.dialogId,
            label: AIC.t('title'),
            modalType: "one",
            RCode: `
            if ( "train" %in% class({{selected.modelselector1 | safe}}) )
            {
            cat(stats::AIC({{selected.modelselector1 | safe}}$finalModel))
            } else
            {
            cat(stats::AIC({{selected.modelselector1 | safe}}))
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
                    label: AIC.t('modelselector1'),
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
                name: AIC.t('navigation'),
                icon: "icon-regression_stepaic",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: AIC.t('help.title'),
            r_help: AIC.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: AIC.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new AIC().render()
}
