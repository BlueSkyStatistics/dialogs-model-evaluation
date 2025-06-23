/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Plot Person-Item map",
        navigation: "Plot Person-Item map",
        label1: "Select a model (models of class Rm and dRm supported)",
        label1b : "If no models are available, you need to create a model first by selecting Model Fitting -> IRT",
        modelselector1: "Select a model",
        range1: "Range for the X axis",
        help: {
            title: "Plot Person-Item map",
            r_help: "help(plotPImap, package='eRm')",
            body: `
                <b>Description</b></br>
                A person-item map displays the location of item (and threshold) parameters as well as the distribution of person parameters.along the latent dimension. Person-item maps are useful to compare the range and position of the item measure distribution (lower panel) to the range and position of the person measure distribution (upper panel). Items should ideally be located along the whole scale to meaningfully measure the ‘ability’ of all persons.

                <br/><br/>
                <b>Usage</b>
                <br/>
                <code>
                plotPImap(object, item.subset = "all", sorted = FALSE,
                main = "Person-Item Map", latdim = "Latent Dimension",
                pplabel = "Person\nParameter\nDistribution", cex.gen = 0.7,
                xrange = NULL, warn.ord = TRUE, warn.ord.colour = "black",
                irug = TRUE, pp = NULL)
                </code>
                <br/><br/>
                <b>Arguments</b>
                <br/>  
                object: Object of class Rm or dRm
                <br/>
                item.subset: Subset of items to be plotted. Either a numeric vector indicating the column in X or a character vector indicating the column name. If "all", all items are plotted. The number of items to be plotted must be > 1.
                <br/>
                sorted: If TRUE, the items are sorted in increasing order according to their location on the latent dimension.   
                <br/>
                main: Main title of the plot.
                <br/>
                latdim: Label of the x-axis, i.e., the latent dimension.
                <br/>
                pplabel: Title for the upper panel displaying the person parameter distribution
                <br/>
                cex.gen: cex as a graphical parameter specifies a numerical value giving the amount by which plotting text and symbols should be magnified relative to the default. Here cex.gen applies to all text labels. The default is 0.7.
                <br/>
                xrange: Range for the x-axis
                <br/>
                warn.ord: If TRUE (the default) asterisks are displayed in the right margin of the lower panel to indicate nonordinal threshold locations for polytomous items.
                <br/>
                warn.ord.colour: Nonordinal threshold locations for polytomous items are coloured with this colour to make them more visible. This is especially useful when there are many items so that the plot is quite dense. The default is "black", so that there is no distinction made.
                <br/>   
                irug: If TRUE (the default), all thresholds are plotted below the person distribution to indicate where the included items are most informative.                
                <br/>
                pp: If non-NULL, this contains the person.parameter data of the data object, avoiding the need to recalculate it.
                <br/><br/>

                <b>Packages</b>
                <br/>
                eRm
                <br/><br/>
                <b>Help</b>
                <br/>
                help(plotPImap, package='eRm')
                `}
    }
}

class plotPImap extends baseModal {
    constructor() {
        var config = {
            id: "plotPImap",
            label: localization.en.title,
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
            range1: {
                el: new input(config, {
                  no: 'range1',
                  label: localization.en.range1,
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
                name: localization.en.navigation,
                icon: "icon-pi",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new plotPImap().render()