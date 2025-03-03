/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Personfit Statistics and Martin-Löf's Likelihood-Ratio-Test",
        navigation: "Person Fit",
        label1: "Select a model (models of class Rm, dRm and eRm are supported)",
        label1b : "If no models are available, you need to create a model first by selecting Model Fitting -> IRT -> Simple Rasch Model and choose CML estimation",
        modelselector1: "Select a model",
        chkbox : "Display Martin-Löf's Likelihood-Ratio-Test Statistics",
        lbl2 : "Split Criteria for Likelihood-Ratio Test",
        rd1 : "median",
        rd2 : "mean",

        help: {
            title: "Personfit Statistics and Martin-Löf's Likelihood-Ratio-Test",
            r_help: "help(personfit, package='eRm')",
            body: `
                <b>Description: personfit statistics</b></br>
                For models of class Rm, eRm or dRm (Created by using IRT -> Simple Rasch Model with CML estimation) uses the function personfit to display personfit statistics.

                <br/><br/>
                <b>Usage</b>
                <br/>
                <code>
                eRm::personfit(object)
                </code>
                <br/><br/>
                <b>Details</b>
                <br/>  
                object: Object of class ppar, derived from person.parameter, run help(person.parameter) from the syntax editor for help.
                <br/><br/>
                <b>Values</b>
                <br/>
                p.df: degrees of freedom for personfit statistics
                <br/>
                st.res: Standardized residuals (from function personfit).
                <br/>
                p.outfitMSQ: Outfit mean-square statistics (from function personfit).
                <br/>
                p.infitMSQ: Infit mean-square statistics (from function personfit).
                <br/><br/>
                <b>Help</b>
                <br/>
                Run the following from the BlueSky Statistics Syntax editor help(personfit, package ='eRm')
                <br/><br/>
                <b>Packages</b>
                <br/>
                eRm
                <br/>

                <b>Description: Martin-Löf's Likelihood-Ratio-Test</b></br>
                This Likelihood-Ratio-Test is based on item subgroup splitting.
                <br/><br/>
                <b>Usage</b>
                <br/>
                <code>
                MLoef(robj, splitcr = "median")
                </code>
                <br/><br/>
                <b>Details</b>
                <br/>  
                robj: An object of class 'Rm'.
                <br/>
                splitcr: Split criterion to define the item groups. "median" and "mean" split items in two groups based on their items' raw scores. splitcr can also be a vector of length k(where k denotes the number of items) that takes two or more distinct values to define groups used for the Martin-Löf's Test.
                <br/><br/>
                <b>Values</b>
                <br/>
                MLoef returns an object of class MLoef containing:
                <br/><br/>
                LR: LR-value
                <br/>
                df: degrees of freedom
                <br/>
                p.value: p-value of the test
                <br/>
                fullModel: the overall Rasch model
                <br/>
                subModels: a list containing the submodels
                <br/>
                Lf: log-likelihood of the full model
                <br/>
                Ls: list of the sub models' log-likelihoods
                <br/>
                i.groups: a list of the item groups
                <br/>
                splitcr: submitted split criterion
                <br/>
                split.vector: binary allocation of items to groups
                <br/>
                warning: items equalling median or mean for the respective split criteria
                <br/><br/>
                <b>Packages</b>
                <br/>
                eRm                
                <br/><br/>
                <b>Help</b>
                <br/>
                Run the following from the BlueSky Statistics Syntax editor  help(MLoef, package ='eRm')

                `}
    }
}

class personFit extends baseModal {
    constructor() {
        var config = {
            id: "personFit",
            label: localization.en.title,
            modalType: "one",
            RCode: `
require(eRm);

local({
    #Estimation of person parameters
    personParametersResults <- person.parameter({{selected.modelselector1 | safe}})
    
    #personfit statistics
    print(personfit(personParametersResults))
    
    if ({{selected.chkbox | safe}})
    {
    #Martin-Löf's Likelihood-Ratio-Test based on item sub-group splitting
    mlrtResults <- MLoef(personParametersResults, splitcr = "{{selected.splitcriteria | safe}}")
    summary(mlrtResults)
    }
    })
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"Rm\", \"eRm\",\"dRm\"))",
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
            chkbox: {
                el: new checkbox(config, {
                    label: localization.en.chkbox,
                    no: "chkbox",
                    style: "mt-3",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    state: "checked",
                    newline: true,
                })
            },

            lbl2: { el: new labelVar(config, { label: localization.en.lbl2, h: 6, style: "mt-3" }) },
            rd1: {
                el: new radioButton(config, {
                    label: localization.en.rd1,
                    no: "splitcriteria",
                    increment: "rd1",
                    value: "median",
                    extraction: "ValueAsIs",
                    state: "checked"
                })
            }, 
            rd2: {
                el: new radioButton(config, {
                    label: localization.en.rd2,
                    no: "splitcriteria",
                    increment: "rd2",
                    value: "mean",
                    extraction: "ValueAsIs"
                    
                })
            }                         

        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content,
                objects.chkbox.el.content, objects.lbl2.el.content,
                objects.rd1.el.content, objects.rd2.el.content
            ],
            nav: {
                name: localization.en.navigation,
                icon: "icon-person",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new personFit().render()