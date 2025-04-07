/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Hosmer-Lemeshow Test",
        navigation: "Hosmer-Lemeshow Test",
        label1: "NOTE: THE ACTIVE DATASET MUST BE THE SAME DATASET USED TO BUILD THE MODEL",
        modelselector1: "Select a generalized linear model (model of class glm):",
        destination: "Target variable:",
        bins: "Number of bins", 
        help: {
            title: "Hosmer-Lemeshow Test",
            r_help: "help(HLgof.test, package='MKmisc')",
            body: `
                <b>Description</b></br>
The function computes Hosmer-Lemeshow goodness of fit tests for C and H statistic as well as the le Cessie-van Houwelingen-Copas-Hosmer unweighted sum of squares test for global goodness of fit.
<br/>
<b>Usage</b>
<br/>
<code> 
HLgof.test(fit, obs, ngr = 10, X, verbose = FALSE)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
fit: numeric vector with fitted probabilities.
</li>
<li>
obs: numeric vector with observed values.
</li>
<li>
ngr: number of groups for C and H statistic.
</li>
<li>
X: covariate(s) for le Cessie-van Houwelingen-Copas-Hosmer global goodness of fit test.
</li>
<li>
verbose: logical, print intermediate results.
</li>
</ul>
<b>Details</b></br>
Hosmer-Lemeshow goodness of fit tests are computed; see Lemeshow and Hosmer (1982). If X is specified, the le Cessie-van Houwelingen-Copas-Hosmer unweighted sum of squares test for global goodness of fit is additionally determined; see Hosmer et al. (1997). A more general version of this test is implemented in function residuals.lrm in package rms.</br>
<b>Value</b><br/>
A list of test results.
<b>Examples</b><br/>
<code> 
set.seed(111)
x1 <- factor(sample(1:3, 50, replace = TRUE))</br>
x2 <- rnorm(50)</br>
obs <- sample(c(0,1), 50, replace = TRUE)</br>
fit <- glm(obs ~ x1+x2, family = binomial)</br>
HLgof.test(fit = fitted(fit), obs = obs)</br>
HLgof.test(fit = fitted(fit), obs = obs, X = model.matrix(obs ~ x1+x2))</br>
</code> <br/>
<b>Package</b></br>
MKmisc</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(HLgof.test, package="MKmisc")
                `}
    }
}









class hosmerLemeshow extends baseModal {
    constructor() {
        var config = {
            id: "hosmerLemeshow",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "two",
            RCode: `
require(MKmisc)
results <-ModelMatchesDataset('{{selected.modelselector1 | safe}}', '{{dataset.name}}', NAinVarsCheck=FALSE ) 
if ( results$success ==TRUE)
{
if ( "train" %in% class({{selected.modelselector1 | safe}}) )
{
    BSkyHLStatistic <- MKmisc::HLgof.test(fit = fitted({{selected.modelselector1 | safe}}$finalModel), ngr = {{selected.bins | safe}}, obs = {{selected.destination | safe}})
    BSkyFormat(BSkyHLStatistic$C, outputTableIndex = c(tableone=1))
    BSkyFormat(BSkyHLStatistic$H, outputTableIndex = c(tableone=1))
} else
{
    BSkyHLStatistic <- MKmisc::HLgof.test(fit = fitted({{selected.modelselector1 | safe}}), ngr = {{selected.bins | safe}}, obs = {{selected.destination | safe}})
    BSkyFormat(BSkyHLStatistic$C, outputTableIndex = c(tableone=1))
    BSkyFormat(BSkyHLStatistic$H, outputTableIndex = c(tableone=1))
}
}
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
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
            content_var: { el: new srcVariableList(config) },
            destination: {
                el: new dstVariable(config, {
                    label: localization.en.destination,
                    no: "destination",
                    filter: "Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "Prefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            bins: {
                el: new inputSpinner(config, {
                  no: 'bins',
                  label: localization.en.bins,
                  min: 2,
                  max: 999999999,
                  step: 1,
                  value: 10,
                  extraction: "NoPrefix|UseComma"
                })
              },
        }
        const content = {
            head: [objects.label1.el.content, objects.modelselector1.el.content],
            left: [objects.content_var.el.content],
            right: [objects.destination.el.content, objects.bins.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-hl",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new hosmerLemeshow().render()