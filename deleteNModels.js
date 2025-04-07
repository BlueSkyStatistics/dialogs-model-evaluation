/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Delete One or More Models",
        navigation: "Delete Models",
        label1: "Make sure that you are absolutely certain before deleting the model(s). Once the model(s) is deleted, it cannot be retrived.",
        modelselector1: "Select one or more models to delete:",
        help: {
            title: "Delete One or More Models",
            //r_help: "help(anova,package='stats')",
            body: `
            <b>Description</b></br>
			Select one or more models to delete. Please make sure that you are absolutely certain before deleting the model(s). Once the model(s) is deleted, it cannot be retrived. 
			<br/>
			</br>
			</br>
		`}
    }
}

class deleteNModels extends baseModal {
    constructor() {
        var config = {
            id: "deleteNModels",
            label: localization.en.title,
            modalType: "one",
            splitProcessing:false,
            RCode: `

cat("\nThe following models have been deleted\n")
cat(strsplit('{{selected.modelselector1 | safe}}',',')[[1]])
rm({{selected.modelselector1 | safe}})
    
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\", \"survfit\", \"flexsurvreg\", \"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 4 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: localization.en.modelselector1,
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            
        }
        const content = {
            items: [objects.label1.el.content, objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-sigma-n",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new deleteNModels().render()