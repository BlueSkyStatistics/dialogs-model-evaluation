/**
  * This file is protected by copyright (c) 2023-2026 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
  *
  * EmmeansPredictionPlot.js
  *
  * PURPOSE
  * -------
  * Produces estimated marginal means (emmeans) predictions from a fitted
  * regression model (e.g. lm, glm) and plots them with ggplot2.
  *   - Select a fitted model from the R environment.
  *   - Drag up to 5 numeric variables from the active dataset into the
  *     "Numeric variables" boxes. Each box has a free-text field below it
  *     where the user can type a custom emmeans 'at' specification
  *     (e.g. seq(1, 5, by = 1) or type individual points as 10, 12, 25). If left blank, a sequence
  *     of about 10 evenly spaced points spanning min..max is generated
  *     automatically.
  *   - Do not select a variables from the left selection that is in the model to be held constant (i.e., at their mean value)
  *   - Drag one categorical (grouping) variable into the "Grouping
  *     variable" box. This becomes the color/fill grouping in the plot.
  *     Optional checkbox to show/hide EMM table.
  *   - Confidence level (default 0.95).
  *   - Optional checkbox to show/hide the confidence ribbon.
  *   - Optional overrides for plot title, x-axis label, and y-axis label.
  */


var localization = {
    en: {
        title:      "Estimated Marginal Means (emmeans) Prediction Plot",
        navigation: "Emmeans Prediction Plot",

        labelModelSel:  "Select the fitted model",
        modelSelection: "Select model",

        labelNumericVars: "Numeric variables (drag up to 5; leave a box empty to ignore it)",
        numVar1: "Numeric variable 1",
        numVar2: "Numeric variable 2",
        numVar3: "Numeric variable 3",
        numVar4: "Numeric variable 4",
        numVar5: "Numeric variable 5",

        atSpecLabel: "Optional: type values / sequence for this variable, e.g. seq(1, 5, by = 1) or type individual points as 10, 12, 25 " +
                     "Leave blank to auto-generate about 10 evenly spaced points from min to max.",

        labelGroupVar:  "Grouping (categorical) variables",
        groupVar:       "Grouping variable(s)",
		
		showModelEquationChk: "Show model equation",
		showEMMTableChk: "Show Estimated Marginal Means (EMM) table",

        labelOptions:   "Plot options",
        confLevel:      "Confidence level",
        showCI:         "Show confidence band (ribbon)",

        plotTitle:      "Plot title (leave blank for default)",
        xAxisLabel:     "X-axis label (leave blank for default)",
        yAxisLabel:     "Y-axis label (leave blank for default)",

        help: {
            title: "Estimated Marginal Means (emmeans) Prediction Plot",
            body: `
                <b>Description</b><br/><br/>
                Computes estimated marginal means (predicted values) from a
                fitted regression model using the <code>emmeans</code> package,
                and visualizes the predictions with <code>ggplot2</code>.<br/><br/>

                <b>How to use</b>
                <ol>
                  <li>Select a previously fitted model (e.g. from Linear Regression).</li>
                  <li>Drag up to 5 numeric variables into the "Numeric variables" boxes.
                      Empty boxes are ignored.</li>
                  <li>For each numeric variable, you may optionally type a custom
                      set of values or an R <code>seq()</code> expression in the
                      text field below its box (e.g. <code>seq(22, 42, by = 1)</code>
                      or <code>1, 2, 3</code>). If left blank, about 10 evenly
                      spaced values spanning the variable's observed min/max are
                      generated automatically.</li>
                  <li>Drag one or more categorical variables into the "Grouping
                      variable(s)" box. The first grouping variable is used to
                      color/fill the plotted lines and ribbons. If a second
                      grouping variable is supplied, the plot is additionally
                      faceted by that variable (and a third, if supplied, facets
                      the other direction). Any further grouping variables are
                      combined into the facet grid.</li>
                  <li>Set the confidence level (default 0.95).</li>
                  <li>Optionally check "Show confidence band" to add a ribbon for
                      the confidence interval.</li>
                  <li>Optionally override the plot title and axis labels.</li>
                </ol>

                <b>Notes</b><br/>
                The first numeric variable supplied becomes the x-axis of the plot.
                Any additional numeric variables (2-5) are included in the
                <code>emmeans</code> grid and averaged over (or held at their
                specified/auto-generated values) but are not separately plotted.<br/><br/>

                All numeric and grouping variables selected must be variables
                that appear in the fitted model's formula. If any selected
                variable is not part of the model, an error is raised and the
                list of valid model variables is printed.
            `
        }
    }
};


