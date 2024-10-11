








class varianceInflationFactorsCox extends baseModal {
    static dialogId = 'varianceInflationFactorsCox'
    static t = baseModal.makeT(varianceInflationFactorsCox.dialogId)

    constructor() {
        var config = {
            id: varianceInflationFactorsCox.dialogId,
            label: varianceInflationFactorsCox.t('title'),
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
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"polr\",\"multinom\",\"coxph\"))",
            })
        }
        var objects = {
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: varianceInflationFactorsCox.t('modelselector1'),
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
                name: varianceInflationFactorsCox.t('navigation'),
                icon: "icon-variance_inflation",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: varianceInflationFactorsCox.t('help.title'),
            r_help: "help(data,package='utils')",
            body: varianceInflationFactorsCox.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new varianceInflationFactorsCox().render()
}
