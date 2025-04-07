/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "ICC Plots",
        navigation: "ICC Plots",
        label1: "Select a model (models of class Rm, dRm, tam.mml, tam.mml.2pl, tam.mml.mfr supported)",
        label1b : "If no models are available, you need to create a model first by selecting  Model Fitting -> IRT",
        modelselector1: "Select a model",
        label2a: "For models created using CML estimation",
        label2b: "(Applicable for models of class Rm and dRm)",
        lblrange : "Optionally specify range for the X axis ",
        range1 :"Range in format value1, value2 e.g. -1, 6 e.g.",
        label3a: "For models created using MML estimation",
        label3b: "(Applicable for models of class Rm and dRm)",
        lblthetarange : "Optionally specify a range of theta values to be displayed",
        tb1 : "Lower bound, e.g. -1",
        tb2 : "Upper bound, e.g. 8",
        help: {
            title: "ICC Plots",
            r_help: "help(plotICC, package='eRm')",
            body: `
                <b>Description</b></br>
                Plot functions for visualizing the item characteristic curves
                <br/>
                Invokes plotICC for models created with CML estimation (objects of class Rm)
                <br/>
                Invokes plot.tam for models created with  MML estimation (objects of class tam.mml, tam.mml.2pl,tam.mml.mfr)
                <br/><br/>
                <b>Usage for plotICC</b>
                <br/>
                <code>
                <br/>
                ## S3 method for class 'Rm'
                <br/>
                plotICC(object, item.subset = "all", empICC = NULL, empCI = NULL,
                   mplot = NULL, xlim = c(-4, 4), ylim = c(0, 1),
                   xlab = "Latent Dimension", ylab = "Probability to Solve", main=NULL,
                   col = NULL, lty = 1, legpos = "left", ask = TRUE, ...)
                </code>
                <br/><br/>
                <b>Arguments</b>
                <br/>
                <ul>
                    <li>
                    object: object of class Rm or dRm
                    </li>

                    <li>
                    item.subset: Subset of items to be plotted. Either a numeric vector indicating the column in X or a character vector indiciating the column name. If "all" (default), all items are plotted.
                    </li>

                    <li>
                    empICC: Plotting the empirical ICCs for objects of class dRm. If empICC=NULL (the default) the empirical ICC is not drawn. Otherwise, empICC must be specified as a list where the first element must be one of "raw", "loess", "tukey", "kernel". The other optional elements are smooth (numeric), type (line type for empirical ICCs, useful values are "p" (default), "l", and "b", see graphics parameter type in plot.default), pch, col, and lty, plotting ‘character’, colour and linetype
                    </li>

                    <li>
                    empCI: Plotting confidence intervals for the the empirical ICCs. If empCI=NULL (the default) no confidence intervals are drawn. Otherwise, by specifying empCI as a list gives ‘exact’ confidence intervals for each point of the empirical ICC. The optional elements of this list are gamma, the confidence level, col, colour, and lty, line type. If empCI is specified as an empty list, the default values empCI=list(gamma=0.95,col="red",lty="dotted") will be used.
                    </li>

                    <li>
                    mplot: if NULL the default setting is in effect. For models of class dRm this is mplot = TRUE, i.e., the ICCs for up to 4 items are plotted in one figure. For Rm models the default is FALSE (each item in one figure) but may be set to TRUE. 
                    </li>

                    <li>
                    xlab: Label of the x-axis.
                    </li>

                    <li>
                    ylab: Label of the y-axis.
                    </li>

                    <li>
                    xlim: Range of person parameters.
                    </li>

                    <li>
                    ylim: Range for probability to solve.
                    </li>

                    <li>
                    legend: If TRUE, legend is provided, otherwise the ICCs are labeled.
                    </li>

                    <li>
                    col: If not specified or NULL, line colors are determined automatically. Otherwise, a scalar or vector with appropriate color specifications may be supplied
                    </li>

                    <li>
                    lty: Line type.
                    </li>

                    <li>
                    main: Title of the plot.
                    </li>

                    <li>
                    legpos: Position of the legend with possible values "bottomright", "bottom", "bottomleft", "left", "topleft", "top", "topright", "right" and "center". If FALSE no legend is displayed.
                    </li>

                    <li>
                    ask: If TRUE (the default) and the R session is interactive the user is asked for input, before a new figure is drawn. FALSE is only useful if automated figure export is in effect, e.g., when using Sweave.
                    </li>

                    <li>
                    ...: Additional plot parameters.
                    </li>
                </ul>
                <br/><br/>
                <b>Details for plotICC</b>
                <br/>
                Empirical ICCs for objects of class dRm can be plotted using the option empICC, a list where the first element specifies the type of calculation of the empirical values. If empICC=list("raw", other specifications) relative frequencies of the positive responses are calculated for each rawscore group and plotted at the position of the corresponding person parameter. The other options use the default versions of various smoothers: "tukey" (see smooth), "loess" (see loess), and "kernel" (see ksmooth). For "loess" and "kernel" a further element, smooth, may be specified to control the span (default is 0.75) or the bandwith (default is 0.5), respectively. For example, the specification could be empirical = list("loess", smooth=0.9) or empirical = list("kernel",smooth=2). Higher values result in smoother estimates of the empirical ICCs.
                The optional confidence intervals are obtained by a procedure first given in Clopper and Pearson (1934) based on the beta distribution (see binom.test).
                <br/><br/>
                <b>Packages</b>
                <br/>
                eRm

                <br/><br/>
                <b>Usage for plot.tam</b>
                <br/>  
                <code>         
                ## S3 method for class 'tam' and tam.mml
                <br/>
                plot(x, items=1:x$nitems, type="expected", low=-3, high=3, 
                                   export=TRUE,  observed=TRUE, 
                                   package="lattice" ...)           
                </code>        
                <br/><br/>
                <b>Details for plot.tam</b>
                <br/>   
                <ul>   
                <li>
                x: object of class tam or tam.mml
                </li>
                <li>
                items: An index vector giving the items to be visualized.
                </li>
                <li>
                type: Plot type. type="expected" plot the expected item response curves while type="items" plots the response curves of all item categories.
                </li>
                <li>               
                low: Lowest θ value to be displayed
                </li>
                <li>                
                High: Highest θ value to be displayed
                </li>
                <li>                
                package: Used R package for plot. Can be "lattice" or "graphics".
                </li>
                <li>                
                observed: A logical which indicates whether observed response curve should be displayed
                </li>
                <li>                
                export: A logical which indicates whether all graphics should be separately exported in files of type export.type in a subdirectory 'Plots' of the working directory.                                             
                </li>
                </ul>
                <br/><br/>
                <b>Packages</b>
                <br/>
                TAM
                <br/><br/>
                <b>Help</b>
                <br/>
                help(plotICC, package='eRm')
                `}
    }
}

