










class hosmerLemeshow extends baseModal {
    static dialogId = 'hosmerLemeshow'
    static t = baseModal.makeT(hosmerLemeshow.dialogId)

    constructor() {
        var config = {
            id: hosmerLemeshow.dialogId,
            label: hosmerLemeshow.t('title'),
            splitProcessing:false,
            modalType: "two",
            RCode: `
require(MKmisc)
results <-ModelMatchesDataset('{{selected.modelselector1 | safe}}', '{{dataset.name}}', NAinVarsCheck=FALSE ) 
if ( results$success ==TRUE)
{
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
    BSkyHLStatistic <- MKmisc::HLgof.test(fit = fitted({{selected.modelselector1 | safe}}$finalModel), ngr = {{selected.bins | safe}}, obs = {{selected.destination | safe}})
    BSkyFormat(BSkyHLStatistic$C, outputTableIndex = c(tableone=1))
    BSkyFormat(BSkyHLStatistic$H, outputTableIndex = c(tableone=1))
} else
{
    BSkyHLStatistic <- MKmisc::HLgof.test(fit = fitted({{selected.modelselector1 | safe}}), ngr = {{selected.bins | safe}}, obs = {{selected.destination | safe}})
    BSkyFormat(BSkyHLStatistic$C, outputTableIndex = c(tableone=1))
    BSkyFormat(BSkyHLStatistic$H, outputTableIndex = c(tableone=1))
}
}
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: hosmerLemeshow.t('label1'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: hosmerLemeshow.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            content_var: { el: new srcVariableList(config) },
            destination: {
                el: new dstVariable(config, {
                    label: hosmerLemeshow.t('destination'),
                    no: "destination",
                    filter: "Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "Prefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            bins: {
                el: new inputSpinner(config, {
                  no: 'bins',
                  label: hosmerLemeshow.t('bins'),
                  min: 2,
                  max: 999999999,
                  step: 1,
                  value: 10,
                  extraction: "NoPrefix|UseComma"
                })
              },
        }
        const content = {
            head: [objects.label1.el.content, objects.modelselector1.el.content],
            left: [objects.content_var.el.content],
            right: [objects.destination.el.content, objects.bins.el.content],
            nav: {
                name: hosmerLemeshow.t('navigation'),
                icon: "icon-hl",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: hosmerLemeshow.t('help.title'),
            r_help: "help(data,package='utils')",
            body: hosmerLemeshow.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new hosmerLemeshow().render()
}
