/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class iCCPlots extends baseModal {
    static dialogId = 'iCCPlots'
    static t = baseModal.makeT(iCCPlots.dialogId)

    constructor() {
        var config = {
            id: iCCPlots.dialogId,
            label: iCCPlots.t('title'),
            modalType: "one",
            RCode: `
require(eRm);
require(TAM);

classOfModel  =class({{selected.modelselector1 | safe}})
if (classOfModel =="Rm" || classOfModel =="dRm")
{
    eRm::plotICC({{selected.modelselector1 | safe}}, item.subset = "all", empICC=list("raw",type="b",col="blue",lty="dotted", empCI = NULL,
    mplot = NULL), {{selected.range1 | safe}} ylim = c(0, 1),
    xlab = "Latent Dimension", ylab = "Probability to Solve", main=NULL,
    col = NULL, lty = 1, legpos = "left", ask = FALSE)
} else if (classOfModel =="tam.mml" || classOfModel =="tam.mml.2pl"|| classOfModel =="tam.mml.2pl" || classOfModel =="tam.mml.mfr")
{
    plot({{selected.modelselector1 | safe}}, type="items",  export=FALSE, package="graphics", observed=TRUE {{selected.tb1 | safe}} {{selected.tb2 | safe}})
}   

`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"dRm\",\"tam.mml\", \"tam.mml.2pl\",\"tam.mml.mfr\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: iCCPlots.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: iCCPlots.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: iCCPlots.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },

            label2a: {
                el: new labelVar(config, {
                  label: iCCPlots.t('label2a'), 
                  style: "mt-3", 
                  h:5
                })
              },
              label2b: {
                el: new labelVar(config, {
                  label: iCCPlots.t('label2b'), 
                  style: "mt-1", 
                  h:6
                })
              },
              lblrange: {
                el: new labelVar(config, {
                  label: iCCPlots.t('lblrange'), 
                  style: "mt-1", 
                  h:6
                })
              },                
              range1: {
                el: new input(config, {
                  no: 'range1',
                  label: iCCPlots.t('range1'),
                  placeholder: "",
                  allow_spaces:true,
                  extraction: "TextAsIs",
                  type: "character",
                  ml: 4,
                  width:"w-25",
                  wrapped: 'xlim=c(%val%),'
                })
              },


              label3a: {
                el: new labelVar(config, {
                  label: iCCPlots.t('label3a'), 
                  style: "mt-3", 
                  h:5
                })
              },
              label3b: {
                el: new labelVar(config, {
                  label: iCCPlots.t('label3b'), 
                  style: "mt-1", 
                  h:6
                })
              },        
              lblthetarange: {
                el: new labelVar(config, {
                  label: iCCPlots.t('lblthetarange'), 
                  style: "mt-1", 
                  h:6
                })
              },                    
              tb1: {
                el: new input(config, {
                  no: 'tb1',
                  label: iCCPlots.t('tb1'),
                  placeholder: "",
                  extraction: "TextAsIs",
                  allow_spaces:true,
                  type: "numeric",
                  ml: 4,
                  width:"w-25",
                  wrapped: ', low=c(%val%)'
                })
              },

              tb2: {
                el: new input(config, {
                  no: 'tb2',
                  label: iCCPlots.t('tb2'),
                  placeholder: "",
                  extraction: "TextAsIs",
                  allow_spaces:true,
                  type: "numeric",
                  ml: 4,
                  width:"w-25",
                  wrapped: ', high=c(%val%)'
                })
              }             


        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content,
                objects.label2a.el.content, objects.label2b.el.content, 
                objects.lblrange.el.content, objects.range1.el.content,
                objects.label3a.el.content, objects.label3b.el.content, objects.lblthetarange.el.content,
                objects.tb1.el.content, objects.tb2.el.content,

            ],
            nav: {
                name: iCCPlots.t('navigation'),
                icon: "icon-icc",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: iCCPlots.t('help.title'),
            r_help: iCCPlots.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: iCCPlots.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new iCCPlots().render()
}
