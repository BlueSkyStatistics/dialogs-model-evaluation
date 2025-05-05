/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class plotPImap extends baseModal {
    static dialogId = 'plotPImap'
    static t = baseModal.makeT(plotPImap.dialogId)

    constructor() {
        var config = {
            id: plotPImap.dialogId,
            label: plotPImap.t('title'),
            modalType: "one",
            RCode: `
require(eRm);

plotPImap({{selected.modelselector1 | safe}}, item.subset = "all", sorted = FALSE,
   main = "Person-Item Map", latdim = "Latent Dimension",
   pplabel = "Person\nParameter\nDistribution", cex.gen = 0.7,
   xrange = NULL, warn.ord = TRUE, warn.ord.colour = "black",
   irug = TRUE, pp = NULL)

`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"dRm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: plotPImap.t('label1'), h: 6 }) },
            label1b: { el: new labelVar(config, { label: plotPImap.t('label1b'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: plotPImap.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            range1: {
                el: new input(config, {
                  no: 'range1',
                  label: plotPImap.t('range1'),
                  placeholder: "",
                  allow_spaces:true,
                  extraction: "TextAsIs",
                  type: "character",
                  width:"w-25",
                })
              },
        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, 
                objects.modelselector1.el.content, objects.range1.el.content ],
            nav: {
                name: plotPImap.t('navigation'),
                icon: "icon-pi",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: plotPImap.t('help.title'),
            r_help: plotPImap.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: plotPImap.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new plotPImap().render()
}
