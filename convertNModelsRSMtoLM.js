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
require(quantreg)
require(nnet)
require(survival)
require(survminer)

# Helper to extract terms
bsky_flag_uncovered_model_frame_vars <- function(model) {
	
	bsky_get_model_orig_dataset_name <- function(model) {
			data_call <- model$call$data
			if (is.null(data_call)) {
			return(NA_character_)
		}

		deparse(data_call)
	}

	bsky_dataset_exists_in_global <- function(dataset_name) {
		exists(dataset_name, envir = .GlobalEnv, inherits = FALSE) &&
		is.data.frame(get(dataset_name, envir = .GlobalEnv))
	}


	orig_model_dataset_found = FALSE
	all_terms_covered_in_model = FALSE
	bsky_original_model_dataset_name = NA

	f <- formula(model)

	# Response
	response <- all.vars(f[[2]])

	# All variables used anywhere
	vars <- setdiff(all.vars(f), response)

	# RHS term labels (verbatim)
	rhs_terms <- attr(terms(f), "term.labels")

	# 1. Variables covered by interactions (x:y)
	interaction_vars <- unique(unlist(strsplit(
		rhs_terms[grepl(":", rhs_terms)],
		":"
	)))

	# 2. Variables covered by FO(), SO(), TWI()
	rsm_vars <- unique(unlist(lapply(
		rhs_terms[grepl("^(FO|SO|TWI)\\\\(", rhs_terms)],
		function(x) all.vars(str2lang(x))
	)))

	# 3. Variables covered by standalone main effects
	#    (must be a bare symbol, not I(), not function())
	main_effect_vars <- rhs_terms[
		grepl("^[[:alnum:]_\\\\.]+$", rhs_terms)
	]

	covered_vars <- unique(c(
		interaction_vars,
		rsm_vars,
		main_effect_vars
	))

	# Variables NOT covered per your definition
	terms_not_found = setdiff(vars, covered_vars)
	
	bsky_original_model_dataset_name = bsky_get_model_orig_dataset_name(model)
	if(length(terms_not_found) > 0){
		#bsky_original_model_dataset_name = bsky_get_model_orig_dataset_name(model)
		if(!is.na(bsky_original_model_dataset_name)){
			orig_model_dataset_found = bsky_dataset_exists_in_global(bsky_original_model_dataset_name)
		}
	}else{
		all_terms_covered_in_model = TRUE
	}
	
	invisible(return(list(all_terms_covered_in_model = all_terms_covered_in_model, 
	                      orig_model_dataset_found = orig_model_dataset_found, 
						  orig_dataset_name = bsky_original_model_dataset_name,
						  orig_dataset_open = orig_model_dataset_found,
						  missing_terms = terms_not_found
						  )))
}

# Helper to extract terms
bsky_create_df_from_model_frame <- function(model) {
	## ---- Step 0: basic objects ----
	f        <- formula(model)
	tm       <- terms(model)
	
	bsky_missing_model_terms_test = bsky_flag_uncovered_model_frame_vars(model)
		
	if(bsky_missing_model_terms_test$all_terms_covered_in_model == FALSE && bsky_missing_model_terms_test$orig_model_dataset_found == TRUE){
		#cat(paste0("Warning: Using the open the dataset: ", bsky_missing_model_terms_test$orig_dataset_name, " in the datagrid that was used to build the selcted model: ",'{{selected.modelSelection | safe}}',"n"))
		
		mf = get(bsky_missing_model_terms_test$orig_dataset_name)
		
		all_model_vars = all.vars(formula(model))
		# keep only variables that exist in data
		all_model_vars <- all_model_vars[all_model_vars %in% names(mf)]
		# extract in model order
		mf = mf[, all_model_vars, drop = FALSE] 
		
		expanded_model_df <- mf
		recreate_orig_dataset_used <- mf
	}else{
		mf <- model.frame(model)
		expanded_model_df <- do.call(data.frame, mf)
	
	
		#BSkyFormat(head(expanded_model_df,2))

		response <- all.vars(f[[2]])
		all_vars <- setdiff(all.vars(f), response)


		term_labels <- attr(tm, "term.labels")

		## ---- Step 1: determine which variables are VALIDLY covered ----
		## Covered if they appear:
		##  - as a standalone main effect
		##  - in an interaction (x:y)
		##  - inside FO(), SO(), TWI()

		# Interaction variables (safe: ':' is never legal in variable names)
		interaction_vars <- unique(unlist(strsplit(
			term_labels[grepl(":", term_labels)],
			":",
			fixed = TRUE
		)))

		# FO / SO / TWI variables
		rsm_vars <- unique(unlist(lapply(
			term_labels[grepl("^(FO|SO|TWI)\\\\(", term_labels)],
			function(x) all.vars(str2lang(x))
		)))

		# Standalone main effects (literal symbols only)
		main_effect_vars <- term_labels[
			!grepl(":", term_labels) &
			!grepl("^I\\\\(", term_labels) &
			!grepl("^(FO|SO|TWI)\\\\(", term_labels)
		]

		covered_vars <- unique(c(
			main_effect_vars,
			interaction_vars,
			rsm_vars
		))

		## ---- Step 2: variables we actually want to extract ----
		target_vars <- intersect(all_vars, covered_vars)
	  
		target_vars <- c(response, target_vars)

		## ---- Step 3: collect literal + encoded columns together ----
		cn <- names(expanded_model_df)

		# suffix after last dot
		suffix_after_last_dot <- function(x) sub(".*\\\\.", "", x)

		suffix <- suffix_after_last_dot(cn)

		# polynomial columns (Temp.2, x.3, ...)
		is_poly <- grepl("\\\\.[0-9]+$", cn)

		# map each column to a base variable (or NA)
		col_base_var <- ifelse(
		  cn %in% target_vars,
		  cn,                                   # literal term
		  ifelse(
			suffix %in% target_vars & !is_poly, # encoded SO/FO/TWI term
			suffix,
			NA_character_
		  )
		)

		# collect all relevant columns
		# keep only the FIRST occurrence of each base variable
		keep_idx <- tapply(
		  seq_along(col_base_var),
		  col_base_var,
		  function(idx) idx[1]
		)
	  
		recreate_orig_dataset_used <- expanded_model_df[, keep_idx, drop = FALSE]
		names(recreate_orig_dataset_used) <- names(keep_idx)

		recreate_orig_dataset_used = recreate_orig_dataset_used[, c(response, setdiff(names(recreate_orig_dataset_used), response)), drop = FALSE]
	}
	
	#BSkyFormat(head(recreate_orig_dataset_used,2))
	
	invisible(return(recreate_orig_dataset_used))
}