class iCCPlots extends baseModal {
    constructor() {
        var config = {
            id: "iCCPlots",
            label: localization.en.title,
            modalType: "one",
            RCode: `
require(eRm);
require(TAM);

classOfModel  =class({{selected.modelselector1 | safe}})
if (classOfModel =="Rm" || classOfModel =="dRm")
{
    eRm::plotICC({{selected.modelselector1 | safe}}, item.subset = "all", empICC=list("raw",type="b",col="blue",lty="dotted", empCI = NULL,
    mplot = NULL), {{selected.range1 | safe}} ylim = c(0, 1),
    xlab = "Latent Dimension", ylab = "Probability to Solve", main=NULL,
    col = NULL, lty = 1, legpos = "left", ask = FALSE)
} else if (classOfModel =="tam.mml" || classOfModel =="tam.mml.2pl"|| classOfModel =="tam.mml.2pl" || classOfModel =="tam.mml.mfr")
{
    plot({{selected.modelselector1 | safe}}, type="items",  export=FALSE, package="graphics", observed=TRUE {{selected.tb1 | safe}} {{selected.tb2 | safe}})
}   

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

            label2a: {
                el: new labelVar(config, {
                  label: localization.en.label2a, 
                  style: "mt-3", 
                  h:5
                })
              },
              label2b: {
                el: new labelVar(config, {
                  label: localization.en.label2b, 
                  style: "mt-1", 
                  h:6
                })
              },
              lblrange: {
                el: new labelVar(config, {
                  label: localization.en.lblrange, 
                  style: "mt-1", 
                  h:6
                })
              },                
              range1: {
                el: new input(config, {
                  no: 'range1',
                  label: localization.en.range1,
                  placeholder: "",
                  allow_spaces:true,
                  extraction: "TextAsIs",
                  type: "character",
                  ml: 4,
                  width:"w-25",
                  wrapped: 'xlim=c(%val%),'
                })
              },


              label3a: {
                el: new labelVar(config, {
                  label: localization.en.label3a, 
                  style: "mt-3", 
                  h:5
                })
              },
              label3b: {
                el: new labelVar(config, {
                  label: localization.en.label3b, 
                  style: "mt-1", 
                  h:6
                })
              },        
              lblthetarange: {
                el: new labelVar(config, {
                  label: localization.en.lblthetarange, 
                  style: "mt-1", 
                  h:6
                })
              },                    
              tb1: {
                el: new input(config, {
                  no: 'tb1',
                  label: localization.en.tb1,
                  placeholder: "",
                  extraction: "TextAsIs",
                  allow_spaces:true,
                  type: "numeric",
                  ml: 4,
                  width:"w-25",
                  wrapped: ', low=c(%val%)'
                })
              },

              tb2: {
                el: new input(config, {
                  no: 'tb2',
                  label: localization.en.tb2,
                  placeholder: "",
                  extraction: "TextAsIs",
                  allow_spaces:true,
                  type: "numeric",
                  ml: 4,
                  width:"w-25",
                  wrapped: ', high=c(%val%)'
                })
              }             


        }
        const content = {
            items: [objects.label1.el.content, objects.label1b.el.content, objects.modelselector1.el.content,
                objects.label2a.el.content, objects.label2b.el.content, 
                objects.lblrange.el.content, objects.range1.el.content,
                objects.label3a.el.content, objects.label3b.el.content, objects.lblthetarange.el.content,
                objects.tb1.el.content, objects.tb2.el.content,

            ],
            nav: {
                name: localization.en.navigation,
                icon: "icon-icc",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new iCCPlots().render()