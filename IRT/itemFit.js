/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class itemFit extends baseModal {
    static dialogId = 'itemFit'
    static t = baseModal.makeT(itemFit.dialogId)

    constructor() {
        var config = {
            id: itemFit.dialogId,
            label: itemFit.t('title'),
            modalType: "one",
            RCode: `
require(eRm);
require(TAM);

local({
  classOfModel =class({{selected.modelselector1 | safe}})
  if (classOfModel =="Rm" || classOfModel =="dRm")
  {
  rm.pp <- person.parameter({{selected.modelselector1 | safe}});
  resToFormat<-eRm::itemfit(rm.pp)
  resToFormat<-BSkyPrintifitClass(resToFormat)
  }
  if (classOfModel =="tam.mml" || classOfModel =="tam.mml.2pl"|| classOfModel =="tam.mml.2pl" || classOfModel =="tam.mml.mfr")
  {
  tam.fmod1 <-  TAM::msq.itemfit({{selected.modelselector1 | safe}}) 
  BSkyFormat(tam.fmod1$itemfit,  singleTableOutputHeader = "Itemfit")
  BSkyFormat(tam.fmod1$summary_itemfit,  singleTableOutputHeader = "Summary Itemfit")
  }
  })
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"dRm\",\"tam.mml\", \"tam.mml.2pl\",\"tam.mml.mfr\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: itemFit.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: itemFit.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: itemFit.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content ],
            nav: {
                name: itemFit.t('navigation'),
                icon: "icon-item_fit",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: itemFit.t('help.title'),
            r_help: itemFit.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: itemFit.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new itemFit().render()
}
