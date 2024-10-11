








class BIC extends baseModal {
    static dialogId = 'BIC'
    static t = baseModal.makeT(BIC.dialogId)

    constructor() {
        var config = {
            id: BIC.dialogId,
            label: BIC.t('title'),
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
                    label: BIC.t('modelselector1'),
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
                name: BIC.t('navigation'),
                icon: "icon-ruler",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: BIC.t('help.title'),
            r_help: "help(data,package='utils')",
            body: BIC.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new BIC().render()
}
