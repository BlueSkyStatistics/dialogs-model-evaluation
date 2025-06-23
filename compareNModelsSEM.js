/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Compare N SEM Models",
        navigation: "Compare N SEM Models",
        label1: "Compares N SEM models.",
        label2: "Select models of the following classes (R class is in parenthesis below)",
        label3: "Structural equation models (lavaan)",  
        modelselector1: "Select one or more models to compare:",
        help: {
            title: "Compare N SEM Models",
            r_help: "help(lavTestLRT, package='lavaan')",
            body: `
                <b>
LRT test for comparing (nested) lavaan models.</b></br>
<b>Usage</b>
<br/>
<code> 
lavTestLRT(object, method = "default",
            type = "Chisq")
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object:  an object of class lavaan.
</li>
</ul>
<b>Value</b><br/>
An object of class anova. When given a single argument, it simply returns the test statistic of this model. When given a sequence of objects, this function tests the models against one another, after reordering the models according to their degrees of freedom<br/>
<b>Package</b></br>
lavaan</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(lavTestLRT,package='lavaan')</br></br>
<b>Examples</b><br/>
<code> 
lavaan::lavTestLRT(Sem1,Sem2, Sem3)<br/>
</code> <br/>
                `}
    }
}







class compareNModelsSEM extends baseModal {
    constructor() {
        var config = {
            id: "compareNModelsSEM",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "one",
            RCode: `
library(lavaan)
if (exists('BSkyComparisonResults')) rm(BSkyComparisonResults)
BSkyComparisonResults = lavaan::lavTestLRT({{selected.modelselector1 | safe}})
BSkyFormat(BSkyComparisonResults, singleTableOutputHeader ="Chi-Squared Difference Test") 
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lavaan\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
            
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
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content,  objects.modelselector1.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-compare-n",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new compareNModelsSEM().render()