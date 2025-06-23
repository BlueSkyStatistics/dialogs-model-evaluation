/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Plot A Model",
        navigation: "Plot a Model",
        modelselector1: "Select a model of one of the following classes (class in parenthesis) Linear model (lm), Generalized linear models (glm)",
        help: {
            title: "Plot A Model",
            r_help: "help(plot, package ='graphics')",
            body: `
                <b>Description</b></br>
Generic function for plotting of R objects. For more details about the graphical parameter arguments, see par.
For simple scatter plots, plot.default will be used. However, there are plot methods for many different R objects, including functions, data.frames, density objects, etc. Use methods(plot) and the documentation for these.
<br/>
<b>Usage</b>
<br/>
<code> 
plot(object)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: any R object with a plot method can be provided.
</li>
</ul>
<b>Package</b></br>
graphics</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(plot, package ='graphics')
`}
    }
}







class plotAModel extends baseModal {
    constructor() {
        var config = {
            id: "plotAModel",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "one",
            RCode: `
            if ( "train" %in% class({{selected.modelselector1 | safe}}) )
            {
            plot({{selected.modelselector1 | safe}}$finalModel)
            } else
            {
            plot({{selected.modelselector1 | safe}})
            }
           `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: localization.en.modelselector1,
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
                name: localization.en.navigation,
                icon: "icon-gaussian-function",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new plotAModel().render()