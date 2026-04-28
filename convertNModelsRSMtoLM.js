/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class convertNModelsRSMtoLM extends baseModal {
    static dialogId = 'convertNModelsRSMtoLM'
    static t = baseModal.makeT(convertNModelsRSMtoLM.dialogId)

    constructor() {
        var config = {
            id: convertNModelsRSMtoLM.dialogId,
            label: convertNModelsRSMtoLM.t('title'),
            modalType: "one",
            splitProcessing: false,
            RCode: `  
require(rsm)

# Helper functions to identify and convert any RSM terms in a model to equivalent LM terms so downstream model evaluation functions can process the converted models

BSkyDetectRsmMacros<- function(model, model_name){
	 # ── 1. Detect RSM macros ──────────────────────────────────────────────────
    formula_str   <- deparse(formula(model), width.cutoff = 500L)
    RSM_MACROS    <- c("FO", "SO", "TWI", "PQ", "PE", "CS", "IS", "RS")
    macro_pattern <- paste0("\\\\b(", paste(RSM_MACROS, collapse = "|"), ")\\\\s*\\\\(")
    has_macros    <- grepl(macro_pattern, formula_str, perl = TRUE)

    if (!has_macros) {
        cat(paste(model_name, ":  No RSM terms detected. Keeping the original model unchanged"), "\\n")
        return(FALSE)
    } else {
		return(TRUE)
	}
}

BSkyRsmToLm <- function(model, model_name) {
    original_dataset_name <- deparse(model$call$data)

    # ── 1. Detect RSM macros ──────────────────────────────────────────────────
    formula_str   <- deparse(formula(model), width.cutoff = 500L)
    RSM_MACROS    <- c("FO", "SO", "TWI", "PQ", "PE", "CS", "IS", "RS")
    macro_pattern <- paste0("\\\\b(", paste(RSM_MACROS, collapse = "|"), ")\\\\s*\\\\(")
    has_macros    <- grepl(macro_pattern, formula_str, perl = TRUE)

    if (!has_macros) {
        cat(paste(model_name, ":  No RSM terms detected. Keeping the original model unchanged"), "\\n")
        return(model)
    }

    cat(paste(model_name, ":  RSM terms in the model formula detected"), "\\n")

    # ── 2. Expand any label — macro or plain — into individual lm terms ───────
    # Handles all cases:
    #   (a) RSM macro label  : "FO(x1,x2)"   → x1, x2
    #   (b) Plain main effect: "Block"        → Block       (pass through)
    #   (c) Quadratic        : "I(x1^2)"     → I(x1^2)    (pass through)
    #   (d) Interaction      : "x1:x2"       → x1:x2      (pass through)
    #   (e) Grouped by rsm   : may still be  "FO(x1, x2)" even in mixed formula
    expand_label <- function(lab) {
        # Identify the leading token before the first "(" if any
        macro <- sub("\\\\s*\\\\(.*", "", lab)

        if (macro %in% RSM_MACROS) {
            # ── RSM macro: extract vars with str2lang() ────────────────────────
            vars <- tryCatch(
                all.vars(str2lang(lab)),
                error = function(e) {
                    warning("Could not parse macro label: ", lab, " — skipping.")
                    character(0)
                }
            )
            if (length(vars) == 0) return(character(0))

            fo_terms  <- vars
            pq_terms  <- paste0("I(", vars, "^2)")
            twi_terms <- if (length(vars) >= 2) {
                pairs <- combn(vars, 2, simplify = FALSE)
                sapply(pairs, function(p) paste(p, collapse = ":"))
            } else character(0)

            switch(macro,
                FO  = fo_terms,
                PQ  = pq_terms,
                TWI = twi_terms,
                SO  = c(fo_terms, pq_terms, twi_terms),
                # PE, CS, IS, RS — expand as FO (main effects only) with a warning
                {
                    warning("Macro '", macro, "' expansion not fully defined — treating as FO (main effects only).")
                    fo_terms
                }
            )
        } else {
            # ── Plain lm term: pass through as-is ─────────────────────────────
            # Covers: bare names (Block, x1), I(x^2), x1:x2, x1:x2:x3
            lab
        }
    }

    # ── 3. Get term labels and expand ─────────────────────────────────────────
    # attr(terms(), "term.labels") on a fitted rsm object returns a mix of:
    #   - macro group strings  : "FO(Temp, Pressure, ...)", "PQ(...)", etc.
    #   - plain lm term strings: "Block", "I(Temp^2)", "Temp:Pressure", etc.
    # expand_label() handles both correctly.
    tlabs_raw <- attr(terms(model), "term.labels")
    tlabs     <- unique(unlist(lapply(tlabs_raw, expand_label)))

    if (length(tlabs) == 0) {
        stop("No terms could be extracted from the model after macro expansion.")
    }

    # ── 4. Build formula ──────────────────────────────────────────────────────
    resp_var    <- as.character(formula(model)[[2]])
    new_formula <- as.formula(paste(resp_var, "~", paste(tlabs, collapse = " + ")))

    cat(paste(model_name, ":  Original formula"), "\\n", formula_str, "\\n")
    cat(paste(model_name, ":  Converted formula"), "\\n", deparse(new_formula, width.cutoff = 500L), "\\n")

    # ── 5. Recover data with correct variable names ───────────────────────────
    model_data <- tryCatch(
        bsky_create_df_from_model_frame(model),
        error = function(e) stop("Could not extract model data: ", e$message)
    )

    # Verify all RHS terms can be resolved in the recovered data
    # Catches mismatches early with a clear message rather than a cryptic lm error
    rhs_vars <- unique(unlist(lapply(
        tlabs,
        function(t) tryCatch(all.vars(str2lang(t)), error = function(e) character(0))
    )))
    missing_vars <- setdiff(rhs_vars, names(model_data))
    if (length(missing_vars) > 0) {
        stop(
            "The following variables are in the converted formula but not in the ",
            "recovered data frame: ", paste(missing_vars, collapse = ", "), "\\n",
            "Check that the original dataset '", original_dataset_name,
            "' is available in .GlobalEnv."
        )
    }

    # ── 6. Refit via eval(call()) so $call stores the real dataset name ────────
    # Avoids the "object 'new_formula' not found" error that occurs when lm()
    # is called directly — it stores the symbol name, not the formula object.
    cl        <- call("lm",
                      formula   = new_formula,
                      data      = as.name(original_dataset_name),
                      na.action = quote(na.exclude))
    new_model <- eval(cl, envir = .GlobalEnv)
	
	# ── 7. Copy BlueSky metadata attributes from original model ───────────────
  # Copy any existing BlueSky attributes from the source RSM model first.
  # These may already be set if the RSM model was fitted through the BSky UI.
  BSKY_ATTRS <- c("classDepVar", "depVarSample", "indepVars",
                  "depVar", "datasetName", "classIndepVars")

  for (attr_name in BSKY_ATTRS) {
      attr_val <- attr(model, attr_name)
      if (!is.null(attr_val)) {
          attr(new_model, attr_name) <- attr_val
      }
  }
	
	# ── 8. Derive and set classDepVar from the actual dataset ─────────────────
  # BSkyPredict() requires attr(model, "classDepVar") to be the R class of
  # the response variable column in the dataset. For converted lm objects
  # built programmatically (not through the UI), this attribute is missing
  # or may have been inherited incorrectly from the RSM model.
  # We always recompute it from the live dataset to guarantee correctness.
  tryCatch({
      live_dataset <- get(original_dataset_name, envir = .GlobalEnv)
      
      # Response variable name (LHS of formula)
      dep_var_name <- as.character(formula(new_model)[[2]])
      
      # Independent variable names (RHS — all vars except the response)
      all_formula_vars <- all.vars(formula(new_model))
      indep_var_names  <- setdiff(all_formula_vars, dep_var_name)
      
      # classDepVar: R class of the response column in the dataset
      if (dep_var_name %in% names(live_dataset)) {
          attr(new_model, "classDepVar") <- class(live_dataset[[dep_var_name]])
      }
      
      # depVarSample: the actual response column values
      if (dep_var_name %in% names(live_dataset)) {
          attr(new_model, "depVarSample") <- live_dataset[[dep_var_name]]
      }
      
      # depVar: response variable name as a string
      attr(new_model, "depVar") <- dep_var_name
      
      # indepVars: independent variable names present in the dataset
      indep_vars_in_data <- intersect(indep_var_names, names(live_dataset))
      attr(new_model, "indepVars") <- indep_vars_in_data
      
      # classIndepVars: named vector of R classes for each independent variable
      if (length(indep_vars_in_data) > 0) {
          attr(new_model, "classIndepVars") <- sapply(
              live_dataset[, indep_vars_in_data, drop = FALSE],
              class
          )
      }
      
      # datasetName: the dataset name string
      #attr(new_model, "datasetName") <- original_dataset_name
	  new_model$call$data = as.name( original_dataset_name)

  }, error = function(e) {
      warning("BSkyRsmToLm: Could not derive BSky metadata attributes: ", e$message)
  })

    new_model
}

###################
# Main flow starts here
###################

bsky_selected_models      <- list({{selected.modelselector1 | safe}})
bsky_selected_models_name <- trimws(strsplit("{{selected.modelselector1 | safe}}", ",")[[1]])
bsky_output_mode          <- "{{selected.outputMode | safe}}"   # "override" or "new"
bsky_suffix               <- "{{selected.suffix | safe}}"       # e.g. "rsmTolm"

for (i in seq_along(bsky_selected_models)) {
	BSkyFormat(paste0(bsky_selected_models_name[i], ": Processing model conversion"))
	
    bsky_orig_name   <- bsky_selected_models_name[i]
	
	bsky_converted = NULL
	if(BSkyDetectRsmMacros(bsky_selected_models[[i]], bsky_orig_name)) {
			bsky_converted   <- BSkyRsmToLm(bsky_selected_models[[i]], bsky_orig_name)

			bsky_output_name <- if (bsky_output_mode == "override") {
				bsky_orig_name
			} else {
				paste0(bsky_orig_name, "_", bsky_suffix)
			}

			assign(bsky_output_name, bsky_converted, envir = .GlobalEnv)
			cat(paste0("  -> Saved as: ", bsky_output_name, "\\n"))
			
			#clean up
			if(!is.null(bsky_converted)) rm(bsky_converted)
	}
}
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"rsm\", \"glm\"), returnClassTrain=FALSE)",

            })
        }
        var objects = {
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: convertNModelsRSMtoLM.t('modelselector1'),
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
			outputModeLabel: { 
				el: new labelVar(config, { 
					label: convertNModelsRSMtoLM.t('outputModeLabel'), 
					h: 6, 
					//style: "mt-3",
				}) 
			},
            outputModeOverride: {
                el: new radioButton(config, {
                    label: convertNModelsRSMtoLM.t('outputModeOverride'),
                    no: "outputMode",
                    increment: "outputModeOverride",
                    value: "override",
                    state: "checked",
                    extraction: "ValueAsIs",
                })
            },
            outputModeNew: {
                el: new radioButton(config, {
                    label: convertNModelsRSMtoLM.t('outputModeNew'),
                    no: "outputMode",
                    increment: "outputModeNew",
                    value: "new",
                    extraction: "ValueAsIs",
                })
            },
            suffix: {
                el: new input(config, {
                    no: 'suffix',
                    label: convertNModelsRSMtoLM.t('suffixLabel'),
					 required: true,
                    placeholder: "rsmTolm",
                    extraction: "TextAsIs",
                    value: "rsmTolm",
					style: "ml-3",
                    type: "character",
                    allow_spaces: false,
					width:"w-25",
                    dependant_objects: ["outputModeNew"],
                })
            },
        }
        const content = {
            items: [
                objects.modelselector1.el.content, 
				objects.outputModeLabel.el.content,
                objects.outputModeOverride.el.content,
                objects.outputModeNew.el.content,
                objects.suffix.el.content,
            ],
            nav: {
                name: convertNModelsRSMtoLM.t('navigation'),
                icon: "icon-sigma-n",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: convertNModelsRSMtoLM.t('help.title'),
            r_help: convertNModelsRSMtoLM.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: convertNModelsRSMtoLM.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new convertNModelsRSMtoLM().render()
}

