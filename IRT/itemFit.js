/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Item Fit",
        navigation: "Item Fit",
        label1: "Select a model (models of class Rm, dRm, tam.mml, tam.mml.2pl, tam.mml.mfr supported)",
        label1b : "If no models are available, you need to create a model first by selecting Model Fitting -> IRT",
        modelselector1: "Select a model",

        help: {
            title: "Item Fit",
            r_help: "help(itemfit, package='eRm')",
            body: `
                <b>Description</b></br>
                For models of class Rm or dRm (Created by using IRT->Simple Rasch Model with CML estimation) uses the function itemfit to display Itemfit statistics.
                <br/>
                For models of class tam.mml,tam.mml.2pl, tam.mml.2pl, tam.mml.mfr (Created by using IRT->Simple Rasch Model, Partial Credit Model, Rating Scale Model and multi-faceted models (Partial Credit and Rating Scale) with MML estimation uses the function msq.itemfit to Mean Squared Residual Based Item Fit Statistics (Infit, Outfit)

                <br/><br/>
                <b>Usage</b>
                <br/>
                <code>
                eRm::itemfit(object)
                </code>
                <br/>
                <code>
                TAM::msq.itemfit(object)
                </code>
                <br/><br/>
                <b>Details</b>
                <br/>  
                Run the following from the BlueSky Statistics Syntax editor  help(itemfit, package ='eRm')
                <br/>
                Run the following from the BlueSky Statistics Syntax editor help(msq.itemfit, package ='TAM')
                <br/>
                The detailed help will launch in your default browser         
                <br/><br/>
                <b>Packages</b>
                <br/>
                eRm, TAM
                <br/><br/>
                <b>Help</b>
                <br/>
                help(itemfit, package='eRm')
                `}
    }
}

class itemFit extends baseModal {
    constructor() {
        var config = {
            id: "itemFit",
            label: localization.en.title,
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
                icon: "icon-item_fit",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new itemFit().render()