# Helper functions to identify and convert any RSM terms in a model to equivalent LM terms so downstream model evaluation functions can process the converted models

BSkyDetectRsmMacros<- function(model, model_name){
	 # ── 1. Detect RSM macros ──────────────────────────────────────────────────
    formula_str   <- deparse(formula(model), width.cutoff = 500L)
    RSM_MACROS    <- c("FO", "SO", "TWI", "PQ", "PE", "CS", "IS", "RS")
    macro_pattern <- paste0("\\\\b(", paste(RSM_MACROS, collapse = "|"), ")\\\\s*\\\\(")
    has_macros    <- grepl(macro_pattern, formula_str, perl = TRUE)

    if (!has_macros) {
        cat(paste(model_name, "(", class(model)[1], "):  No RSM terms detected. Keeping the original model unchanged"), "\\n")
        return(FALSE)
    } else {
		return(TRUE)
	}
}


BSkyRsmToLm <- function(model, model_name) {

    # ── 0. Resolve dataset: handle simple name OR complex expression ──────────
    # model$call$data may be:
    #   (a) a simple symbol : housing
    #       -> use as.name() directly in the refitted $call
    #   (b) a complex expression: na.omit(housing[, c("Freq","Sat",...)])
    #       -> evaluate it to get the actual data frame (model_dataset)
    #       -> extract the innermost bare name ("housing") for $call$data
    #          so downstream code that inspects $call$data gets a real symbol
    data_call <- model$call$data

    bsky_extract_base_name <- function(expr) {
        if (is.symbol(expr)) return(as.character(expr))
        if (is.call(expr)) {
            for (i in seq_along(expr)) {
                res <- bsky_extract_base_name(expr[[i]])
                if (!is.null(res)) return(res)
            }
        }
        NULL
    }

    if (is.symbol(data_call)) {
        # Simple case: data = housing
        original_dataset_name <- as.character(data_call)
        model_dataset <- tryCatch(
            get(original_dataset_name, envir = .GlobalEnv),
            error = function(e) NULL
        )
        # For refitting: use the simple symbol
        refit_data_arg <- as.name(original_dataset_name)
    } else {
        # Complex case: data = na.omit(housing[, c(...)])
        # Evaluate to get the real data frame
        model_dataset <- tryCatch(
            eval(data_call, envir = .GlobalEnv),
            error = function(e) NULL
        )
        # Extract base name for metadata/messages
        original_dataset_name <- bsky_extract_base_name(data_call)
        if (is.null(original_dataset_name)) original_dataset_name <- deparse(data_call, width.cutoff = 200L)

        # For refitting we MUST pass the evaluated data frame directly —
        # passing the complex expression as $call$data fails because it is
        # not a resolvable object in .GlobalEnv. We inject model_dataset into
        # a local environment and use a fresh local symbol ".bsky_refit_data".
        refit_data_arg <- as.name(".bsky_refit_data")
    }

    # ── 1. Detect RSM macros ──────────────────────────────────────────────────
    formula_str   <- deparse(formula(model), width.cutoff = 500L)
    RSM_MACROS    <- c("FO", "SO", "TWI", "PQ", "PE", "CS", "IS", "RS")
    macro_pattern <- paste0("\\\\b(", paste(RSM_MACROS, collapse = "|"), ")\\\\s*\\\\(")
    has_macros    <- grepl(macro_pattern, formula_str, perl = TRUE)

    if (!has_macros) {
        cat(paste(model_name, "(", class(model)[1], "):  No RSM terms detected. Keeping the original model unchanged"), "\\n")
        return(model)
    }

    cat(paste(model_name, "(", class(model)[1], "):   RSM terms in the model formula detected"), "\\n")

    # ── 2. Expand macro term labels into individual lm-compatible terms ───────
    expand_label <- function(lab) {
        macro <- sub("\\\\s*\\\\(.*", "", lab)
        if (macro %in% RSM_MACROS) {
            vars <- tryCatch(
                all.vars(str2lang(lab)),
                error = function(e) { warning("Could not parse macro label: ", lab); character(0) }
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
                { warning("Macro '", macro, "' expansion not fully defined — treating as FO."); fo_terms }
            )
        } else {
            lab
        }
    }

    # ── 3. Expand term labels ─────────────────────────────────────────────────
    tlabs_raw <- attr(terms(model), "term.labels")
    tlabs     <- unique(unlist(lapply(tlabs_raw, expand_label)))
    if (length(tlabs) == 0) stop("No terms could be extracted from the model after macro expansion.")

    # ── 4. Build the expanded formula ─────────────────────────────────────────
    # Use deparse() on the raw LHS object — not as.character() — so compound
    # response expressions like Surv(time, event) are preserved intact.
    resp_lhs    <- deparse(formula(model)[[2]], width.cutoff = 500L)
    new_formula <- as.formula(paste(resp_lhs, "~", paste(tlabs, collapse = " + ")))

    cat(paste(model_name, ":  Original formula"), "\\n", formula_str, "\\n")
    cat(paste(model_name, ":  Converted formula"), "\\n", deparse(new_formula, width.cutoff = 500L), "\\n")

    # ── 5. Recover data ───────────────────────────────────────────────────────
    # Three-tier fallback:
    #   1. bsky_create_df_from_model_frame()  - handles RSM coded data
    #   2. model_dataset already evaluated above - covers complex data= args
    #   3. model.frame(model) - last resort
    model_data <- tryCatch(
        bsky_create_df_from_model_frame(model),
        error = function(e) {
            if (!is.null(model_dataset)) model_dataset
            else tryCatch(
                model.frame(model),
                error = function(e2) stop("Could not extract model data: ", e$message)
            )
        }
    )

    rhs_vars     <- unique(unlist(lapply(tlabs,
        function(t) tryCatch(all.vars(str2lang(t)), error = function(e) character(0)))))
    missing_vars <- setdiff(rhs_vars, names(model_data))
    if (length(missing_vars) > 0) {
        stop("Variables in converted formula not found in data: ",
             paste(missing_vars, collapse = ", "),
             "\\nCheck that '", original_dataset_name, "' is available in .GlobalEnv.")
    }

    # ── 6. Refit — preserve model class and all original parameters ───────────
    # We use do.call(fn_obj, args) rather than eval(call) because eval() looks
    # up the function name as a symbol in the calling environment, which fails
    # for functions in loaded-but-not-attached packages (e.g. quantreg::rq).
    # do.call() with an actual function object bypasses symbol lookup entirely.
    #
    # Function resolution strategy — in order:
    #   1. Namespace-qualified call (MASS::polr, quantreg::rq) — eval directly.
    #   2. Search all loaded namespaces for the plain function name.
    #   3. match.fun() / get() as last resort.
    model_fn_call <- model$call[[1]]
    model_fn_name <- deparse(model_fn_call)

    model_fn_obj <- tryCatch({
        if (is.call(model_fn_call) &&
            deparse(model_fn_call[[1]]) %in% c("::", ":::")) {
            # Already namespace-qualified: eval() handles :: correctly
            eval(model_fn_call)
        } else {
            fn_str <- as.character(model_fn_call)
            # Search all loaded namespaces for the function
            loaded <- loadedNamespaces()
            found_pkg <- NULL
            for (ns in loaded) {
                if (tryCatch(exists(fn_str, envir = asNamespace(ns),
                                    inherits = FALSE),
                             error = function(e) FALSE)) {
                    found_pkg <- ns
                    break
                }
            }
            if (!is.null(found_pkg)) {
                getFromNamespace(fn_str, found_pkg)
            } else {
                tryCatch(match.fun(fn_str),
                    error = function(e)
                        get(fn_str, envir = .GlobalEnv, inherits = TRUE))
            }
        }
    }, error = function(e) NULL)

    if (is.null(model_fn_obj) || !is.function(model_fn_obj))
        stop("Could not resolve model function '", model_fn_name,
             "'. Make sure the required package is installed and loaded.")

    # Resolve data object directly (not as a symbol)
    refit_data <- if (is.symbol(data_call)) {
        get(original_dataset_name, envir = .GlobalEnv)
    } else {
        model_dataset
    }

    # Build arg list: all original args with formula and data swapped
    orig_args         <- as.list(model$call)[-1]
    orig_args$formula <- new_formula
    orig_args$data    <- refit_data

    new_model <- tryCatch(
        do.call(model_fn_obj, orig_args),
        error = function(e) {
            # rsm() rejects macro-free formulas — fall back to lm().
            # Only pass args lm() accepts; drop model-specific ones
            # (tau, method, ties, family etc.) to avoid spurious warnings.
            warning(paste0(model_name,
                ": Original model function rejected the expanded formula (",
                conditionMessage(e), "). Falling back to lm()."))
            lm_safe_args <- c("weights", "subset", "offset", "contrasts")
            fb_args <- list(formula   = new_formula,
                            data      = refit_data,
                            na.action = na.exclude)
            for (arg_nm in intersect(names(orig_args), lm_safe_args)) {
                fb_args[[arg_nm]] <- orig_args[[arg_nm]]
            }
            do.call(lm, fb_args)
        }
    )

    # Patch $call: do.call does not populate $call — restore from original
    tryCatch({
        new_model$call         <- model$call
        new_model$call$formula <- new_formula
        new_model$call$data    <- refit_data_arg
    }, error = function(e) NULL)

    # ── 7. Set BlueSky metadata attributes ────────────────────────────────────
    tryCatch({
        live_dataset <- if (!is.null(model_dataset)) model_dataset else
            tryCatch(get(original_dataset_name, envir = .GlobalEnv),
                     error = function(e) model.frame(model))

        dep_var_name  <- all.vars(formula(new_model)[[2]])[1]
        indep_names   <- tryCatch(
            bsky_get_numeric_predictors(model = new_model, data = live_dataset),
            error = function(e) {
                all_f_vars <- all.vars(formula(new_model))
                intersect(setdiff(all_f_vars, all.vars(formula(new_model)[[2]])), names(live_dataset))
            }
        )
        indep_in_data <- intersect(indep_names, names(live_dataset))

        # Copy existing BSky attrs from source model, then recompute critical ones
        for (attr_nm in c("classDepVar", "depVarSample", "indepVars", "depVar",
                          "datasetName", "classIndepVars")) {
            attr_val <- attr(model, attr_nm)
            if (!is.null(attr_val)) attr(new_model, attr_nm) <- attr_val
        }
        if (dep_var_name %in% names(live_dataset)) {
            attr(new_model, "classDepVar")  <- class(live_dataset[[dep_var_name]])
            attr(new_model, "depVarSample") <- live_dataset[[dep_var_name]]
        }
        attr(new_model, "depVar")       <- dep_var_name
        attr(new_model, "indepVars")    <- indep_in_data
        attr(new_model, "datasetName")  <- original_dataset_name
        if (length(indep_in_data) > 0) {
            attr(new_model, "classIndepVars") <- sapply(
                live_dataset[, indep_in_data, drop = FALSE], class)
        }
    }, error = function(e) {
        warning("BSkyRsmToLm: Could not set BSky metadata attributes: ", e$message)
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
			cat(paste0("  -> Saved as: ", bsky_output_name, "as model type ( ", class(bsky_converted)[1], " )\n"))
			
			#clean up
			if(!is.null(bsky_converted)) rm(bsky_converted)
	}
}
            `,
            pre_start_r: JSON.stringify({
                //modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"rsm\", \"glm\",  \"multinom\",\"polr\",\"rq\",\"coxph\"), returnClassTrain=FALSE)", 
				modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",   \"rsm\", \"rlm\",  \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\", \"survfit\", \"flexsurvreg\", \"lmerModLmerTest\", \"polr\",\"rq\",\"multinom\",\"loess\"), returnClassTrain=FALSE)",

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
                    //state: "checked",
                    extraction: "ValueAsIs",
                })
            },
            outputModeNew: {
                el: new radioButton(config, {
                    label: convertNModelsRSMtoLM.t('outputModeNew'),
                    no: "outputMode",
                    increment: "outputModeNew",
                    value: "new",
					state: "checked",
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

