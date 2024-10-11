


class likelihoodRatiosPlotBetas extends baseModal {
    static dialogId = 'likelihoodRatiosPlotBetas'
    static t = baseModal.makeT(likelihoodRatiosPlotBetas.dialogId)

    constructor() {
        var config = {
            id: likelihoodRatiosPlotBetas.dialogId,
            label: likelihoodRatiosPlotBetas.t('title'),
            splitProcessing:false,
            modalType: "two",
            RCode: `
require(eRm)

local({
    vars=NULL
    #Running the liklihood ratio test
    lrTestRes <- LRtest(object={{selected.modelselector1 | safe}}, splitcr = "{{selected.spcr | safe}}", se=TRUE)
    
    #Displaying results of the Anderson liklihood ratio test
    dispLrTestRes<-matrix( data =c(lrTestRes$LR, lrTestRes$df, lrTestRes$pvalue), nrow =3, ncol=1, dimnames = list(c("LR-value:", "Chi-square df:" , "p-value:"),c("Values") ))
    BSkyFormat(dispLrTestRes,singleTableOutputHeader ="Andersen LR-test:" )
    
    #Get the variables to plot betas for
    vars =c({{selected.destination | safe}})
    if (!is.null(vars))
    {
    #Getting the indexes of the variables selected
    indexOfVariables <-  UAgetIndexsOfColsInDataSet( dataSetNameOrIndex= "{{dataset.name}}", colNames =vars)
    
    #Plotting betas
    plotGOF(lrTestRes,  tlab = "item",beta.subset=indexOfVariables, conf = list(ia = FALSE, col = "blue", lty = "dotted"))
    }
    })
    
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"eRm\",\"dRm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: likelihoodRatiosPlotBetas.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: likelihoodRatiosPlotBetas.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: likelihoodRatiosPlotBetas.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },

            spcr: {
                el: new selectVar(config, {
                    no: 'spcr',
                    label: likelihoodRatiosPlotBetas.t('spcr'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["median", "mean", "all.r"],
                    default: "median"
                })
            },

            content_var: { el: new srcVariableList(config) },
            destination: {
                el: new dstVariableList(config, {
                    label: likelihoodRatiosPlotBetas.t('destination'),
                    no: "destination",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
        }
        const content = {
            head: [objects.label1.el.content, objects.label1b.el.content, 
                objects.modelselector1.el.content, objects.spcr.el.content],
            left: [objects.content_var.el.content],
            right: [objects.destination.el.content],
            nav: {
                name: likelihoodRatiosPlotBetas.t('navigation'),
                icon: "icon-beta_p",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: likelihoodRatiosPlotBetas.t('help.title'),
            r_help: "help(data,package='utils')",
            body: likelihoodRatiosPlotBetas.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new likelihoodRatiosPlotBetas().render()
}