class EmmeansPredictionPlot extends baseModal {
    constructor() {
        var config = {
            id: "EmmeansPredictionPlot",
            label: localization.en.title,
            modalType: "two",
            splitProcessing: false,
            pre_start_r: JSON.stringify({
                modelSelection: "BSkyGetAvailableModels(objclasslist=c('lm', 'glm', 'rsm', 'lmerMod','glmerMod'))",
            }),

            // ------------------------------------------------------------------
            // R CODE
            // ------------------------------------------------------------------
            RCode: `
library(emmeans)
library(ggplot2)

# -"-"- 0. User selections -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
bsky_model_name = "{{selected.modelSelection | safe}}"

bsky_num_vars = c(
  "{{selected.numVar1 | safe}}",
  "{{selected.numVar2 | safe}}",
  "{{selected.numVar3 | safe}}",
  "{{selected.numVar4 | safe}}",
  "{{selected.numVar5 | safe}}"
)
bsky_num_specs = c(
  "{{selected.atSpec1 | safe}}",
  "{{selected.atSpec2 | safe}}",
  "{{selected.atSpec3 | safe}}",
  "{{selected.atSpec4 | safe}}",
  "{{selected.atSpec5 | safe}}"
)

bsky_group_vars = "{{selected.groupVar | safe}}"

bsky_conf_level = as.numeric("{{selected.confLevel | safe}}")
bsky_show_ci    = as.logical("{{selected.showCI | safe}}")

bsky_plot_title = "{{selected.plotTitle | safe}}"
bsky_xlab       = "{{selected.xAxisLabel | safe}}"
bsky_ylab       = "{{selected.yAxisLabel | safe}}"

bsky_data = {{dataset.name}}

# -"-"- 1. Retrieve the fitted model -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
if (!exists(bsky_model_name)) {
  stop(paste0("ERROR: Model '", bsky_model_name, "' not found. ",
              "Please fit a model first (e.g. using Linear Regression)."))
}
bsky_fit = get(bsky_model_name)

{{if (options.selected.showModelEquationChk === "TRUE")}}
	BSkyFormat("Model Equation with Coefficients")
	
	#Display theoretical model
	bsky_fit %>%
		equatiomatic::extract_eq(raw_tex = FALSE,
			wrap = TRUE, intercept = "alpha", ital_vars = FALSE) %>%
			BSkyFormat()       

	#Display coefficients
	bsky_fit %>%
		equatiomatic::extract_eq(use_coefs = TRUE,
		wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting()) %>%
		   BSkyFormat()
{{/if}}

# -"-"- 2. Clean up numeric variable selections -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
bsky_num_vars  = trimws(bsky_num_vars)
bsky_num_specs = trimws(bsky_num_specs)

bsky_keep   = nchar(bsky_num_vars) > 0
bsky_num_vars  = bsky_num_vars[bsky_keep]
bsky_num_specs = bsky_num_specs[bsky_keep]

if (length(bsky_num_vars) == 0) {
  stop("ERROR: Please select at least one numeric variable (Numeric variable 1).")
}

bsky_group_vars = trimws(bsky_group_vars)
if (nchar(bsky_group_vars) == 0) {
  stop("ERROR: Please select at least one grouping (categorical) variable.")
}
# dstVariableList returns a comma-separated list of selected variables
bsky_group_vars = trimws(strsplit(bsky_group_vars, ",")[[1]])
bsky_group_vars = bsky_group_vars[nchar(bsky_group_vars) > 0]

if (length(bsky_group_vars) == 0) {
  stop("ERROR: Please select at least one grouping (categorical) variable.")
}

# -"-"- 2b. Validate that all selected variables belong to the fitted model -"-"-"-"-"-"-"-"-"-"-"-"-"-"-
bsky_model_vars = all.vars(formula(bsky_fit))

bsky_selected_vars = c(bsky_num_vars, bsky_group_vars)
bsky_invalid_vars  = setdiff(bsky_selected_vars, bsky_model_vars)

if (length(bsky_invalid_vars) > 0) {
  stop(paste0(
    "ERROR: The following selected variable(s) are not part of the fitted model '",
    bsky_model_name, "': ", paste(bsky_invalid_vars, collapse = ", "), ".\n",
    "Variables in the model '", bsky_model_name, "' are: ",
    paste(bsky_model_vars, collapse = ", ")
  ))
}

# -"-"- 3. Build the 'at' list for emmeans -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
# For each numeric variable: if the user supplied a spec, parse/evaluate it.
# Otherwise, auto-generate ~10 evenly spaced points spanning min..max.
bsky_at_list = list()

for (i in seq_along(bsky_num_vars)) {
  bsky_v    = bsky_num_vars[i]
  bsky_spec = bsky_num_specs[i]

  if (!(bsky_v %in% names(bsky_data))) {
    stop(paste0("ERROR: Variable '", bsky_v, "' not found in the active dataset."))
  }

  #if (nchar(bsky_spec) > 0) {
    # User provided a spec - could be "seq(...)" or comma-separated values
   # bsky_vals = tryCatch(
   #   eval(parse(text = bsky_spec)),
   
  if (nchar(bsky_spec) > 0) {
    # User provided a spec - could be "seq(...)" or comma-separated values like "22, 42, 1"
    bsky_eval_text = bsky_spec
    if (!grepl("^[A-Za-z_.][A-Za-z0-9_.]*\\\\s*\\\\(", bsky_eval_text)) {
      bsky_eval_text = paste0("c(", bsky_eval_text, ")")
    }
    bsky_vals = tryCatch(
      eval(parse(text = bsky_eval_text)),
      error = function(e) {
        stop(paste0("ERROR: Could not parse the values entered for '", bsky_v,
                    "': ", bsky_spec, " (", conditionMessage(e), ")"))
      }
    )
  } else {
    # Auto-generate ~10 evenly spaced points from min to max
    bsky_rng = range(bsky_data[[bsky_v]], na.rm = TRUE)
    bsky_min = bsky_rng[1]
    bsky_max = bsky_rng[2]

    if (bsky_min == bsky_max) {
      bsky_vals = bsky_min
    } else {
      bsky_step = (bsky_max - bsky_min) / 9
      bsky_vals = seq(bsky_min, bsky_max, by = bsky_step)
    }
  }

  bsky_at_list[[bsky_v]] = bsky_vals
}

# -"-"- 4. Add the grouping variable levels to the 'at' list -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
for (bsky_gv in bsky_group_vars) {
  if (!(bsky_gv %in% names(bsky_data))) {
    stop(paste0("ERROR: Grouping variable '", bsky_gv, "' not found in the active dataset."))
  }

  bsky_gv_levels = bsky_data[[bsky_gv]]
  if (is.factor(bsky_gv_levels)) {
    bsky_gv_levels = levels(bsky_gv_levels)
  } else {
    bsky_gv_levels = sort(unique(as.character(bsky_gv_levels)))
  }
  bsky_at_list[[bsky_gv]] = bsky_gv_levels
}

# -"-"- 5. Run emmeans -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
bsky_specs = c(bsky_num_vars, bsky_group_vars)

bsky_emm = emmeans(
  bsky_fit,
  specs = bsky_specs,
  at    = bsky_at_list,
  level = bsky_conf_level
)

bsky_emm_df = as.data.frame(bsky_emm)



# -"-"- 6. Build the ggplot -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
bsky_x_var      = bsky_num_vars[1]
bsky_color_var  = bsky_group_vars[1]
bsky_facet_vars = if (length(bsky_group_vars) > 1) bsky_group_vars[-1] else character(0)

bsky_default_title = paste0("Predicted ", all.vars(formula(bsky_fit))[1],
                             " by ", bsky_x_var, " and ",
                             paste(bsky_group_vars, collapse = ", "))
bsky_default_xlab  = bsky_x_var
bsky_default_ylab  = paste0("Predicted ", all.vars(formula(bsky_fit))[1])

bsky_title = if (nchar(trimws(bsky_plot_title)) > 0) bsky_plot_title else bsky_default_title
bsky_xlab2 = if (nchar(trimws(bsky_xlab)) > 0) bsky_xlab else bsky_default_xlab
bsky_ylab2 = if (nchar(trimws(bsky_ylab)) > 0) bsky_ylab else bsky_default_ylab

bsky_p = ggplot(bsky_emm_df, aes(x = .data[[bsky_x_var]], y = emmean,
                                  color = .data[[bsky_color_var]],
                                  fill  = .data[[bsky_color_var]]))

if (bsky_show_ci) {
  bsky_p = bsky_p +
    geom_ribbon(aes(ymin = lower.CL, ymax = upper.CL), alpha = 0.15, color = NA)
}

bsky_p = bsky_p +
  geom_line(linewidth = 1.2) +
  geom_point(size = 1, shape = 21, fill = "white", stroke = 1.5) +
  labs(
    title = bsky_title,
    x     = bsky_xlab2,
    y     = bsky_ylab2,
    color = bsky_color_var,
    fill  = bsky_color_var
  ) 
  
 bsky_p = bsky_p +  {{selected.BSkyThemes | safe}} +
  theme(
    plot.title      = element_text(hjust = 0.5, face = "bold"),
    legend.position = "right"
  )

# Additional grouping variables (beyond the first) -> facet grid
if (length(bsky_facet_vars) == 1) {
  bsky_p = bsky_p + facet_wrap(vars(.data[[bsky_facet_vars[1]]]))
} else if (length(bsky_facet_vars) == 2) {
  bsky_p = bsky_p + facet_grid(rows = vars(.data[[bsky_facet_vars[1]]]),
                                cols = vars(.data[[bsky_facet_vars[2]]]))
} else if (length(bsky_facet_vars) > 2) {
  # Combine any extra grouping variables (3rd+) into a single facet column
  bsky_emm_df$bsky_facet_extra = interaction(
    bsky_emm_df[, bsky_facet_vars[-1], drop = FALSE], sep = " | "
  )
  bsky_p = bsky_p + facet_grid(rows = vars(.data[[bsky_facet_vars[1]]]),
                                cols = vars(bsky_facet_extra))
}

print(bsky_p)

if (exists("bsky_fit")) rm("bsky_fit")

{{if(options.selected.showEMMTableChk === 'TRUE')}}
BSkyFormat(as.data.frame(unclass(bsky_emm_df)), outputTableRenames = "Estimated Marginal Means")
{{/if}}	
`
        }; // end config

        // ------------------------------------------------------------------
        // UI OBJECTS
        // ------------------------------------------------------------------
        var objects = {

            // Left panel - source variable list from active dataset
            content_var: {
                el: new srcVariableList(config, { action: "move", scroll: true })
            },

            // -"-"- Model selection -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
            labelModelSel: {
                el: new labelVar(config, {
                    label: localization.en.labelModelSel,
                    h: 5,
                    style: "mt-1 mb-1",
                })
            },
            modelSelection: {
                el: new selectVar(config, {
                    no: "modelSelection",
                    label: localization.en.modelSelection,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: "",
                    required: true,
                    style: "mb-3",
                })
            },

            // -"-"- Numeric variables -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
            labelNumericVars: {
                el: new labelVar(config, {
                    label: localization.en.labelNumericVars,
                    h: 5,
                    style: "mb-1",
                })
            },

            numVar1: {
                el: new dstVariable(config, {
                    label: localization.en.numVar1,
                    no: "numVar1",
                    required: true,
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix",
                   // style: "mb-1",
                }), r: ['{{ var | safe}}']
            },
            atSpec1: {
                el: new input(config, {
                    no: "atSpec1",
                    label: localization.en.atSpecLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "e.g. seq(22, 42, by = 1)  (leave blank to auto-generate)",
                    extraction: "TextAsIs",
                    style: "ml-5",
                })
            },

            numVar2: {
                el: new dstVariable(config, {
                    label: localization.en.numVar2,
                    no: "numVar2",
                    required: false,
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix",
                    //style: "mb-1",
                }), r: ['{{ var | safe}}']
            },
            atSpec2: {
                el: new input(config, {
                    no: "atSpec2",
                    label: localization.en.atSpecLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "e.g. seq(20, 40, by = 5)  (leave blank to auto-generate)",
                    extraction: "TextAsIs",
					style: "ml-5",
                })
            },

            numVar3: {
                el: new dstVariable(config, {
                    label: localization.en.numVar3,
                    no: "numVar3",
                    required: false,
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix",
                    //style: "mb-1",
                }), r: ['{{ var | safe}}']
            },
            atSpec3: {
                el: new input(config, {
                    no: "atSpec3",
                    label: localization.en.atSpecLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "e.g. 1, 2, 3  (leave blank to auto-generate)",
                    extraction: "TextAsIs",
                    style: "ml-5",
                })
            },

            numVar4: {
                el: new dstVariable(config, {
                    label: localization.en.numVar4,
                    no: "numVar4",
                    required: false,
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix",
                    //style: "mb-1",
                }), r: ['{{ var | safe}}']
            },
            atSpec4: {
                el: new input(config, {
                    no: "atSpec4",
                    label: localization.en.atSpecLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "(leave blank to auto-generate)",
                    extraction: "TextAsIs",
                    style: "ml-5",
                })
            },

            numVar5: {
                el: new dstVariable(config, {
                    label: localization.en.numVar5,
                    no: "numVar5",
                    required: false,
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix",
                    //style: "mb-1",
                }), r: ['{{ var | safe}}']
            },
            atSpec5: {
                el: new input(config, {
                    no: "atSpec5",
                    label: localization.en.atSpecLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "(leave blank to auto-generate)",
                    extraction: "TextAsIs",
                   style: "ml-5",
                })
            },

            // -"-"- Grouping variable -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
            labelGroupVar: {
                el: new labelVar(config, {
                    label: localization.en.labelGroupVar,
                    h: 5,
                    style: "mt-2 mb-1",
                })
            },
            groupVar: {
                el: new dstVariableList(config, {
                    label: localization.en.groupVar,
                    no: "groupVar",
                    required: true,
                    filter: "String|Ordinal|Nominal|Factor",
                    extraction: "NoPrefix",
                    style: "mb-3",
                }), r: ['{{ var | safe}}']
            },
			showModelEquationChk: {
                el: new checkbox(config, {
                    label: localization.en.showModelEquationChk, 
					no: "showModelEquationChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
					//style: "ml-5",
					style: "mt-2",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state: "checked",
					newline: true,
                })
            },
			showEMMTableChk: {
                el: new checkbox(config, {
                    label: localization.en.showEMMTableChk,
					no: "showEMMTableChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//style: "mt-2",
					newline: true,
                })
            },

            // -"-"- Plot options -"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-"-
            labelOptions: {
                el: new labelVar(config, {
                    label: localization.en.labelOptions,
                    h: 5,
                    style: "mt-4 mb-1",
                })
            },
            confLevel: {
                el: new inputSpinner(config, {
                    no: "confLevel",
                    label: localization.en.confLevel,
                    min: 0.5,
                    max: 0.999,
                    step: 0.01,
                    value: 0.95,
                    extraction: "NoPrefix|UseComma",
                    style: "mb-2",
                })
            },
            showCI: {
                el: new checkbox(config, {
                    no: "showCI",
                    label: localization.en.showCI,
                    value: true,
                    extraction: "NoPrefix|UseComma",
                    style: "mb-3",
                })
            }, 

            plotTitle: {
                el: new input(config, {
                    no: "plotTitle",
                    label: localization.en.plotTitle,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    placeholder: "e.g. Predicted Length by Diameter and Batch",
                    extraction: "TextAsIs",
                    //style: "mt-3",
                })
            },
            xAxisLabel: {
                el: new input(config, {
                    no: "xAxisLabel",
                    label: localization.en.xAxisLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    extraction: "TextAsIs",
                    //style: "mb-2",
                })
            },
            yAxisLabel: {
                el: new input(config, {
                    no: "yAxisLabel",
                    label: localization.en.yAxisLabel,
                    required: false,
                    allow_spaces: true,
                    type: "character",
                    extraction: "TextAsIs",
                   // style: "mb-2",
                })
            },

        }; // end objects

        // ------------------------------------------------------------------
        // LAYOUT
        // ------------------------------------------------------------------
        const content = {
            left: [objects.content_var.el.content],
            right: [
                // Model
                objects.labelModelSel.el.content,
                objects.modelSelection.el.content,
				
				// Grouping variable
                objects.labelGroupVar.el.content,
                objects.groupVar.el.content,

                // Numeric variables (1-5), each with its 'at' spec field
                objects.labelNumericVars.el.content,
                objects.numVar1.el.content,
                objects.atSpec1.el.content,
                objects.numVar2.el.content,
                objects.atSpec2.el.content,
                objects.numVar3.el.content,
                objects.atSpec3.el.content,
                objects.numVar4.el.content,
                objects.atSpec4.el.content,
                objects.numVar5.el.content,
                objects.atSpec5.el.content, 
				
				objects.showModelEquationChk.el.content, 
				objects.showEMMTableChk.el.content, 

                // Plot options
                objects.labelOptions.el.content,
                objects.confLevel.el.content,
                objects.showCI.el.content,
                objects.plotTitle.el.content,
                objects.xAxisLabel.el.content,
                objects.yAxisLabel.el.content,
            ],
            nav: {
                name: localization.en.navigation,
                 icon: "icon-y-hat",
                onclick: `r_before_modal('${config.id}')`,
                modal_id: config.id,
            },
        };

        super(config, objects, content);
        this.help = localization.en.help;
    }
}

module.exports.item = new EmmeansPredictionPlot().render();
