/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Likelihood Ratios and Plot Betas",
        navigation: "Likelihood Ratios and Plot Betas",
        label1: "Select a model (models of class Rm, dRm and eRm are supported)",
        label1b : "If no models are available, you need to create a model first by selecting Model Fitting -> IRT -> Simple Rasch Model and choose CML estimation",
        modelselector1: "Select a model",        
        spcr: "Splitting criteria",
        destination: "Select variables to plot betas for",
        help: {
            title: "Likelihood Ratios and Plot Betas",
            r_help: "help(LRtest, package='eRm')",
            body: `
                <b>Description</b></br>
                This LR-test is based on subject subgroup splitting.
<br/>
<b>Usage</b>
<br/>
<code> 
## S3 method for class 'Rm'
<br/>
LRtest(object, splitcr = "median", se = TRUE)
<br/>
## S3 method for class 'LR'
<br/>
plotGOF(x, beta.subset = "all", main = "Graphical Model Check", xlab, ylab,
    tlab = "item", xlim, ylim, type = "p", pos = 4, conf = NULL, ctrline = NULL, 
    smooline = NULL, asp = 1, x_axis = TRUE, y_axis = TRUE, set_par = TRUE, 
    reset_par = TRUE, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
object: Object of class "Rm".
</li>
<li>
splitcr: Split criterion for subject raw score splitting. "all.r" corresponds to a full raw score split, "median" uses the median as split criterion, "mean" performs a mean split. Optionally splitcr can also be a vector which assigns each person to a certain subgroup (e.g., following an external criterion). This vector can be numeric, character or a factor.
</li>
<li>
se: controls computation of standard errors in the submodels (default: TRUE)
</li>
<li>
x: Object of class "LR". Also used for visualizing the fit of single items.
</li>
<li>
beta.subset: If "all", all items are plotted. Otherwise numeric subset vector can be specified.
</li>
<li>
tlab: Specification of item labels: "item" prints the item names, "number" gives integers corresponding to order of the beta parameters, if "none" no labels are printed. "identify" allows for an interactive labelling. Initially no labels are printed, after clicking close to an item point the corresponding label is added. The identification process is terminated by clicking the second button and selecting 'Stop' from the menu, or from the 'Stop' menu on the graphics window. For more information and basic operation see identify.
</li>
<li>
conf: for plotting confidence ellipses for the item parameters. If conf = NULL (the default) no ellipses are drawn. Otherwise, conf must be specified as a list with optional elements: gamma, is the confidence level (numeric), col and lty, color and linetype (see par), which (numeric index vector) specifying for which items ellipses are drawn (must be a subset of beta.subset), and ia, logical, if the ellipses are to be drawn interactively (cf., tlab = "identify" above). For details about the default behavior, if conf is specified as a an empty list, see Details and Examples below. To use conf, the LR object x has to be generated using the option se = TRUE in LRtest(). See help(MLoef) for more details.
</li>
</ul>
<b>Details</b></br>
If the data set contains missing values and mean or median is specified as split criterion, means or medians are calculated for each missing value subgroup and consequently used for raw score splitting.
<br/>
When using interactive selection for both labelling of single points (tlab = "identify" and drawing confidence ellipses at certain points (ia = TRUE) then first all plotted points are labelled and afterwards all ellipses are generated. Both identification processes can be terminated by clicking the second (right) mouse button and selecting ‘Stop’ from the menu, or from the ‘Stop’ menu on the graphics window.
<br/>
Using the specification which in allows for selectively drawing ellipses for certain items only, e.g., which = 1:3 draws ellipses for items 1 to 3 (as long as they are included in beta.subset). The default is drawing ellipses for all items. The element col in the conf list can either be a single color specification such as "blue" or a vector with color specifications for all items. The length must be the same as the number of ellipses to be drawn. For color specification a palette can be set up using standard palettes (e.g., rainbow) or palettes from the colorspace or RColorBrewer package. An example is given below.
<br/>
summary and print methods are available for objects of class LR.
<br/><br/>
<b>Value</b><br/>
LRtest returns an object of class LR containing:
<br/><br/>
LR: LR-value.
<br/>
df: Degrees of freedom of the test statistic.
<br/>
Chisq: Chi-square value with corresponding df.
<br/>
<br/>
<b>Package</b></br>
eRm
<br/><br/>
<b>Help</b>
help(LRtest, package='eRm')

                `}
    }
}

class likelihoodRatiosPlotBetas extends baseModal {
    constructor() {
        var config = {
            id: "likelihoodRatiosPlotBetas",
            label: localization.en.title,
            splitProcessing:false,
            modalType: "two",
            RCode: `
require(eRm)

local({
    vars=NULL
    #Running the liklihood ratio test
    lrTestRes <- LRtest(object={{selected.modelselector1 | safe}}, splitcr = "{{selected.spcr | safe}}", se=TRUE)
    
    #Displaying results of the Anderson liklihood ratio test
    dispLrTestRes<-matrix( data =c(lrTestRes$LR, lrTestRes$df, lrTestRes$pvalue), nrow =3, ncol=1, dimnames = list(c("LR-value:", "Chi-square df:" , "p-value:"),c("Values") ))
    BSkyFormat(dispLrTestRes,singleTableOutputHeader ="Andersen LR-test:" )
    
    #Get the variables to plot betas for
    vars =c({{selected.destination | safe}})
    if (!is.null(vars))
    {
    #Getting the indexes of the variables selected
    indexOfVariables <-  UAgetIndexsOfColsInDataSet( dataSetNameOrIndex= "{{dataset.name}}", colNames =vars)
    
    #Plotting betas
    plotGOF(lrTestRes,  tlab = "item",beta.subset=indexOfVariables, conf = list(ia = FALSE, col = "blue", lty = "dotted"))
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

            spcr: {
                el: new selectVar(config, {
                    no: 'spcr',
                    label: localization.en.spcr,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["median", "mean", "all.r"],
                    default: "median"
                })
            },

            content_var: { el: new srcVariableList(config) },
            destination: {
                el: new dstVariableList(config, {
                    label: localization.en.destination,
                    no: "destination",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
        }
        const content = {
            head: [objects.label1.el.content, objects.label1b.el.content, 
                objects.modelselector1.el.content, objects.spcr.el.content],
            left: [objects.content_var.el.content],
            right: [objects.destination.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-beta_p",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new likelihoodRatiosPlotBetas().render()