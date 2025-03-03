/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Item and Test Information",
        navigation: "Item and Test Information",
        label1: "Select a model (models of class Rm, eRm supported)",
        label1b : "If no models are available, you need to create a model first by selecting Model Fitting -> IRT -> Simple Rasch Model and choose CML estimation",
        modelselector1: "Select a model",

        help: {
            title: "Plot Information for 'eRm' objects",
            r_help: "help(plotINFO, package='eRm')",
            body: `
                <b>Description</b></br>
                Calculates and plots the individual or summed item information by Samejima (1969)
                <br/><br/>
                <b>Usage</b>
                <br/>
                <code>
                plotINFO(ermobject, type = "both", theta = seq(-6, 6, length.out = 1001L), ...)
                </code>
                <br/><br/>
                <b>Arguments</b>
                <br/>  
                object: object of class eRm
                <br/>
                type:  A string denoting the type of information to be plotted. Currently supports "item", "test" and "both" (default).
                <br/>
                theta:  Supporting or sampling points on the latent trait         
                <br/><br/>
                <b>Packages</b>
                <br/>
                eRm
                <br/><br/>
                <b>Help</b>
                <br/>
                help(plotINFO, package='eRm')
                `}
    }
}

class itemAndTestInfo extends baseModal {
    constructor() {
        var config = {
            id: "itemAndTestInfo",
            label: localization.en.title,
            modalType: "one",
            RCode: `
require(eRm);

plotINFO({{selected.modelselector1 | safe}}, theta = seq(-4, 4,length.out = 1001L))
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"eRm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label1b: { el: new labelVar(config, { label: localization.en.label1b, h: 6 }) },
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
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content ],
            nav: {
                name: localization.en.navigation,
                icon: "icon-temperatire",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new itemAndTestInfo().render()
